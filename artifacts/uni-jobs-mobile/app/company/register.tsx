import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import { api } from "@/lib/api";

type Tab = "register" | "login";

export default function CompanyRegisterScreen() {
  const { t, setSession } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [tab, setTab] = useState<Tab>("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [form, setFormState] = useState({ companyName: "", ownerName: "", email: "", phone: "" });

  function setField(k: string, v: string) { setFormState((f) => ({ ...f, [k]: v })); }

  async function handleRegister() {
    setError(""); setLoading(true);
    try {
      const co = await api.registerCompany(form);
      await setSession({ role: "company", companyId: co._id });
      router.replace("/company/dashboard");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleLogin() {
    setError(""); setLoading(true);
    try {
      const co = await api.loginCompany(loginEmail);
      await setSession({ role: "company", companyId: co._id });
      router.replace("/company/dashboard");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={[styles.outer, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: "#065F46" }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.companyRegistration}</Text>
      </View>

      <View style={[styles.tabRow, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        {(["register", "login"] as Tab[]).map((tb) => (
          <TouchableOpacity key={tb} style={[styles.tab, tab === tb && { borderBottomColor: "#065F46", borderBottomWidth: 2 }]}
            onPress={() => { setTab(tb); setError(""); }}>
            <Text style={[styles.tabText, { color: tab === tb ? "#065F46" : c.mutedForeground }]}>
              {tb === "register" ? t.register : t.loginByEmail}
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
            <FieldC label={t.email} value={loginEmail} onChangeText={setLoginEmail} keyboardType="email-address" placeholder={t.enterEmail} c={c} />
            <BtnC label={loading ? t.loading : t.find} onPress={handleLogin} disabled={loading} accent="#065F46" c={c} />
          </View>
        ) : (
          <View style={styles.section}>
            <FieldC label={t.companyName} value={form.companyName} onChangeText={(v) => setField("companyName", v)} c={c} />
            <FieldC label={t.ownerName} value={form.ownerName} onChangeText={(v) => setField("ownerName", v)} c={c} />
            <FieldC label={t.email} value={form.email} onChangeText={(v) => setField("email", v)} keyboardType="email-address" c={c} />
            <FieldC label={t.phone} value={form.phone} onChangeText={(v) => setField("phone", v)} keyboardType="phone-pad" c={c} />
            <BtnC label={loading ? t.loading : t.register} onPress={handleRegister} disabled={loading} accent="#065F46" c={c} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function FieldC({ label, value, onChangeText, keyboardType, placeholder, c }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: c.mutedForeground, marginBottom: 6 }}>{label}</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", backgroundColor: c.card, color: c.text }}
        value={value} onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        placeholder={placeholder || ""}
        placeholderTextColor={c.mutedForeground}
        autoCapitalize="none"
      />
    </View>
  );
}

function BtnC({ label, onPress, disabled, accent, c }: any) {
  return (
    <TouchableOpacity style={{ borderRadius: 14, paddingVertical: 17, alignItems: "center", marginTop: 8, backgroundColor: disabled ? c.muted : accent }} onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      {disabled ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: "#fff" }}>{label}</Text>}
    </TouchableOpacity>
  );
}

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
