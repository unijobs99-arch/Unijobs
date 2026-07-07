import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";
import { api, type Company, type Requirement, type Worker } from "@/lib/api";
import { CATEGORIES } from "@/constants/strings";
import { router as navigRouter } from "expo-router";

type Tab = "search" | "workforce";

export default function CompanyDashboard() {
  const { t, session, clearSession } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("search");

  // Search state
  const [filterCategory, setFilterCategory] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);



  const [workforce, setWorkforce] = useState<Worker[]>([]);
  const [workforceLoading, setWorkforceLoading] = useState(false);

  const fetchCompany = useCallback(async () => {
    if (!session.companyId) return;
    try {
      const co = await api.getCompany(session.companyId);
      setCompany(co);
    } catch (e: any) {
      if (e?.status === 403) {
        router.replace("/company/approval");
        return;
      }
      console.error("[DASHBOARD] Error fetching company:", e);
    }
    finally { setLoading(false); setRefreshing(false); }
  }, [session.companyId]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  async function handleSearch() {
    if (!session.companyId) return;
    setSearching(true); setSearched(false);
    try {
      const result = await api.searchWorkers(
        session.companyId,
        filterCategory || undefined,
        filterState || undefined,
        filterCity || undefined,
        filterArea || undefined,
      );
      setWorkers(result); setSearched(true);
    } catch (e: any) {
      if (e?.status === 403) {
        router.replace("/company/approval");
        return;
      }
      console.error("[DASHBOARD] Error searching workers:", e);
    }
    finally { setSearching(false); }
  }

  async function fetchWorkforce() {
    if (!session.companyId) return;
    setWorkforceLoading(true);
    try {
      const workers = await api.getCompanyWorkforce(session.companyId);
      setWorkforce(workers);
    } catch (e: any) {
      if (e?.status === 403) {
        router.replace("/company/approval");
        return;
      }
      console.error("[DASHBOARD] Error fetching workforce:", e);
    }
    finally { setWorkforceLoading(false); }
  }

  useEffect(() => { if (tab === "workforce") fetchWorkforce(); }, [tab]);

  async function handleLogout() { await clearSession(); router.replace("/"); }

  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.background }}><ActivityIndicator color={c.primary} size="large" /></View>;

  const headerBg = c.primary; // Dark navy #0F172A
  const accent = c.accent; // Purple #7C3AED

  return (
    <View style={[styles.outer, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: headerBg }]}>
        <View>
          <Text style={styles.headerTitle}>{company?.companyName || t.dashboard}</Text>
          <StatusBadge status={company?.status || "pending"} t={t} />
        </View>
        <TouchableOpacity onPress={handleLogout} hitSlop={12}>
          <Feather name="log-out" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {company?.status !== "approved" ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <View style={[styles.statusCard, { borderColor: c.border, backgroundColor: c.card }]}>
            <Feather name={company?.status === "rejected" ? "x-circle" : "clock"} size={44} color={company?.status === "rejected" ? c.destructive : c.warning} style={{ marginBottom: 14 }} />
            <Text style={[styles.statusMsg, { color: c.text }]}>
              {company?.status === "rejected" ? t.rejectedMsg : t.pendingMsg}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.tabRow, { borderBottomColor: c.border }]}>
            {([["search", t.searchTab], ["workforce", t.workforce]] as [Tab, string][]).map(([tb, label]) => (
              <TouchableOpacity key={tb} style={[styles.tab, tab === tb && { borderBottomColor: accent, borderBottomWidth: 2 }]} onPress={() => setTab(tb)}>
                <Text style={[styles.tabText, { color: tab === tb ? accent : c.mutedForeground }]} numberOfLines={1}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === "search" && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: botPad + 24 }} keyboardShouldPersistTaps="handled">
              {/* Filter Panel */}
              <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 16, backgroundColor: c.card, padding: 14, marginBottom: 20 }}>
                {/* Category Filter */}
                <View style={{ marginBottom: 14 }}>
                  <PickerInline label={t.filterCategory} value={filterCategory} options={["", ...CATEGORIES]} onSelect={setFilterCategory} c={c} accent={accent} placeholder={t.allCategories} />
                </View>
                
                {/* State Filter */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 13, color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 }}>State</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", backgroundColor: c.background, color: c.text, minHeight: 44 }}
                    value={filterState} onChangeText={setFilterState} placeholder="State" placeholderTextColor={c.mutedForeground}
                    returnKeyType="search" onSubmitEditing={handleSearch} />
                </View>
                
                {/* City Filter */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 13, color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 }}>{t.filterCity}</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", backgroundColor: c.background, color: c.text, minHeight: 44 }}
                    value={filterCity} onChangeText={setFilterCity} placeholder={t.filterCity} placeholderTextColor={c.mutedForeground}
                    returnKeyType="search" onSubmitEditing={handleSearch} />
                </View>
                
                {/* Area Filter */}
                <View style={{ marginBottom: 0 }}>
                  <Text style={{ fontSize: 13, color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 }}>Area</Text>
                  <TextInput style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", backgroundColor: c.background, color: c.text, minHeight: 44 }}
                    value={filterArea} onChangeText={setFilterArea} placeholder="Area" placeholderTextColor={c.mutedForeground}
                    returnKeyType="search" onSubmitEditing={handleSearch} />
                </View>
              </View>

              {/* Search Button */}
              <TouchableOpacity style={{ borderRadius: 12, paddingVertical: 14, alignItems: "center", backgroundColor: searching ? c.muted : accent, minHeight: 48, justifyContent: "center", marginBottom: 20 }} onPress={handleSearch} disabled={searching} activeOpacity={0.85}>
                {searching ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ fontSize: 15, fontWeight: "600" as const, color: "#fff", fontFamily: "Inter_600SemiBold" }}>{t.search}</Text>}
              </TouchableOpacity>

              {/* Results Section */}
              {searched && (
                <View style={{ gap: 12 }}>
                  {workers.length === 0 ? (
                    <View style={{ alignItems: "center", paddingVertical: 40 }}>
                      <Feather name="users" size={40} color={c.mutedForeground} />
                      <Text style={{ color: c.mutedForeground, marginTop: 12, fontFamily: "Inter_500Medium", fontSize: 15 }}>{t.noWorkers}</Text>
                    </View>
                  ) : workers.map((w) => <WorkerCard key={w._id} worker={w} c={c} />)}
                </View>
              )}
            </ScrollView>
          )}

          {tab === "workforce" && (
            workforceLoading ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={c.primary} /></View>
            ) : workforce.length === 0 ? (
              <View style={{ alignItems: "center", paddingTop: 60 }}>
                <Feather name="briefcase" size={40} color={c.mutedForeground} />
                <Text style={{ color: c.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>Your workforce list is currently empty.</Text>
                <Text style={{ color: c.mutedForeground, marginTop: 6, fontFamily: "Inter_400Regular" }}>Workers that you mark as working for your company will appear here.</Text>
              </View>
            ) : (
              <FlatList
                data={workforce}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 16, paddingBottom: botPad + 24, gap: 12 }}
                renderItem={({ item }) => <WorkforceCard worker={item} c={c} />}
              />
            )
          )}
        </>
      )}
    </View>
  );
}

function StatusBadge({ status, t }: any) {
  const label = status === "approved" ? t.approved : status === "rejected" ? t.rejected : t.pending;
  return <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium", marginTop: 2 }}>{label}</Text>;
}

function WorkerCard({ worker, c }: any) {
  const handlePress = () => {
    navigRouter.push(`/company/worker-details?workerId=${worker._id}`);
  };

  return (
    <View style={[wStyles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {/* Avatar and Info */}
      <View style={[wStyles.avatar, { backgroundColor: c.primaryLight }]}>
        <Text style={[wStyles.avatarText, { color: c.primary }]}>{worker.name.charAt(0).toUpperCase()}</Text>
      </View>
      
      <View style={{ flex: 1, marginRight: 8 }}>
        {/* Name */}
        <Text style={[wStyles.name, { color: c.text }]} numberOfLines={1}>{worker.name}</Text>
        
        {/* Category and Experience */}
        <View style={{ marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[wStyles.sub, { color: c.mutedForeground }]} numberOfLines={1}>{worker.category}</Text>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c.border }} />
          <Text style={[wStyles.sub, { color: c.mutedForeground }]} numberOfLines={1}>{worker.experience}</Text>
        </View>
        
        {/* Location */}
        <Text style={[wStyles.sub, { color: c.mutedForeground }]} numberOfLines={1}>{worker.area}, {worker.city}</Text>
        <Text style={[wStyles.status, { color: worker.employmentStatus === "working" ? c.text : c.success }]} numberOfLines={1}>
          {worker.employmentStatus === "working" ? `🔵 Working at ${worker.currentCompanyName || "another company"}` : "🟢 Available"}
        </Text>
      </View>

      {/* View Details Button */}
      <TouchableOpacity 
        style={[wStyles.detailsButton, { backgroundColor: c.primaryLight }]} 
        onPress={handlePress} 
        activeOpacity={0.7}
      >
        <Feather name="chevron-right" size={18} color={c.primary} />
      </TouchableOpacity>
    </View>
  );
}
function WorkforceCard({ worker, c }: { worker: Worker; c: any }) {
  const handlePress = () => {
    navigRouter.push(`/company/worker-details?workerId=${worker._id}`);
  };

  return (
    <View style={[wStyles.card, { backgroundColor: c.card, borderColor: c.border }]}> 
      <View style={{ flex: 1 }}>
        <Text style={[wStyles.name, { color: c.text }]} numberOfLines={1}>{worker.name}</Text>
        <Text style={[wStyles.sub, { color: c.mutedForeground }]} numberOfLines={1}>{worker.category} · {worker.experience}</Text>
        <Text style={[wStyles.sub, { color: c.mutedForeground, marginTop: 2 }]} numberOfLines={1}>{worker.area}, {worker.city}</Text>
        <Text style={[wStyles.status, { color: c.text, marginTop: 8 }]}>🔵 Currently Working</Text>
        <Text style={[wStyles.small, { color: c.mutedForeground, marginTop: 2 }]}>Working with your company</Text>
      </View>
      <TouchableOpacity 
        style={[wStyles.detailsButton, { backgroundColor: c.primaryLight }]} 
        onPress={handlePress} 
        activeOpacity={0.7}
      >
        <Feather name="chevron-right" size={18} color={c.primary} />
      </TouchableOpacity>
    </View>
  );
}
function ReqCard({ req, c }: any) {
  return (
    <View style={[wStyles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[wStyles.name, { color: c.text }]}>{req.title}</Text>
        <Text style={[wStyles.sub, { color: c.mutedForeground }]}>{req.category} · {req.city}</Text>
        <Text style={[{ color: "#16A34A", fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 }]}>{req.vacancies} vacancies</Text>
      </View>
    </View>
  );
}

function InlineField({ label, value, onChangeText, c, multiline, keyboardType, error }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, color: error ? c.destructive : c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 7 }}>{label}</Text>
      <TextInput
        style={{ borderWidth: 1.5, borderColor: error ? c.destructive : c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular", backgroundColor: c.card, color: c.text, minHeight: 50, ...(multiline ? { height: 88, textAlignVertical: "top" as const, paddingTop: 12 } : {}) }}
        value={value} onChangeText={onChangeText} multiline={!!multiline} keyboardType={keyboardType || "default"} />
      {!!error && <Text style={{ fontSize: 12, color: c.destructive, fontFamily: "Inter_400Regular", marginTop: 5 }}>{error}</Text>}
    </View>
  );
}

function PickerInline({ label, value, options, onSelect, c, accent, placeholder }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, color: c.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: c.card, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} onPress={() => setOpen(!open)}>
        <Text style={{ color: value ? c.text : c.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 15 }}>{value || placeholder || value}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={c.mutedForeground} />
      </TouchableOpacity>
      {open && (
        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 10, overflow: "hidden", marginTop: 4, backgroundColor: c.card }}>
          {options.map((o: string) => (
            <TouchableOpacity key={o || "__all"} style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: o === value ? c.primaryLight : c.card }}
              onPress={() => { onSelect(o); setOpen(false); }}>
              <Text style={{ color: o === value ? (accent || c.primary) : c.text, fontFamily: "Inter_400Regular", fontSize: 15 }}>{o || placeholder}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 20, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, backgroundColor: "#fff" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  statusCard: { borderWidth: 1, borderRadius: 20, padding: 32, alignItems: "center", width: "100%" },
  
  statusMsg: { fontSize: 16, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 24 },
});

const wStyles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  name: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  detailsButton: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  status: { fontSize: 13, fontFamily: "Inter_500Medium" },
  small: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
