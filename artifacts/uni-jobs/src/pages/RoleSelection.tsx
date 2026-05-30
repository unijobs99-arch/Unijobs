import { useLocation } from "wouter";
import { useApp } from "../context/AppContext";

export default function RoleSelection() {
  const { t } = useApp();
  const [, navigate] = useLocation();

  const roles = [
    { key: "worker", label: t.worker, desc: t.workerDesc, path: "/worker/register", color: "bg-blue-600" },
    { key: "company", label: t.employer, desc: t.employerDesc, path: "/company/register", color: "bg-green-600" },
    { key: "admin", label: t.admin, desc: t.adminDesc, path: "/admin", color: "bg-gray-700" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">{t.selectRole}</h2>
      <div className="w-full max-w-xs space-y-4">
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => navigate(r.path)}
            className={`w-full ${r.color} text-white text-left py-5 px-6 rounded-xl`}
          >
            <div className="text-lg font-bold">{r.label}</div>
            <div className="text-sm opacity-80 mt-1">{r.desc}</div>
          </button>
        ))}
      </div>
      <button onClick={() => navigate("/language")} className="mt-8 text-gray-500 text-sm">
        ← {t.back}
      </button>
    </div>
  );
}
