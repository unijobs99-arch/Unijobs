import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

export default function SplashScreen() {
  const { session, sessionLoaded, t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  console.log("[app/index] Index rendered");
  console.log("[app/index] sessionLoaded value", sessionLoaded);
  console.log("[app/index] Current session role", session.role);

  useEffect(() => {
    if (!sessionLoaded) return;
    if (session.role === "worker" && session.workerId) {
      const target = "/worker/dashboard";
      console.log("[app/index] Router navigation target", target);
      router.replace(target);
    } else if (session.role === "company" && session.companyId) {
      const target = "/company/dashboard";
      console.log("[app/index] Router navigation target", target);
      router.replace(target);
    } else if (session.role === "admin" && session.adminSecret) {
      const target = "/admin";
      console.log("[app/index] Router navigation target", target);
      router.replace(target);
    }
  }, [sessionLoaded, session]);

  const c = colors.light;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!sessionLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: c.primary, paddingTop: topPad }]}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.primary, paddingTop: topPad, paddingBottom: botPad + 32 }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>UJ</Text>
        </View>
        <Text style={styles.appName}>{t.appName}</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/language")}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{t.getStarted}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  appName: {
    fontSize: 40,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 17,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: {
    color: colors.light.primary,
    fontSize: 17,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
