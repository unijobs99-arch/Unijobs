import { useLocation } from "wouter";
import { useApp } from "../context/AppContext";

export default function LanguageSelection() {
  const { t, setLanguage } = useApp();
  const [, navigate] = useLocation();

  function pick(lang: "en" | "hi") {
    setLanguage(lang);
    navigate("/role");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">{t.selectLanguage}</h2>
      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={() => pick("en")}
          className="w-full bg-blue-600 text-white text-lg font-semibold py-4 rounded-xl"
        >
          {t.english}
        </button>
        <button
          onClick={() => pick("hi")}
          className="w-full bg-white border-2 border-blue-600 text-blue-600 text-lg font-semibold py-4 rounded-xl"
        >
          {t.hindi}
        </button>
      </div>
    </div>
  );
}
