import { useEffect } from "react";
import { useLocation } from "wouter";
import { useApp } from "../context/AppContext";

export default function Splash() {
  const { t, session } = useApp();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (session.role === "worker" && session.workerId) {
      navigate("/worker/dashboard");
    } else if (session.role === "company" && session.companyId) {
      navigate("/company/dashboard");
    } else if (session.role === "admin" && session.adminSecret) {
      navigate("/admin");
    }
  }, [session]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-600 px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-3">{t.appName}</h1>
        <p className="text-blue-100 text-lg mb-12">{t.tagline}</p>
        <button
          onClick={() => navigate("/language")}
          className="w-full bg-white text-blue-600 font-semibold text-lg py-4 px-8 rounded-xl"
        >
          {t.getStarted}
        </button>
      </div>
    </div>
  );
}
