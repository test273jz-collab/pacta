import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ email: "", password: "" });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t("auth.emailInvalid");
    if (form.password.length < 6) errs.password = t("auth.passwordMin");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      toast.success(isRTL ? "تم تسجيل الدخول بنجاح" : "Login successful");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || t("auth.authFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-pacta-cream via-pacta-sand/30 to-pacta-cream px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pacta-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pacta-navy/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-pacta-navy/5 border border-pacta-sand p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-10 relative">
              <img src="/logo.png" alt="PACTA" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-pacta-navy">{t("auth.loginTitle")}</h1>
            <p className="text-gray-400 text-sm font-medium mt-2">{t("auth.loginSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.server && (
              <div className="flex items-start gap-2 p-4 text-sm font-bold text-red-700 bg-red-50 border border-red-100 rounded-2xl">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {errors.server}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("auth.emailLabel")}</label>
              <div className="relative">
                <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-300 ${isRTL ? "right-4" : "left-4"}`} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-3.5 bg-pacta-sand/40 border ${errors.email ? "border-red-300" : "border-pacta-sand"} rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 focus:border-pacta-gold/40 transition-all text-pacta-navy placeholder:text-gray-300`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("auth.passwordLabel")}</label>
              <div className="relative">
                <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-300 ${isRTL ? "right-4" : "left-4"}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full ${isRTL ? "pr-11 pl-11" : "pl-11 pr-11"} py-3.5 bg-pacta-sand/40 border ${errors.password ? "border-red-300" : "border-pacta-sand"} rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 focus:border-pacta-gold/40 transition-all text-pacta-navy placeholder:text-gray-300`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-300 hover:text-pacta-navy transition-colors ${isRTL ? "left-4" : "right-4"}`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs font-bold">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-pacta-navy/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : t("auth.loginBtn")}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-gray-400 mt-8">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-pacta-navy font-bold hover:text-pacta-gold transition-colors">
              {t("auth.switchRegister")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
