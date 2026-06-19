import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import { api, type Company, type Worker } from "@/lib/api";

const ACCENT = "#065F46";

export default function WorkerDetailsScreen() {
  const { t } = useApp();
  const { session } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { workerId } = useLocalSearchParams<{ workerId: string }>();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchWorker() {
      if (!workerId) return;
      try {
        const w = await api.getWorker(workerId);
        setWorker(w);
      } catch (e) {
        console.error("Error fetching worker:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchWorker();
  }, [workerId]);

  useEffect(() => {
    async function fetchCompany() {
      if (session?.role !== "company" || !session.companyId) return;
      try {
        const co = await api.getCompany(session.companyId);
        setCompany(co);
      } catch (e) {
        console.error("Error fetching company:", e);
      }
    }
    fetchCompany();
  }, [session]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, paddingTop: topPad }]}>
        <ActivityIndicator color={c.primary} size="large" />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, paddingTop: topPad }]}>
        <Text style={{ color: c.text }}>Worker not found</Text>
      </View>
    );
  }

  const handleCall = () => {
    // Record contact when a company initiates the call
    try {
      if (session?.role === "company" && session.companyId) {
        api.recordContact(session.companyId, worker._id).catch((e) => console.warn("recordContact failed", e));
      }
    } catch (e) {
      console.warn("recordContact error", e);
    }
    Linking.openURL(`tel:${worker.phone}`);
  };

  const normalizeWhatsAppNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return digits;
    return digits;
  };

  const handleWhatsApp = () => {
    const message = "Hello, I'm interested in your services";
    try {
      if (session?.role === "company" && session.companyId) {
        api.recordContact(session.companyId, worker._id).catch((e) => console.warn("recordContact failed", e));
      }
    } catch (e) {
      console.warn("recordContact error", e);
    }
    Linking.openURL(`https://wa.me/${normalizeWhatsAppNumber(worker.phone)}?text=${encodeURIComponent(message)}`);
  };

  const handleEmploymentUpdate = async (status: "available" | "working") => {
    if (!workerId || !session?.companyId) return;

    setActionLoading(true);
    try {
      const companyName = status === "working" ? company?.companyName ?? null : null;
      const updated = await api.updateWorkerEmployment(
        workerId,
        status,
        status === "working" ? session.companyId : null,
        status === "working" ? companyName : null,
      );
      setWorker(updated);
    } catch (e) {
      console.error("Error updating worker employment:", e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View style={[styles.outer, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: ACCENT }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worker Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: botPad + 24 }}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.avatar, { backgroundColor: ACCENT }]}>
            <Text style={styles.avatarText}>{worker.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={[styles.name, { color: c.text }]}>{worker.name}</Text>
            <Text style={[styles.subtitle, { color: c.mutedForeground }]}>{worker.category}</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={{ marginTop: 24 }}>
          <DetailSection label="Experience" value={worker.experience} c={c} />
          <DetailSection label="Education" value={worker.education} c={c} />
          <DetailSection label="Location" value={`${worker.area}, ${worker.city}, ${worker.state}`} c={c} />
          <DetailSection label="Phone Number" value={worker.phone} c={c} />
        </View>

        {/* Status Section (shows employment status) */}
        <View style={{ marginTop: 16 }}>
          <Text style={[styles.label, { color: c.mutedForeground, marginBottom: 6 }]}>Status</Text>
          <View style={[styles.detailValue, { backgroundColor: c.background, borderColor: c.border }]}>
            {worker.employmentStatus === "working" ? (
              <Text style={[styles.value, { color: c.text }]}>🔵 {worker.currentCompanyName ? `Working at ${worker.currentCompanyName}` : `Currently Working`}</Text>
            ) : (
              <Text style={[styles.value, { color: c.text }]}>🟢 Available</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ marginTop: 32, gap: 12 }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: ACCENT }]}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Feather name="phone" size={20} color="#fff" />
            <Text style={styles.buttonText}>Call Worker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#25D366" }]}
            onPress={handleWhatsApp}
            activeOpacity={0.85}
          >
            <Feather name="message-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>WhatsApp Worker</Text>
          </TouchableOpacity>
        </View>

        {session?.role === "company" && session.companyId && (
          <View style={{ marginTop: 24, gap: 12 }}>
            {worker.employmentStatus !== "working" ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: ACCENT }]}
                onPress={() => handleEmploymentUpdate("working")}
                activeOpacity={0.85}
                disabled={actionLoading}
              >
                <Feather name="check-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Mark as Working Here</Text>
              </TouchableOpacity>
            ) : worker.currentCompanyId === session.companyId ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#D97706" }]}
                onPress={() => handleEmploymentUpdate("available")}
                activeOpacity={0.85}
                disabled={actionLoading}
              >
                <Feather name="x-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Remove Employment</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailSection({ label, value, c }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: c.mutedForeground, marginBottom: 6 }]}>{label}</Text>
      <View style={[styles.detailValue, { backgroundColor: c.background, borderColor: c.border }]}>
        <Text style={[styles.value, { color: c.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: "600" as const, color: "#fff", fontFamily: "Inter_600SemiBold" },
  profileCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: "center" },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 36, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  name: { fontSize: 24, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 4 },
  label: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  detailValue: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  value: { fontSize: 15, fontFamily: "Inter_500Medium", fontWeight: "500" as const },
  button: { borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", minHeight: 54, flexDirection: "row", gap: 12 },
  buttonText: { fontSize: 15, fontWeight: "600" as const, color: "#fff", fontFamily: "Inter_600SemiBold" },
});
