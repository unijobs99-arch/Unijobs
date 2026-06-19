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
import { CATEGORIES, EDUCATION } from "@/constants/strings";

type Tab = "register" | "login";
type FieldErrors = Record<string, string>;

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

function validateRegister(form: typeof EMPTY_FORM, t: any): FieldErrors {
  const e: FieldErrors = {};
  if (!form.name.trim()) e.name = t.fieldRequired;
  if (!form.fatherName.trim()) e.fatherName = t.fieldRequired;
  if (!/^\d{10}$/.test(form.phone)) e.phone = t.invalidPhone;
  if (!/^\d{12}$/.test(form.aadhaar)) e.aadhaar = t.invalidAadhaar;
  if (!form.uan.trim()) e.uan = t.fieldRequired;
  if (!form.address.trim()) e.address = t.fieldRequired;
  if (!form.state.trim()) e.state = t.fieldRequired;
  if (!form.city.trim()) e.city = t.fieldRequired;
  if (!form.area.trim()) e.area = t.fieldRequired;
  if (!form.experience.trim()) e.experience = t.fieldRequired;
  return e;
}

const EMPTY_FORM = {
  name: "", fatherName: "", phone: "", aadhaar: "", uan: "",
  address: "", state: INDIAN_STATES[0], city: "", area: "", education: EDUCATION[1], experience: "", category: CATEGORIES[0],
};

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loginPhone, setLoginPhone] = useState("");
  const [loginError, setLoginError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Refs for keyboard focus chain
  const fatherNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const aadhaarRef = useRef<TextInput>(null);
  const uanRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const areaRef = useRef<TextInput>(null);
  const experienceRef = useRef<TextInput>(null);

  function setField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
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
      const w = await api.registerWorker(form as any);
      await setSession({ role: "worker", workerId: w._id });
      router.replace("/worker/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  async function handleLogin() {
    if (!/^\d{10}$/.test(loginPhone)) {
      setLoginError(t.invalidPhone);
      return;
    }
    setLoginError(""); setLoading(true);
    try {
      const w = await api.loginWorker(loginPhone);
      await setSession({ role: "worker", workerId: w._id });
      router.replace("/worker/dashboard");
    } catch (e: any) {
      setLoginError(e.message);
    } finally { setLoading(false); }
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
          <TouchableOpacity
            key={tb}
            style={[styles.tab, tab === tb && { borderBottomColor: c.primary, borderBottomWidth: 2 }]}
            onPress={() => { setTab(tb); setError(""); setFieldErrors({}); setLoginError(""); }}
          >
            <Text style={[styles.tabText, { color: tab === tb ? c.primary : c.mutedForeground }]}>
              {tb === "register" ? t.register : t.loginByPhone}
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
            <Text style={[styles.hint, { color: c.mutedForeground }]}>{t.enterPhone}</Text>
            <Field
              autoFocus
              label={t.phone}
              value={loginPhone}
              onChangeText={(v: string) => { setLoginPhone(v); setLoginError(""); }}
              keyboardType="phone-pad"
              placeholder="10-digit mobile number"
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              error={loginError}
              c={c}
            />
            <PrimaryButton
              label={loading ? t.loading : t.find}
              onPress={handleLogin}
              disabled={loading}
              c={c}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Field
              label={t.name}
              value={form.name}
              onChangeText={(v: string) => setField("name", v)}
              returnKeyType="next"
              onSubmitEditing={() => fatherNameRef.current?.focus()}
              error={fieldErrors.name}
              c={c}
            />
            <Field
              ref={fatherNameRef}
              label={t.fatherName}
              value={form.fatherName}
              onChangeText={(v: string) => setField("fatherName", v)}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              error={fieldErrors.fatherName}
              c={c}
            />
            <Field
              ref={phoneRef}
              label={t.phone}
              value={form.phone}
              onChangeText={(v: string) => setField("phone", v)}
              keyboardType="phone-pad"
              placeholder="10-digit mobile number"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => aadhaarRef.current?.focus()}
              error={fieldErrors.phone}
              c={c}
            />
            <Field
              ref={aadhaarRef}
              label={t.aadhaar}
              value={form.aadhaar}
              onChangeText={(v: string) => setField("aadhaar", v)}
              keyboardType="number-pad"
              placeholder="12-digit Aadhaar"
              maxLength={12}
              returnKeyType="next"
              onSubmitEditing={() => uanRef.current?.focus()}
              error={fieldErrors.aadhaar}
              c={c}
            />
            <Field
              ref={uanRef}
              label={t.uan}
              value={form.uan}
              onChangeText={(v: string) => setField("uan", v)}
              placeholder="Universal Account Number"
              returnKeyType="next"
              onSubmitEditing={() => cityRef.current?.focus()}
              error={fieldErrors.uan}
              c={c}
            />
            <Field
              label={t.address}
              value={form.address}
              onChangeText={(v: string) => setField("address", v)}
              multiline
              returnKeyType="default"
              error={fieldErrors.address}
              c={c}
            />
            <PickerField
              label="State"
              value={form.state}
              options={INDIAN_STATES}
              onSelect={(v: string) => setField("state", v)}
              c={c}
            />
            <Field
              ref={cityRef}
              label={t.city}
              value={form.city}
              onChangeText={(v: string) => setField("city", v)}
              returnKeyType="next"
              onSubmitEditing={() => areaRef.current?.focus()}
              error={fieldErrors.city}
              c={c}
            />
            <Field
              ref={areaRef}
              label="Area"
              value={form.area}
              onChangeText={(v: string) => setField("area", v)}
              returnKeyType="next"
              onSubmitEditing={() => experienceRef.current?.focus()}
              error={fieldErrors.area}
              c={c}
            />
            <PickerField
              label={t.education}
              value={form.education}
              options={EDUCATION}
              onSelect={(v: string) => setField("education", v)}
              c={c}
            />
            <Field
              ref={experienceRef}
              label={t.experience}
              value={form.experience}
              onChangeText={(v: string) => setField("experience", v)}
              placeholder="e.g. 2 years"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={fieldErrors.experience}
              c={c}
            />
            <PickerField
              label={t.category}
              value={form.category}
              options={CATEGORIES}
              onSelect={(v: string) => setField("category", v)}
              c={c}
            />
            <PrimaryButton
              label={loading ? t.loading : t.register}
              onPress={handleRegister}
              disabled={loading}
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
    <View style={[eBannerStyle.box, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}>
      <Feather name="alert-circle" size={15} color={c.destructive} />
      <Text style={[eBannerStyle.text, { color: c.destructive }]}>{message}</Text>
    </View>
  );
}
const eBannerStyle = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  text: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
});

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  returnKeyType?: any;
  onSubmitEditing?: () => void;
  error?: string;
  autoFocus?: boolean;
  c: typeof colors.light;
}

const Field = React.forwardRef<TextInput, FieldProps>(
  ({ label, value, onChangeText, keyboardType, placeholder, multiline, maxLength,
     returnKeyType, onSubmitEditing, error, autoFocus, c }, ref) => (
    <View style={fStyles.wrap}>
      <Text style={[fStyles.label, { color: error ? c.destructive : c.mutedForeground }]}>{label}</Text>
      <TextInput
        ref={ref}
        style={[
          fStyles.input,
          { borderColor: error ? c.destructive : c.border, backgroundColor: c.card, color: c.text },
          !!multiline && { height: 88, textAlignVertical: "top", paddingTop: 12 },
        ]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        placeholder={placeholder ?? ""}
        placeholderTextColor={c.mutedForeground}
        multiline={!!multiline}
        maxLength={maxLength}
        returnKeyType={multiline ? "default" : (returnKeyType ?? "next")}
        onSubmitEditing={!multiline ? onSubmitEditing : undefined}
        blurOnSubmit={!onSubmitEditing || !!multiline}
        autoFocus={!!autoFocus}
      />
      {!!error && (
        <Text style={[fStyles.errorText, { color: c.destructive }]}>{error}</Text>
      )}
    </View>
  ),
);

function PickerField({ label, value, options, onSelect, c }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={fStyles.wrap}>
      <Text style={[fStyles.label, { color: c.mutedForeground }]}>{label}</Text>
      <TouchableOpacity
        style={[fStyles.input, fStyles.picker, { borderColor: c.border, backgroundColor: c.card }]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={{ color: c.text, fontFamily: "Inter_400Regular", fontSize: 15 }}>{value}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color={c.mutedForeground} />
      </TouchableOpacity>
      {open && (
        <View style={[fStyles.dropdown, { backgroundColor: c.card, borderColor: c.border }]}>
          {options.map((o: string) => (
            <TouchableOpacity
              key={o}
              style={[fStyles.dropItem, { borderBottomColor: c.border }, o === value && { backgroundColor: c.primaryLight }]}
              onPress={() => { onSelect(o); setOpen(false); }}
            >
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
    <TouchableOpacity
      style={[fStyles.btn, { backgroundColor: disabled ? c.muted : c.primary }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {disabled
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={[fStyles.btnText, { color: c.primaryForeground }]}>{label}</Text>}
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

const fStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 7 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 50 },
  picker: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdown: { borderWidth: 1, borderRadius: 10, overflow: "hidden", marginTop: 4 },
  dropItem: { paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1 },
  btn: { borderRadius: 14, paddingVertical: 17, alignItems: "center", marginTop: 8, minHeight: 54 },
  btnText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 5 },
});
