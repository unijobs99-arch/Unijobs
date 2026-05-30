import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

export default function RoleScreen() {
  const { t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const roles = [
    { label: t.worker, desc: t.workerDesc, icon: "user" as const, path: "/worker/register", bg: c.primary },
    { label: t.employer, desc: t.employerDesc, icon: "briefcase" as const, path: "/company/register", bg: "#065F46" },
    { label: t.admin, desc: t.adminDesc, icon: "shield" as const, path: "/admin", bg: "#1F2937" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: topPad, paddingBottom: botPad + 16 }]}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
          <Feather name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerArea}>
        <Text style={[styles.title, { color: c.text }]}>{t.selectRole}</Text>
      </View>
      <View style={styles.cards}>
        {roles.map((r) => (
          <TouchableOpacity
            key={r.label}
            style={[styles.card, { backgroundColor: r.bg }]}
            onPress={() => router.push(r.path as any)}
            activeOpacity={0.85}
          >
            <View style={styles.cardIcon}>
              <Feather name={r.icon} size={28} color="#fff" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{r.label}</Text>
              <Text style={styles.cardDesc}>{r.desc}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topRow: { paddingTop: 8, paddingBottom: 4 },
  headerArea: { flex: 1, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  cards: { gap: 12, paddingBottom: 8 },
  card: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 20, gap: 16 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  cardDesc: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", marginTop: 2 },
});
