import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "../i18n/en";
import hi from "../i18n/hi";
import type { Translations } from "../i18n/en";

type Language = "en" | "hi";
type Role = "worker" | "company" | "admin" | null;

interface Session {
  role: Role;
  workerId?: string;
  companyId?: string;
  adminSecret?: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  t: Translations;
  session: Session;
  setSession: (s: Session) => void;
  clearSession: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const SESSION_KEY = "unijobs_session";
const LANG_KEY = "unijobs_lang";

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>(() => {
    return (localStorage.getItem(LANG_KEY) as Language) || "en";
  });

  const [session, setSessionState] = useState<Session>(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : { role: null };
    } catch {
      return { role: null };
    }
  });

  const t = language === "hi" ? hi : en;

  function setLanguage(l: Language) {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }

  function setSession(s: Session) {
    setSessionState(s);
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }

  function clearSession() {
    setSessionState({ role: null });
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <AppContext.Provider value={{ language, setLanguage, t, session, setSession, clearSession }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
