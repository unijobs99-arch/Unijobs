import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import { api } from "@/lib/api";
import { CATEGORIES, EDUCATION } from "@/constants/strings";

type Tab = "register" | "login";

export default function WorkerRegisterScreen() {
  const { t, setSession } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [tab, setTab] = useState<Tab>("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginPhone, setLoginPhone] = useState("");

  const [form, setForm] = useState({
    name: "", fatherName: "", phone: "", aadhaar: "", uan: "",
    address: "", city: "", education: EDUCATION[1], experience: "", category: CATEGORIES[0],
  });

  function setField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleRegister() {
    setError(""); setLoading(true);
    try {
      const w = await api.registerWorker(form as any);
      await setSession({ role: "worker", workerId: w._id });
      router.replace("/worker/dashboard");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleLogin() {
    setError(""); setLoading(true);
    try {
      const w = await api.loginWorker(loginPhone);
      await setSession({ role: "worker", workerId: w._id });
      router.replace("/worker/dashboard");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={[styles.outer, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: c.primary }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.workerRegistration}</Text>
      </View>

      <View style={[styles.tabRow, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        {(["register", "login"] as Tab[]).map((tb) => (
          <TouchableOpacity key={tb} style={[styles.tab, tab === tb && { borderBottomColor: c.primary, borderBottomWidth: 2 }]}
            onPress={() => { setTab(tb); setError(""); }}>
            <Text style={[styles.tabText, { color: tab === tb ? c.primary : c.mutedForeground }]}>
              {tb === "register" ? t.register : t.loginByPhone}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]} keyboardShouldPersistTaps="handled">
        {!!error && (
          <View style={[styles.errorBox, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}>
            <Text style={{ color: c.destructive, fontSize: 14, fontFamily: "Inter_400Regular" }}>{error}</Text>
          </View>
        )}

        {tab === "login" ? (
          <View style={styles.section}>
            <Field label={t.phone} value={loginPhone} onChangeText={setLoginPhone} keyboardType="phone-pad" placeholder={t.enterPhone} c={c} />
            <PrimaryButton label={loading ? t.loading : t.find} onPress={handleLogin} disabled={loading} c={c} />
          </View>
        ) : (
          <View style={styles.section}>
            <Field label={t.name} value={form.name} onChangeText={(v) => setField("name", v)} c={c} />
            <Field label={t.fatherName} value={form.fatherName} onChangeText={(v) => setField("fatherName", v)} c={c} />
            <Field label={t.phone} value={form.phone} onChangeText={(v) => setField("phone", v)} keyboardType="phone-pad" c={c} />
            <Field label={t.aadhaar} value={form.aadhaar} onChangeText={(v) => setField("aadhaar", v)} keyboardType="number-pad" c={c} />
            <Field label={t.uan} value={form.uan} onChangeText={(v) => setField("uan", v)} c={c} />
            <Field label={t.address} value={form.address} onChangeText={(v) => setField("address", v)} multiline c={c} />
            <Field label={t.city} value={form.city} onChangeText={(v) => setField("city", v)} c={c} />
            <PickerField label={t.education} value={form.education} options={EDUCATION} onSelect={(v) => setField("education", v)} c={c} />
            <Field label={t.experience} value={form.experience} onChangeText={(v) => setField("experience", v)} placeholder="e.g. 2 years" c={c} />
            <PickerField label={t.category} value={form.category} options={CATEGORIES} onSelect={(v) => setField("category", v)} c={c} />
            <PrimaryButton label={loading ? t.loading : t.register} onPress={handleRegister} disabled={loading} c={c} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, keyboardType, placeholder, multiline, c }: any) {
  return (
    <View style={fStyles.wrap}>
      <Text style={[fStyles.label, { color: c.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[fStyles.input, { borderColor: c.border, backgroundColor: c.card, color: c.text }, multiline && { height: 80, textAlignVertical: "top" }]}
        value={value} onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        placeholder={placeholder || ""}
        placeholderTextColor={c.mutedForeground}
        multiline={!!multiline}
      />
    </View>
  );
}

function PickerField({ label, value, options, onSelect, c }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={fStyles.wrap}>
      <Text style={[fStyles.label, { color: c.mutedForeground }]}>{label}</Text>
      <TouchableOpacity style={[fStyles.input, fStyles.picker, { borderColor: c.border, backgroundColor: c.card }]} onPress={() => setOpen(!open)}>
        <Text style={{ color: c.text, fontFamily: "Inter_400Regular", fontSize: 15 }}>{value}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={c.mutedForeground} />
      </TouchableOpacity>
      {open && (
        <View style={[fStyles.dropdown, { backgroundColor: c.card, borderColor: c.border }]}>
          {options.map((o: string) => (
            <TouchableOpacity key={o} style={[fStyles.dropItem, { borderBottomColor: c.border }, o === value && { backgroundColor: c.primaryLight }]}
              onPress={() => { onSelect(o); setOpen(false); }}>
              <Text style={{ color: o === value ? c.primary : c.text, fontFamily: "Inter_400Regular", fontSize: 15 }}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled, c }: any) {
  return (
    <TouchableOpacity style={[fStyles.btn, { backgroundColor: disabled ? c.muted : c.primary }]} onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      {disabled ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[fStyles.btnText, { color: c.primaryForeground }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const c2 = colors.light;
const styles = StyleSheet.create({
  outer: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 20 },
  section: { gap: 4 },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
});

const fStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  picker: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdown: { borderWidth: 1, borderRadius: 10, overflow: "hidden", marginTop: 4 },
  dropItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  btn: { borderRadius: 14, paddingVertical: 17, alignItems: "center", marginTop: 8 },
  btnText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
