import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import type { Lang } from "@/constants/strings";

export default function LanguageScreen() {
  const { t, setLang } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function pick(l: Lang) {
    await setLang(l);
    router.push("/role");
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: topPad, paddingBottom: botPad + 24 }]}>
      {/* Logo area */}
      <View style={styles.logoArea}>
        <View style={[styles.logoBg, { backgroundColor: c.primaryLight }]}>
          <Text style={[styles.logoText, { color: c.primary }]}>UJ</Text>
        </View>
      </View>

      {/* Content area */}
      <View style={styles.contentArea}>
        <Text style={[styles.appName, { color: c.text }]}>UniJobs</Text>
        <Text style={[styles.subtitle, { color: c.mutedForeground }]}>{t.selectLanguage}</Text>
      </View>

      {/* Language buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.langBtn, { backgroundColor: c.primary }]} onPress={() => pick("en")} activeOpacity={0.85}>
          <Text style={[styles.langText, { color: c.primaryForeground }]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.langBtn, { backgroundColor: c.card, borderWidth: 2, borderColor: c.primary }]} onPress={() => pick("hi")} activeOpacity={0.85}>
          <Text style={[styles.langText, { color: c.primary }]}>हिन्दी</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between" },
  logoArea: { paddingTop: 20, alignItems: "center" },
  logoBg: { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 36, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  contentArea: { alignItems: "center", paddingVertical: 16 },
  appName: { fontSize: 32, fontWeight: "700" as const, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 16, fontFamily: "Inter_400Regular", marginTop: 8, textAlign: "center" },
  buttonsContainer: { gap: 12, paddingBottom: 16 },
  langBtn: { borderRadius: 14, paddingVertical: 18, alignItems: "center" },
  langText: { fontSize: 18, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
