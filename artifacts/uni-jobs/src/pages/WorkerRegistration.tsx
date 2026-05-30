import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "../context/AppContext";
import { api } from "../lib/api";

const CATEGORIES = ["Picker", "Scanner", "Delivery", "Packing", "Warehouse Helper", "Loader", "Tagging"];
const EDUCATION = ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Post Graduate"];

export default function WorkerRegistration() {
  const { t, setSession } = useApp();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginPhone, setLoginPhone] = useState("");

  const [form, setForm] = useState({
    name: "", fatherName: "", phone: "", aadhaar: "", uan: "",
    address: "", city: "", education: "10th Pass", experience: "", category: "Picker",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const worker: any = await api.registerWorker(form);
      setSession({ role: "worker", workerId: worker._id });
      navigate("/worker/dashboard");
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
      const worker: any = await api.loginWorker(loginPhone);
      setSession({ role: "worker", workerId: worker._id });
      navigate("/worker/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white focus:outline-none focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-blue-600 px-6 pt-12 pb-6">
        <button onClick={() => navigate("/role")} className="text-blue-100 text-sm mb-3 block">← {t.back}</button>
        <h1 className="text-2xl font-bold text-white">{t.workerRegistration}</h1>
      </div>

      <div className="px-6 pt-4">
        <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === "register" ? "bg-white text-blue-600 shadow" : "text-gray-600"}`}
          >
            {t.register}
          </button>
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === "login" ? "bg-white text-blue-600 shadow" : "text-gray-600"}`}
          >
            {t.loginWithPhone}
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={labelClass}>{t.phone}</label>
              <input className={inputClass} value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)}
                placeholder={t.enterPhone} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl text-base disabled:opacity-60">
              {loading ? t.loading : t.find}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { key: "name", label: t.name },
              { key: "fatherName", label: t.fatherName },
              { key: "phone", label: t.phone, type: "tel" },
              { key: "aadhaar", label: t.aadhaar },
              { key: "uan", label: t.uan },
              { key: "address", label: t.address },
              { key: "city", label: t.city },
              { key: "experience", label: t.experience },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input className={inputClass} type={type || "text"}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => set(key, e.target.value)} required />
              </div>
            ))}
            <div>
              <label className={labelClass}>{t.education}</label>
              <select className={inputClass} value={form.education} onChange={(e) => set("education", e.target.value)}>
                {EDUCATION.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t.category}</label>
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl text-base disabled:opacity-60">
              {loading ? t.loading : t.register}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
