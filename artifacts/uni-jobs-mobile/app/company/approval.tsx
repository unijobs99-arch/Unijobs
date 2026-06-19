import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import colors from "@/constants/colors";

export default function CompanyApprovalScreen() {
  const { session } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = insets.top;
  const [refreshing, setRefreshing] = useState(false);
  const [companyStatus, setCompanyStatus] = useState<string>("pending");

  const handleRefresh = useCallback(async () => {
    if (!session.companyId) return;
    setRefreshing(true);
    try {
      const company = await api.getCompany(session.companyId);
      setCompanyStatus(company.status);
      if (company.status === "approved") {
        router.replace("/company/dashboard");
        return;
      }
    } catch (error: any) {
      console.error("[APPROVAL SCREEN] Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [router, session.companyId]);

  const statusMessage = companyStatus === "rejected"
    ? "This account has been rejected. Please contact support if you believe this is an error."
    : "An administrator will review your request. You will be able to access the dashboard once your account is approved.";

  return (
    <ScrollView
      contentContainerStyle={[styles.outer, { backgroundColor: c.background, paddingTop: topPad + 16 }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.primary} />
      }
    >
      <View style={styles.card}>
        <Text style={styles.title}>Your company account is awaiting approval.</Text>
        <Text style={styles.sub}>{statusMessage}</Text>
        <Text style={styles.status}>Current status: {companyStatus}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { padding: 24, borderRadius: 12, backgroundColor: "#fff", margin: 16, maxWidth: 720 },
  title: { fontSize: 18, fontWeight: "700" as const, marginBottom: 12 },
  sub: { fontSize: 14, color: "#444" },
  status: { marginTop: 16, fontSize: 13, color: "#666" },
});
