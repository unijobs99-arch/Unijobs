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
    { label: t.hrSolutions, desc: t.hrSolutionsDesc, icon: "zap" as const, path: "/hr", bg: "#6366F1" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: topPad, paddingBottom: botPad + 16 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
          <Feather name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleArea}>
        <Text style={[styles.title, { color: c.text }]}>{t.selectRole}</Text>
        <Text style={[styles.subtitle, { color: c.mutedForeground }]}>Choose how you want to use UniJobs</Text>
      </View>

      <View style={styles.cardsContainer}>
        {roles.map((r) => (
          <TouchableOpacity
            key={r.label}
            style={[styles.card, { backgroundColor: r.bg }]}
            onPress={() => router.push(r.path as any)}
            activeOpacity={0.85}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconBg}>
                <Feather name={r.icon} size={36} color="#fff" />
              </View>
              <View style={styles.cardTextArea}>
                <Text style={styles.cardTitle}>{r.label}</Text>
                <Text style={styles.cardDesc}>{r.desc}</Text>
              </View>
              <Feather name="arrow-right" size={22} color="rgba(255,255,255,0.7)" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { paddingVertical: 8 },
  titleArea: { paddingVertical: 18, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 6, textAlign: "center" },
  cardsContainer: { flex: 1, gap: 10, justifyContent: "center", paddingBottom: 16 },
  card: { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 22, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardContent: { alignItems: "center", gap: 12 },
  cardIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  cardTextArea: { alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 22, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  cardDesc: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: "90%" },
});
