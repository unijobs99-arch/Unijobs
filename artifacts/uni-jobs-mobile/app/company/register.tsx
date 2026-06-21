import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import { api } from "@/lib/api";

type Tab = "register" | "login";
type FieldErrors = Record<string, string>;

const ACCENT = "#065F46";

function validateRegister(form: { companyName: string; ownerName: string; email: string; phone: string; password: string }, t: any): FieldErrors {
  const e: FieldErrors = {};
  if (!form.companyName.trim()) e.companyName = t.fieldRequired;
  if (!form.ownerName.trim()) e.ownerName = t.fieldRequired;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.invalidEmail;
  if (!form.phone.trim()) e.phone = t.fieldRequired;
  if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
  return e;
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [form, setFormState] = useState({ companyName: "", ownerName: "", email: "", phone: "", password: "" });

  const ownerRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const loginPasswordRef = useRef<TextInput>(null);

  function setField(k: string, v: string) {
    setFormState((f) => ({ ...f, [k]: v }));
    if (fieldErrors[k]) setFieldErrors((e) => ({ ...e, [k]: "" }));
  }

  async function handleRegister() {
    const errors = validateRegister(form, t);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setError(""); setLoading(true);
    try {
      const co = await api.registerCompany(form);
      await setSession({ role: "company", companyId: co._id });
      router.replace("/company/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  async function handleLogin() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setLoginError(t.invalidEmail);
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setLoginError("Password must be at least 6 characters");
      return;
    }
    setLoginError(""); setLoading(true);
    try {
      const co = await api.loginCompany(loginEmail, loginPassword);
      await setSession({ role: "company", companyId: co._id });
      router.replace("/company/dashboard");
    } catch (e: any) {
      setLoginError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <View style={[styles.outer, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: ACCENT }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.companyRegistration}</Text>
      </View>

      <View style={[styles.tabRow, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        {(["register", "login"] as Tab[]).map((tb) => (
          <TouchableOpacity
            key={tb}
            style={[styles.tab, tab === tb && { borderBottomColor: ACCENT, borderBottomWidth: 2 }]}
            onPress={() => { setTab(tb); setError(""); setFieldErrors({}); setLoginError(""); }}
          >
            <Text style={[styles.tabText, { color: tab === tb ? ACCENT : c.mutedForeground }]}>
              {tb === "register" ? t.register : t.loginByEmail}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!!error && <ErrorBanner message={error} c={c} />}

        {tab === "login" ? (
          <View style={styles.section}>
            <Text style={[styles.hint, { color: c.mutedForeground }]}>{t.enterEmail}</Text>
            <CField
              autoFocus
              label={t.email}
              value={loginEmail}
              onChangeText={(v: string) => { setLoginEmail(v); setLoginError(""); }}
              keyboardType="email-address"
              placeholder="registered@company.com"
              returnKeyType="next"
              onSubmitEditing={() => loginPasswordRef.current?.focus()}
              c={c}
            />
            <PasswordField
              ref={loginPasswordRef}
              label="Password"
              value={loginPassword}
              onChangeText={(v: string) => { setLoginPassword(v); setLoginError(""); }}
              show={showLoginPassword}
              onToggle={() => setShowLoginPassword(!showLoginPassword)}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              error={loginError}
              c={c}
            />
            <ActionButton
              label={loading ? t.loading : t.find}
              onPress={handleLogin}
              disabled={loading}
              accent={ACCENT}
              c={c}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <CField
              label={t.companyName}
              value={form.companyName}
              onChangeText={(v: string) => setField("companyName", v)}
              placeholder="Company Pvt. Ltd."
              returnKeyType="next"
              onSubmitEditing={() => ownerRef.current?.focus()}
              error={fieldErrors.companyName}
              c={c}
            />
            <CField
              ref={ownerRef}
              label={t.ownerName}
              value={form.ownerName}
              onChangeText={(v: string) => setField("ownerName", v)}
              placeholder="Full name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              error={fieldErrors.ownerName}
              c={c}
            />
            <CField
              ref={emailRef}
              label={t.email}
              value={form.email}
              onChangeText={(v: string) => setField("email", v)}
              keyboardType="email-address"
              placeholder="contact@company.com"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              error={fieldErrors.email}
              c={c}
            />
            <CField
              ref={phoneRef}
              label={t.phone}
              value={form.phone}
              onChangeText={(v: string) => setField("phone", v)}
              keyboardType="phone-pad"
              placeholder="10-digit mobile number"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={fieldErrors.phone}
              c={c}
            />
            <PasswordField
              ref={passwordRef}
              label="Password"
              value={form.password}
              onChangeText={(v: string) => setField("password", v)}
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={fieldErrors.password}
              c={c}
            />
            <ActionButton
              label={loading ? t.loading : t.register}
              onPress={handleRegister}
              disabled={loading}
              accent={ACCENT}
              c={c}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ErrorBanner({ message, c }: any) {
  return (
    <View style={[eBanner.box, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}>
      <Feather name="alert-circle" size={15} color={c.destructive} />
      <Text style={[eBanner.text, { color: c.destructive }]}>{message}</Text>
    </View>
  );
}
const eBanner = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  text: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
});

interface CFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  placeholder?: string;
  maxLength?: number;
  returnKeyType?: any;
  onSubmitEditing?: () => void;
  error?: string;
  autoFocus?: boolean;
  c: typeof colors.light;
}

const CField = React.forwardRef<TextInput, CFieldProps>(
  ({ label, value, onChangeText, keyboardType, placeholder, maxLength,
     returnKeyType, onSubmitEditing, error, autoFocus, c }, ref) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: error ? c.destructive : c.mutedForeground, marginBottom: 7 }}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        style={{
          borderWidth: 1.5,
          borderColor: error ? c.destructive : c.border,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 13,
          fontSize: 15,
          fontFamily: "Inter_400Regular",
          backgroundColor: c.card,
          color: c.text,
          minHeight: 50,
        }}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        placeholder={placeholder ?? ""}
        placeholderTextColor={c.mutedForeground}
        autoCapitalize="none"
        maxLength={maxLength}
        returnKeyType={returnKeyType ?? "next"}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={!onSubmitEditing}
        autoFocus={!!autoFocus}
      />
      {!!error && (
        <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: c.destructive, marginTop: 5 }}>
          {error}
        </Text>
      )}
    </View>
  ),
);

const PasswordField = React.forwardRef<TextInput, any>(
  ({ label, value, onChangeText, show, onToggle, returnKeyType, onSubmitEditing, error, c }, ref) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: error ? c.destructive : c.mutedForeground, marginBottom: 7 }}>
        {label}
      </Text>
      <View style={{
        flexDirection: "row", alignItems: "center",
        borderWidth: 1.5, borderColor: error ? c.destructive : c.border,
        borderRadius: 10, backgroundColor: c.card, minHeight: 50,
      }}>
        <TextInput
          ref={ref}
          style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular", color: c.text }}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          placeholder="Min. 6 characters"
          placeholderTextColor={c.mutedForeground}
          autoCapitalize="none"
          returnKeyType={returnKeyType ?? "done"}
          onSubmitEditing={onSubmitEditing}
        />
        <TouchableOpacity onPress={onToggle} style={{ paddingHorizontal: 14 }} hitSlop={8}>
          <Feather name={show ? "eye-off" : "eye"} size={18} color={c.mutedForeground} />
        </TouchableOpacity>
      </View>
      {!!error && (
        <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: c.destructive, marginTop: 5 }}>
          {error}
        </Text>
      )}
    </View>
  ),
);

function ActionButton({ label, onPress, disabled, accent, c }: any) {
  return (
    <TouchableOpacity
      style={{ borderRadius: 14, paddingVertical: 17, alignItems: "center", marginTop: 8, minHeight: 54, backgroundColor: disabled ? c.muted : accent, justifyContent: "center" }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {disabled
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={{ fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: "#fff" }}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 15, alignItems: "center" },
  tabText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 20 },
  section: { gap: 2 },
  hint: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16, lineHeight: 18 },
});