import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "../context/AppContext";
import { api } from "../lib/api";

export default function CompanyRegistration() {
  const { t, setSession } = useApp();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");

  const [form, setForm] = useState({
    companyName: "", ownerName: "", email: "", phone: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const company: any = await api.registerCompany(form);
      setSession({ role: "company", companyId: company._id });
      navigate("/company/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const company: any = await api.loginCompany(loginEmail);
      setSession({ role: "company", companyId: company._id });
      navigate("/company/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white focus:outline-none focus:border-green-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-green-600 px-6 pt-12 pb-6">
        <button onClick={() => navigate("/role")} className="text-green-100 text-sm mb-3 block">← {t.back}</button>
        <h1 className="text-2xl font-bold text-white">{t.companyRegistration}</h1>
      </div>

      <div className="px-6 pt-4">
        <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === "register" ? "bg-white text-green-600 shadow" : "text-gray-600"}`}
          >
            {t.register}
          </button>
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === "login" ? "bg-white text-green-600 shadow" : "text-gray-600"}`}
          >
            {t.loginWithEmail}
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={labelClass}>{t.email}</label>
              <input className={inputClass} type="email" value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)} placeholder={t.enterEmail} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl text-base disabled:opacity-60">
              {loading ? t.loading : t.find}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { key: "companyName", label: t.companyName },
              { key: "ownerName", label: t.ownerName },
              { key: "email", label: t.email, type: "email" },
              { key: "phone", label: t.phone, type: "tel" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input className={inputClass} type={type || "text"}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => set(key, e.target.value)} required />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl text-base disabled:opacity-60">
              {loading ? t.loading : t.register}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
