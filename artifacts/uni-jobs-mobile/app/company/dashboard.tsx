import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import { api, type Company, type Requirement, type Worker } from "@/lib/api";
import { CATEGORIES } from "@/constants/strings";

type Tab = "search" | "post" | "requirements";

export default function CompanyDashboard() {
  const { t, session, clearSession } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("search");

  // Search state
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Post requirement state
  const [postForm, setPostFormState] = useState({ title: "", description: "", category: CATEGORIES[0], city: "", vacancies: "1" });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState(false);

  // Requirements state
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [reqLoading, setReqLoading] = useState(false);

  const fetchCompany = useCallback(async () => {
    if (!session.companyId) return;
    try {
      const co = await api.getCompany(session.companyId);
      setCompany(co);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [session.companyId]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  async function handleSearch() {
    if (!session.companyId) return;
    setSearching(true); setSearched(false);
    try {
      const result = await api.searchWorkers(session.companyId, filterCategory || undefined, filterCity || undefined);
      setWorkers(result); setSearched(true);
    } catch {}
    finally { setSearching(false); }
  }

  async function fetchRequirements() {
    if (!session.companyId) return;
    setReqLoading(true);
    try {
      const reqs = await api.getCompanyRequirements(session.companyId);
      setRequirements(reqs);
    } catch {}
    finally { setReqLoading(false); }
  }

  useEffect(() => { if (tab === "requirements") fetchRequirements(); }, [tab]);

  function setPF(k: string, v: string) { setPostFormState((f) => ({ ...f, [k]: v })); }

  async function handlePost() {
    if (!session.companyId) return;
    setPosting(true); setPostError(""); setPostSuccess(false);
    try {
      await api.postRequirement({ ...postForm, companyId: session.companyId as any, vacancies: Number(postForm.vacancies) });
      setPostSuccess(true);
      setPostFormState({ title: "", description: "", category: CATEGORIES[0], city: "", vacancies: "1" });
    } catch (e: any) { setPostError(e.message); }
    finally { setPosting(false); }
  }

  async function handleLogout() { await clearSession(); router.replace("/"); }

  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.background }}><ActivityIndicator color={c.primary} size="large" /></View>;

  const accent = "#065F46";

  return (
    <View style={[styles.outer, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: accent }]}>
        <View>
          <Text style={styles.headerTitle}>{company?.companyName || t.dashboard}</Text>
          <StatusBadge status={company?.status || "pending"} t={t} />
        </View>
        <TouchableOpacity onPress={handleLogout} hitSlop={12}>
          <Feather name="log-out" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {company?.status !== "approved" ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <View style={[styles.statusCard, { borderColor: c.border, backgroundColor: c.card }]}>
            <Feather name={company?.status === "rejected" ? "x-circle" : "clock"} size={44} color={company?.status === "rejected" ? c.destructive : c.warning} style={{ marginBottom: 14 }} />
            <Text style={[styles.statusMsg, { color: c.text }]}>
              {company?.status === "rejected" ? t.rejectedMsg : t.pendingMsg}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.tabRow, { borderBottomColor: c.border }]}>
            {([["search", t.searchWorkers], ["post", t.postRequirement], ["requirements", t.myRequirements]] as [Tab, string][]).map(([tb, label]) => (
              <TouchableOpacity key={tb} style={[styles.tab, tab === tb && { borderBottomColor: accent, borderBottomWidth: 2 }]} onPress={() => setTab(tb)}>
                <Text style={[styles.tabText, { color: tab === tb ? accent : c.mutedForeground }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === "search" && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: botPad + 24 }} keyboardShouldPersistTaps="handled">
              <PickerInline label={t.filterCategory} value={filterCategory} options={["", ...CATEGORIES]} onSelect={setFilterCategory} c={c} accent={accent} placeholder={t.allCategories} />
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 }}>{t.filterCity}</Text>
                <TextInput style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", backgroundColor: c.card, color: c.text }}
                  value={filterCity} onChangeText={setFilterCity} placeholder={t.filterCity} placeholderTextColor={c.mutedForeground} />
              </View>
              <TouchableOpacity style={{ borderRadius: 14, paddingVertical: 16, alignItems: "center", backgroundColor: searching ? c.muted : accent }} onPress={handleSearch} disabled={searching} activeOpacity={0.85}>
                {searching ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ fontSize: 15, fontWeight: "600" as const, color: "#fff", fontFamily: "Inter_600SemiBold" }}>{t.search}</Text>}
              </TouchableOpacity>
              {searched && (
                <View style={{ marginTop: 20, gap: 12 }}>
                  {workers.length === 0 ? (
                    <View style={{ alignItems: "center", paddingTop: 32 }}>
                      <Feather name="users" size={36} color={c.mutedForeground} />
                      <Text style={{ color: c.mutedForeground, marginTop: 10, fontFamily: "Inter_400Regular" }}>{t.noWorkers}</Text>
                    </View>
                  ) : workers.map((w) => <WorkerCard key={w._id} worker={w} c={c} />)}
                </View>
              )}
            </ScrollView>
          )}

          {tab === "post" && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: botPad + 24 }} keyboardShouldPersistTaps="handled">
              {postSuccess && (
                <View style={{ backgroundColor: c.successLight, borderWidth: 1, borderColor: "#86EFAC", borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <Text style={{ color: c.success, fontFamily: "Inter_500Medium" }}>Requirement posted successfully!</Text>
                </View>
              )}
              {!!postError && (
                <View style={{ backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FCA5A5", borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <Text style={{ color: c.destructive, fontFamily: "Inter_400Regular", fontSize: 14 }}>{postError}</Text>
                </View>
              )}
              <InlineField label={t.reqTitle} value={postForm.title} onChangeText={(v: string) => setPF("title", v)} c={c} />
              <InlineField label={t.reqDescription} value={postForm.description} onChangeText={(v: string) => setPF("description", v)} c={c} multiline />
              <PickerInline label={t.category} value={postForm.category} options={CATEGORIES} onSelect={(v: string) => setPF("category", v)} c={c} accent={accent} />
              <InlineField label={t.reqCity} value={postForm.city} onChangeText={(v: string) => setPF("city", v)} c={c} />
              <InlineField label={t.reqVacancies} value={postForm.vacancies} onChangeText={(v: string) => setPF("vacancies", v)} c={c} keyboardType="number-pad" />
              <TouchableOpacity style={{ borderRadius: 14, paddingVertical: 16, alignItems: "center", backgroundColor: posting ? c.muted : accent, marginTop: 8 }} onPress={handlePost} disabled={posting} activeOpacity={0.85}>
                {posting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ fontSize: 15, fontWeight: "600" as const, color: "#fff", fontFamily: "Inter_600SemiBold" }}>{t.post}</Text>}
              </TouchableOpacity>
            </ScrollView>
          )}

          {tab === "requirements" && (
            reqLoading ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={c.primary} /></View>
            ) : (
              <FlatList
                data={requirements}
                keyExtractor={(i) => i._id}
                contentContainerStyle={{ padding: 16, paddingBottom: botPad + 24, gap: 12 }}
                refreshControl={<RefreshControl refreshing={false} onRefresh={fetchRequirements} />}
                ListEmptyComponent={<View style={{ alignItems: "center", paddingTop: 60 }}><Feather name="inbox" size={40} color={c.mutedForeground} /><Text style={{ color: c.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>{t.noRequirements}</Text></View>}
                renderItem={({ item }) => <ReqCard req={item} c={c} />}
              />
            )
          )}
        </>
      )}
    </View>
  );
}

function StatusBadge({ status, t }: any) {
  const label = status === "approved" ? t.approved : status === "rejected" ? t.rejected : t.pending;
  return <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium", marginTop: 2 }}>{label}</Text>;
}

function WorkerCard({ worker, c }: any) {
  return (
    <View style={[wStyles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[wStyles.avatar, { backgroundColor: c.primaryLight }]}>
        <Text style={[wStyles.avatarText, { color: c.primary }]}>{worker.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[wStyles.name, { color: c.text }]}>{worker.name}</Text>
        <Text style={[wStyles.sub, { color: c.mutedForeground }]}>{worker.category} · {worker.city}</Text>
        <Text style={[wStyles.sub, { color: c.mutedForeground }]}>{worker.phone}</Text>
      </View>
      <View style={[wStyles.badge, { backgroundColor: c.primaryLight }]}>
        <Text style={[wStyles.badgeText, { color: c.primary }]}>{worker.experience}</Text>
      </View>
    </View>
  );
}

function ReqCard({ req, c }: any) {
  return (
    <View style={[wStyles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[wStyles.name, { color: c.text }]}>{req.title}</Text>
        <Text style={[wStyles.sub, { color: c.mutedForeground }]}>{req.category} · {req.city}</Text>
        <Text style={[{ color: "#16A34A", fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 }]}>{req.vacancies} vacancies</Text>
      </View>
    </View>
  );
}

function InlineField({ label, value, onChangeText, c, multiline, keyboardType }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 }}>{label}</Text>
      <TextInput style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", backgroundColor: c.card, color: c.text, ...(multiline ? { height: 80, textAlignVertical: "top" } : {}) }}
        value={value} onChangeText={onChangeText} multiline={!!multiline} keyboardType={keyboardType || "default"} />
    </View>
  );
}

function PickerInline({ label, value, options, onSelect, c, accent, placeholder }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: c.card, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} onPress={() => setOpen(!open)}>
        <Text style={{ color: value ? c.text : c.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 15 }}>{value || placeholder || value}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={c.mutedForeground} />
      </TouchableOpacity>
      {open && (
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, overflow: "hidden", marginTop: 4, backgroundColor: c.card }}>
          {options.map((o: string) => (
            <TouchableOpacity key={o || "__all"} style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: o === value ? c.primaryLight : c.card }}
              onPress={() => { onSelect(o); setOpen(false); }}>
              <Text style={{ color: o === value ? (accent || c.primary) : c.text, fontFamily: "Inter_400Regular", fontSize: 15 }}>{o || placeholder}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 20, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, backgroundColor: "#fff" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  statusCard: { borderWidth: 1, borderRadius: 20, padding: 32, alignItems: "center", width: "100%" },
  statusMsg: { fontSize: 16, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 24 },
});

const wStyles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, padding: 14, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  name: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
