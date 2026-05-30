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

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [session, setSessionState] = useState<Session>({ role: null });
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [savedLang, savedSession] = await Promise.all([
          AsyncStorage.getItem(LANG_KEY),
          AsyncStorage.getItem(SESSION_KEY),
        ]);
        if (savedLang === "en" || savedLang === "hi") setLangState(savedLang);
        if (savedSession) setSessionState(JSON.parse(savedSession));
      } catch {}
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
