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
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: topPad, paddingBottom: botPad + 16 }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>{t.selectLanguage}</Text>
      </View>
      <View style={styles.buttons}>
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
  container: { flex: 1, paddingHorizontal: 24 },
  header: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700" as const, fontFamily: "Inter_700Bold", textAlign: "center" },
  buttons: { gap: 14, paddingBottom: 8 },
  langBtn: { borderRadius: 14, paddingVertical: 20, alignItems: "center" },
  langText: { fontSize: 20, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
