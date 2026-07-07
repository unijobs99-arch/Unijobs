import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import { api, type Company, type Worker } from "@/lib/api";

type AdminTab = "companies" | "workers";

export default function AdminScreen() {
  const { t, session, setSession, clearSession } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const isLoggedIn = session.role === "admin" && !!session.adminSecret;
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<AdminTab>("companies");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pagination states
  const [companiesPage, setCompaniesPage] = useState(1);
  const [companiesHasMore, setCompaniesHasMore] = useState(true);
  const [loadingMoreCompanies, setLoadingMoreCompanies] = useState(false);

  const [workersPage, setWorkersPage] = useState(1);
  const [workersHasMore, setWorkersHasMore] = useState(true);
  const [loadingMoreWorkers, setLoadingMoreWorkers] = useState(false);

  const handleAuthError = useCallback(async () => {
    await AsyncStorage.removeItem("admin_token");
    await clearSession();
  }, [clearSession]);

  const fetchCompanies = useCallback(async (page: number, isRefresh = false) => {
    if (!session.adminSecret) return;
    if (page === 1) {
      if (!isRefresh) setLoading(true);
    } else {
      setLoadingMoreCompanies(true);
    }

    try {
      const res = await api.adminGetCompanies(undefined, page, 20);
      const newCompanies = res.companies || [];
      setCompanies((prev) => (page === 1 ? newCompanies : [...prev, ...newCompanies]));
      setCompaniesPage(page);
      setCompaniesHasMore(page * 20 < res.total);
    } catch (err: any) {
      if (err.status === 401 || err.message === "Missing admin token") {
        await handleAuthError();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMoreCompanies(false);
    }
  }, [session.adminSecret, handleAuthError]);

  const fetchWorkers = useCallback(async (page: number, isRefresh = false) => {
    if (!session.adminSecret) return;
    if (page === 1) {
      if (!isRefresh) setLoading(true);
    } else {
      setLoadingMoreWorkers(true);
    }

    try {
      const res = await api.adminGetWorkers(page, 20);
      const newWorkers = res.workers || [];
      setWorkers((prev) => (page === 1 ? newWorkers : [...prev, ...newWorkers]));
      setWorkersPage(page);
      setWorkersHasMore(page * 20 < res.total);
    } catch (err: any) {
      if (err.status === 401 || err.message === "Missing admin token") {
        await handleAuthError();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMoreWorkers(false);
    }
  }, [session.adminSecret, handleAuthError]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCompanies(1, true),
      fetchWorkers(1, true),
    ]);
  }, [fetchCompanies, fetchWorkers]);

  useEffect(() => { if (isLoggedIn) handleRefresh(); }, [isLoggedIn, handleRefresh]);

  async function handleLogin() {
    setLoginError(""); setLoginLoading(true);
    try {
      const res = await api.adminLogin(password);
      await AsyncStorage.setItem("admin_token", res.token);
      await setSession({ role: "admin", adminSecret: res.token });
    } catch { setLoginError(t.wrongPassword); }
    finally { setLoginLoading(false); }
  }

  async function handleUpdateStatus(id: string, status: "approved" | "rejected") {
    if (!session.adminSecret) return;
    setUpdatingId(id);
    try {
      const updated = await api.adminUpdateStatus(id, status);
      setCompanies((cs) => cs.map((co) => co._id === id ? updated : co));
    } catch (err: any) {
      if (err.status === 401 || err.message === "Missing admin token") {
        await handleAuthError();
      }
    } finally { setUpdatingId(null); }
  }

  async function handleLogout() {
    await AsyncStorage.removeItem("admin_token");
    await clearSession();
    router.replace("/");
  }

  const headerBg = c.primary; // Dark navy #0F172A
  const accent = c.accent; // Purple #7C3AED

  if (!isLoggedIn) {
    return (
      <View style={[styles.outer, { backgroundColor: c.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: headerBg }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.adminLogin}</Text>
        </View>
        <View style={[styles.loginContainer, { paddingBottom: botPad + 32 }]}>
          <View style={[styles.loginCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.lockIcon, { backgroundColor: "#F3F4F6" }]}>
              <Feather name="lock" size={32} color={accent} />
            </View>
            <Text style={[styles.loginTitle, { color: c.text }]}>{t.adminLogin}</Text>
            {!!loginError && (
              <View style={{ backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FCA5A5", borderRadius: 10, padding: 10, width: "100%", marginBottom: 8 }}>
                <Text style={{ color: c.destructive, fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" }}>{loginError}</Text>
              </View>
            )}
            <TextInput
              style={[styles.loginInput, { borderColor: c.border, backgroundColor: c.background, color: c.text }]}
              value={password} onChangeText={setPassword}
              placeholder={t.adminPassword} placeholderTextColor={c.mutedForeground}
              secureTextEntry autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.loginBtn, { backgroundColor: loginLoading ? c.muted : accent }]} onPress={handleLogin} disabled={loginLoading} activeOpacity={0.85}>
              {loginLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.loginBtnText}>{t.login}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.outer, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: headerBg }]}>
        <Text style={styles.headerTitle}>{t.adminPanel || "Admin Panel"}</Text>
        <TouchableOpacity onPress={handleLogout} hitSlop={12}>
          <Feather name="log-out" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabRow, { borderBottomColor: c.border }]}>
        {([["companies", t.companies], ["workers", t.allWorkers]] as [AdminTab, string][]).map(([tb, label]) => (
          <TouchableOpacity key={tb} style={[styles.tab, tab === tb && { borderBottomColor: accent, borderBottomWidth: 2 }]} onPress={() => setTab(tb)}>
            <Text style={[styles.tabText, { color: tab === tb ? accent : c.mutedForeground }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={c.primary} size="large" /></View>
      ) : tab === "companies" ? (
        <FlatList
          data={companies}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, paddingBottom: botPad + 24, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={<EmptyState label="No companies yet" c={c} />}
          renderItem={({ item }) => (
            <CompanyRow co={item} onApprove={() => handleUpdateStatus(item._id, "approved")}
              onReject={() => handleUpdateStatus(item._id, "rejected")}
              updating={updatingId === item._id} t={t} c={c} />
          )}
          onEndReached={() => {
            if (companiesHasMore && !loadingMoreCompanies && !loading) {
              fetchCompanies(companiesPage + 1);
            }
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() => loadingMoreCompanies ? <ActivityIndicator color={accent} style={{ marginVertical: 10 }} /> : null}
        />
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, paddingBottom: botPad + 24, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={<EmptyState label="No workers yet" c={c} />}
          renderItem={({ item }) => <WorkerRow worker={item} c={c} />}
          onEndReached={() => {
            if (workersHasMore && !loadingMoreWorkers && !loading) {
              fetchWorkers(workersPage + 1);
            }
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() => loadingMoreWorkers ? <ActivityIndicator color={accent} style={{ marginVertical: 10 }} /> : null}
        />
      )}
    </View>
  );
}

function CompanyRow({ co, onApprove, onReject, updating, t, c }: any) {
  const statusColor = co.status === "approved" ? c.success : co.status === "rejected" ? c.destructive : c.warning;
  const statusBg = co.status === "approved" ? c.successLight : co.status === "rejected" ? "#FEE2E2" : c.warningLight;
  return (
    <View style={[cStyles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={cStyles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={[cStyles.name, { color: c.text }]}>{co.companyName}</Text>
          <Text style={[cStyles.sub, { color: c.mutedForeground }]}>{co.ownerName} · {co.phone}</Text>
          <Text style={[cStyles.sub, { color: c.mutedForeground }]}>{co.email}</Text>
        </View>
        <View style={[cStyles.badge, { backgroundColor: statusBg }]}>
          <Text style={[cStyles.badgeText, { color: statusColor }]}>
            {co.status === "approved" ? t.approved : co.status === "rejected" ? t.rejected : t.pending}
          </Text>
        </View>
      </View>
      {co.status === "pending" && (
        <View style={cStyles.btnRow}>
          <TouchableOpacity style={[cStyles.actionBtn, { backgroundColor: c.successLight, borderColor: "#86EFAC" }]}
            onPress={onApprove} disabled={updating} activeOpacity={0.85}>
            {updating ? <ActivityIndicator color={c.success} size="small" /> : <Text style={[cStyles.actionText, { color: c.success }]}>{t.approve}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[cStyles.actionBtn, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}
            onPress={onReject} disabled={updating} activeOpacity={0.85}>
            {updating ? <ActivityIndicator color={c.destructive} size="small" /> : <Text style={[cStyles.actionText, { color: c.destructive }]}>{t.reject}</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function WorkerRow({ worker, c }: any) {
  return (
    <View style={[cStyles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={cStyles.topRow}>
        <View style={[cStyles.avatar, { backgroundColor: c.primaryLight }]}>
          <Text style={[cStyles.avatarText, { color: c.primary }]}>{worker.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[cStyles.name, { color: c.text }]}>{worker.name}</Text>
          <Text style={[cStyles.sub, { color: c.mutedForeground }]}>{worker.category} · {worker.city}</Text>
          <Text style={[cStyles.sub, { color: c.mutedForeground }]}>{worker.phone}</Text>
        </View>
      </View>
    </View>
  );
}

function EmptyState({ label, c }: any) {
  return (
    <View style={{ alignItems: "center", paddingTop: 60 }}>
      <Feather name="inbox" size={40} color={c.mutedForeground} />
      <Text style={{ color: c.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular", fontSize: 15 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 20, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, backgroundColor: "#fff" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  loginContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  loginCard: { width: "100%", borderWidth: 1, borderRadius: 20, padding: 28, alignItems: "center" },
  lockIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  loginTitle: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginBottom: 20 },
  loginInput: { width: "100%", borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 14 },
  loginBtn: { width: "100%", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});

const cStyles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  name: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  actionText: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
