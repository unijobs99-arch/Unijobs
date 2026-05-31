import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import { api, type Requirement, type Worker } from "@/lib/api";
import { CATEGORIES, EDUCATION } from "@/constants/strings";

type Tab = "profile" | "requirements";

export default function WorkerDashboard() {
  const { t, session, clearSession } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [tab, setTab] = useState<Tab>("profile");
  const [worker, setWorker] = useState<Worker | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Worker>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session.workerId) return;
    try {
      const [w, reqs] = await Promise.all([api.getWorker(session.workerId), api.getRequirements()]);
      setWorker(w);
      setEditForm(w);
      setRequirements(reqs);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [session.workerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave() {
    if (!session.workerId || !editForm) return;
    setSaving(true); setError("");
    try {
      const updated = await api.updateWorker(session.workerId, editForm);
      setWorker(updated); setEditing(false);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleToggleAvailability() {
    if (!session.workerId || !worker) return;
    setTogglingAvailability(true);
    try {
      const newStatus = worker.availability === "available" ? "notAvailable" : "available";
      const updated = await api.toggleWorkerAvailability(session.workerId, newStatus);
      setWorker(updated);
    } catch (e: any) { setError(e.message); }
    finally { setTogglingAvailability(false); }
  }

  async function handleLogout() {
    await clearSession(); router.replace("/");
  }

  function setEF(k: string, v: string) { setEditForm((f) => ({ ...f, [k]: v })); }

  if (loading) return <LoadingScreen c={c} topPad={topPad} />;

  return (
    <View style={[styles.outer, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: c.primary }]}>
        <Text style={styles.headerTitle}>{t.myProfile}</Text>
        <TouchableOpacity onPress={handleLogout} hitSlop={12}>
          <Feather name="log-out" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabRow, { borderBottomColor: c.border }]}>
        {(["profile", "requirements"] as Tab[]).map((tb) => (
          <TouchableOpacity key={tb} style={[styles.tab, tab === tb && { borderBottomColor: c.primary, borderBottomWidth: 2 }]} onPress={() => setTab(tb)}>
            <Text style={[styles.tabText, { color: tab === tb ? c.primary : c.mutedForeground }]}>
              {tb === "profile" ? t.myProfile : t.requirements}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!!error && (
        <View style={{ margin: 16, padding: 12, backgroundColor: "#FEE2E2", borderRadius: 10, borderWidth: 1, borderColor: "#FCA5A5" }}>
          <Text style={{ color: c.destructive, fontSize: 14 }}>{error}</Text>
        </View>
      )}

      {tab === "profile" ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: botPad + 24 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>
          {!editing ? (
            <ProfileView worker={worker} onEdit={() => setEditing(true)} onToggleAvailability={handleToggleAvailability} toggling={togglingAvailability} t={t} c={c} />
          ) : (
            <EditForm form={editForm} setField={setEF} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving} t={t} c={c} />
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={requirements}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, paddingBottom: botPad + 24, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
          ListEmptyComponent={<EmptyState label={t.noRequirements} c={c} />}
          renderItem={({ item }) => <RequirementCard req={item} c={c} />}
        />
      )}
    </View>
  );
}

function ProfileView({ worker, onEdit, onToggleAvailability, toggling, t, c }: any) {
  if (!worker) return null;
  
  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar || aadhaar.length < 4) return aadhaar;
    return "*".repeat(aadhaar.length - 4) + aadhaar.slice(-4);
  };
  
  const rows = [
    { label: t.phone, value: worker.phone },
    { label: t.aadhaar, value: maskAadhaar(worker.aadhaar) },
    { label: t.uan, value: worker.uan },
    { label: t.city, value: worker.city },
    { label: t.education, value: worker.education },
    { label: t.experience, value: worker.experience },
    { label: t.address, value: worker.address },
  ];
  return (
    <View>
      <View style={[pStyles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={[pStyles.avatar, { backgroundColor: c.primaryLight }]}>
          <Text style={[pStyles.avatarText, { color: c.primary }]}>{worker.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[pStyles.name, { color: c.text }]}>{worker.name}</Text>
        <View style={[pStyles.badge, { backgroundColor: c.primaryLight }]}>
          <Text style={[pStyles.badgeText, { color: c.primary }]}>{worker.category}</Text>
        </View>
        <View style={[pStyles.statusBadge, { backgroundColor: worker.availability === "available" ? "#DCFCE7" : "#FEE2E2" }]}>
          <Text style={[pStyles.statusText, { color: worker.availability === "available" ? "#166534" : "#991B1B" }]}>
            {worker.availability === "available" ? "Available" : "Not Available"}
          </Text>
        </View>
      </View>
      {rows.map((r) => (
        <View key={r.label} style={[pStyles.row, { borderBottomColor: c.border }]}>
          <Text style={[pStyles.rowLabel, { color: c.mutedForeground }]}>{r.label}</Text>
          <Text style={[pStyles.rowValue, { color: c.text }]}>{r.value}</Text>
        </View>
      ))}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
        <TouchableOpacity style={[pStyles.editBtn, { backgroundColor: c.primary, flex: 1 }]} onPress={onEdit} activeOpacity={0.85}>
          <Feather name="edit-2" size={16} color="#fff" />
          <Text style={pStyles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[pStyles.toggleBtn, { backgroundColor: worker.availability === "available" ? "#DCFCE7" : "#FEE2E2", flex: 1 }]} 
          onPress={onToggleAvailability}
          disabled={toggling}
          activeOpacity={0.85}>
          {toggling ? <ActivityIndicator color={worker.availability === "available" ? "#166534" : "#991B1B"} size="small" /> : (
            <>
              <Feather name={worker.availability === "available" ? "check-circle" : "circle"} size={16} color={worker.availability === "available" ? "#166534" : "#991B1B"} />
              <Text style={[pStyles.toggleBtnText, { color: worker.availability === "available" ? "#166534" : "#991B1B" }]}>
                {worker.availability === "available" ? "Available" : "Unavailable"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EditForm({ form, setField, onSave, onCancel, saving, t, c }: any) {
  const fatherRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const experienceRef = useRef<TextInput>(null);

  return (
    <View>
      {/* Name */}
      <EditFieldRow label={t.name} value={form.name || ""} onChangeText={(v: string) => setField("name", v)}
        returnKeyType="next" onSubmitEditing={() => fatherRef.current?.focus()} c={c} />
      {/* Father name */}
      <EditFieldRow ref={fatherRef} label={t.fatherName} value={form.fatherName || ""} onChangeText={(v: string) => setField("fatherName", v)}
        returnKeyType="next" onSubmitEditing={() => cityRef.current?.focus()} c={c} />
      {/* Address (multiline — no chain) */}
      <EditFieldRow label={t.address} value={form.address || ""} onChangeText={(v: string) => setField("address", v)} multiline c={c} />
      {/* City */}
      <EditFieldRow ref={cityRef} label={t.city} value={form.city || ""} onChangeText={(v: string) => setField("city", v)}
        returnKeyType="next" onSubmitEditing={() => experienceRef.current?.focus()} c={c} />
      {/* Experience */}
      <EditFieldRow ref={experienceRef} label={t.experience} value={form.experience || ""} onChangeText={(v: string) => setField("experience", v)}
        returnKeyType="done" onSubmitEditing={onSave} c={c} />

      <PickerRow label={t.category} value={form.category} options={CATEGORIES} onSelect={(v: string) => setField("category", v)} c={c} />
      <PickerRow label={t.education} value={form.education} options={EDUCATION} onSelect={(v: string) => setField("education", v)} c={c} />

      <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
        <TouchableOpacity style={{ flex: 1, borderRadius: 14, paddingVertical: 16, minHeight: 54, alignItems: "center", justifyContent: "center", backgroundColor: c.secondary }} onPress={onCancel} activeOpacity={0.85}>
          <Text style={{ fontSize: 15, fontWeight: "600" as const, color: c.text, fontFamily: "Inter_600SemiBold" }}>{t.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, borderRadius: 14, paddingVertical: 16, minHeight: 54, alignItems: "center", justifyContent: "center", backgroundColor: saving ? c.muted : c.primary }} onPress={onSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ fontSize: 15, fontWeight: "600" as const, color: "#fff", fontFamily: "Inter_600SemiBold" }}>{t.save}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const EditFieldRow = React.forwardRef<TextInput, any>(
  ({ label, value, onChangeText, multiline, returnKeyType, onSubmitEditing, c }, ref) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 7 }}>{label}</Text>
      <TextInput
        ref={ref}
        style={{ borderWidth: 1.5, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular", backgroundColor: c.card, color: c.text, minHeight: 50, ...(multiline ? { height: 88, textAlignVertical: "top" as const, paddingTop: 12 } : {}) }}
        value={value}
        onChangeText={onChangeText}
        multiline={!!multiline}
        returnKeyType={multiline ? "default" : (returnKeyType ?? "next")}
        onSubmitEditing={!multiline ? onSubmitEditing : undefined}
        blurOnSubmit={!onSubmitEditing || !!multiline}
      />
    </View>
  ),
);

function PickerRow({ label, value, options, onSelect, c }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: c.card, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} onPress={() => setOpen(!open)}>
        <Text style={{ color: c.text, fontFamily: "Inter_400Regular", fontSize: 15 }}>{value}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={c.mutedForeground} />
      </TouchableOpacity>
      {open && (
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, overflow: "hidden", marginTop: 4, backgroundColor: c.card }}>
          {options.map((o: string) => (
            <TouchableOpacity key={o} style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: o === value ? c.primaryLight : c.card }}
              onPress={() => { onSelect(o); setOpen(false); }}>
              <Text style={{ color: o === value ? c.primary : c.text, fontFamily: "Inter_400Regular", fontSize: 15 }}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function RequirementCard({ req, c }: any) {
  const co = req.companyId;
  return (
    <View style={[rStyles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={rStyles.topRow}>
        <Text style={[rStyles.title, { color: c.text }]}>{req.title}</Text>
        <View style={[rStyles.badge, { backgroundColor: c.primaryLight }]}>
          <Text style={[rStyles.badgeText, { color: c.primary }]}>{req.category}</Text>
        </View>
      </View>
      <Text style={[rStyles.company, { color: c.mutedForeground }]}>{co?.companyName || "Company"} · {req.city}</Text>
      {!!req.description && <Text style={[rStyles.desc, { color: c.mutedForeground }]}>{req.description}</Text>}
      <Text style={[rStyles.vacancies, { color: c.success }]}>{req.vacancies} vacancies</Text>
    </View>
  );
}

function EmptyState({ label, c }: any) {
  return (
    <View style={{ alignItems: "center", paddingTop: 60 }}>
      <Feather name="inbox" size={40} color={c.mutedForeground} />
      <Text style={{ color: c.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular", fontSize: 15 }}>{label}</Text>
    </View>
  );
}

function LoadingScreen({ c, topPad }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: c.background, alignItems: "center", justifyContent: "center", paddingTop: topPad }}>
      <ActivityIndicator color={c.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 22, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, backgroundColor: "#fff" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});

const pStyles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  name: { fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginBottom: 8 },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginTop: 10 },
  statusText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
  rowLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1, textAlign: "right" },
  editBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 16 },
  editBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  toggleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 16 },
  toggleBtnText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});

const rStyles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  title: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  company: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  desc: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  vacancies: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 4 },
});
