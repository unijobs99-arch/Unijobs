import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import strings, { Lang } from "@/constants/strings";

interface Session {
  role: "worker" | "company" | "admin" | null;
  workerId?: string;
  companyId?: string;
  adminSecret?: string;
}

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof strings.en;
  session: Session;
  setSession: (s: Session) => Promise<void>;
  clearSession: () => Promise<void>;
  sessionLoaded: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const LANG_KEY = "unijobs_lang";
const SESSION_KEY = "unijobs_session";
const SESSION_VALIDATION_TIMEOUT_MS = 9000;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = SESSION_VALIDATION_TIMEOUT_MS) {
  console.log("[AppContext] fetchWithTimeout started", url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    console.log("[AppContext] fetchWithTimeout completed", url, response.status);
    return response;
  } catch (error) {
    console.log("[AppContext] fetchWithTimeout failed", url, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validate that a worker exists on the backend.
 * Uses fetch directly to avoid circular import with api module.
 */
async function validateWorkerSession(workerId: string, domain: string): Promise<boolean> {
  try {
    const baseUrl = /^(localhost|127\.|192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)/.test(domain)
      ? `http://${domain}/api`
      : `https://${domain}/api`;
    const response = await fetchWithTimeout(`${baseUrl}/workers/${workerId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Validate that a company exists on the backend.
 * Uses fetch directly to avoid circular import with api module.
 */
async function validateCompanySession(companyId: string, domain: string): Promise<boolean> {
  try {
    const baseUrl = /^(localhost|127\.|192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)/.test(domain)
      ? `http://${domain}/api`
      : `https://${domain}/api`;
    const response = await fetchWithTimeout(`${baseUrl}/companies/${companyId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [session, setSessionState] = useState<Session>({ role: null });
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    console.log("[AppContext] mounted");

    async function load() {
      console.log("[AppContext] load() started");
      try {
        const [savedLang, savedSession] = await Promise.all([
          AsyncStorage.getItem(LANG_KEY),
          AsyncStorage.getItem(SESSION_KEY),
        ]);
        console.log("[AppContext] AsyncStorage language loaded", savedLang);
        console.log("[AppContext] AsyncStorage session loaded", Boolean(savedSession));

        if (savedLang === "en" || savedLang === "hi") setLangState(savedLang);
        
        if (savedSession) {
          console.log("[AppContext] Session found");
          const parsedSession = JSON.parse(savedSession) as Session;
          const domain = process.env.EXPO_PUBLIC_DOMAIN?.trim() || "";
          console.log("[AppContext] EXPO_PUBLIC_DOMAIN value", domain);
          const shouldValidate = domain.length > 0;

          // Restore session for admin always, and for worker/company only when validation is available.
          if (parsedSession.role === "worker" && parsedSession.workerId) {
            console.log("[AppContext] validateWorkerSession started");
            if (shouldValidate) {
              const isValid = await validateWorkerSession(parsedSession.workerId, domain);
              if (isValid) {
                console.log("[AppContext] setSession(...) worker");
                setSessionState(parsedSession);
              } else {
                console.log("[AppContext] Worker session invalid - clearing");
                await AsyncStorage.removeItem(SESSION_KEY);
              }
            } else {
              console.log("[AppContext] Skipping worker validation because EXPO_PUBLIC_DOMAIN is empty");
              setSessionState(parsedSession);
            }
          }
          else if (parsedSession.role === "company" && parsedSession.companyId) {
            console.log("[AppContext] validateCompanySession started");
            if (shouldValidate) {
              const isValid = await validateCompanySession(parsedSession.companyId, domain);
              if (isValid) {
                console.log("[AppContext] setSession(...) company");
                setSessionState(parsedSession);
              } else {
                console.log("[AppContext] Company session invalid - clearing");
                await AsyncStorage.removeItem(SESSION_KEY);
              }
            } else {
              console.log("[AppContext] Skipping company validation because EXPO_PUBLIC_DOMAIN is empty");
              setSessionState(parsedSession);
            }
          }
          else if (parsedSession.role === "admin" && parsedSession.adminSecret) {
            console.log("[AppContext] setSession(...) admin");
            setSessionState(parsedSession);
          } else {
            console.log("[AppContext] No valid session role - clearing");
            await AsyncStorage.removeItem(SESSION_KEY);
          }
        } else {
          console.log("[AppContext] No session found");
        }
      } catch (err) {
        console.error("[AppContext] Error loading session:", err);
      }
      console.log("[AppContext] setSessionLoaded(true)");
      setSessionLoaded(true);
    }
    load();
  }, []);

  async function setLang(l: Lang) {
    setLangState(l);
    await AsyncStorage.setItem(LANG_KEY, l);
  }

  async function setSession(s: Session) {
    setSessionState(s);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }

  async function clearSession() {
    setSessionState({ role: null });
    await AsyncStorage.removeItem(SESSION_KEY);
  }

  const t = strings[lang];

  return (
    <AppContext.Provider value={{ lang, setLang, t, session, setSession, clearSession, sessionLoaded }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
