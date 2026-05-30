import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { WILAYAS } from "@/lib/constants";
import {
  Mail, Lock, Eye, EyeOff, Loader2, User, Camera,
  CheckCircle2, Building2, Palmtree, Compass, Home, UserIcon, ArrowRight, ArrowLeft,
  X, UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";

const ROLE_CONFIG: { id: Exclude<UserRole, "admin">; icon: any; color: string; bg: string; gradient: string }[] = [
  { id: "tourist", icon: UserIcon, color: "text-emerald-600", bg: "border-emerald-200 bg-emerald-50", gradient: "from-emerald-500 to-emerald-600" },
  { id: "hotel_owner", icon: Building2, color: "text-pacta-navy", bg: "border-pacta-navy/20 bg-pacta-navy/5", gradient: "from-pacta-navy to-pacta-teal" },
  { id: "resort_owner", icon: Palmtree, color: "text-pacta-teal", bg: "border-pacta-teal/20 bg-pacta-teal/5", gradient: "from-pacta-teal to-pacta-green" },
  { id: "guide", icon: Compass, color: "text-pacta-gold", bg: "border-pacta-gold/20 bg-pacta-gold/5", gradient: "from-pacta-gold to-amber-500" },
  { id: "rental_owner", icon: Home, color: "text-pacta-ocean", bg: "border-pacta-ocean/20 bg-pacta-ocean/5", gradient: "from-pacta-ocean to-sky-500" },
];

export default function Register() {
  const { t, isRTL } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "", email: "", password: "", avatar: "", role: "tourist" as Exclude<UserRole, "admin">,
    titleEn: "", titleAr: "", descEn: "", descAr: "",
    price: "", wilaya: "Algiers",
    images: [] as string[],
    roomsAvailable: "1", propertyClass: "3",
    structureType: "apartment", roomsCount: "1", bedsCount: "1", bathroomsCount: "1",
    maxCapacity: "4", maxGroupSize: "4",
    languagesSpoken: "", specializations: "",
  });

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.name.trim()) errs.name = t("auth.nameRequired") || "Name is required";
      if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t("auth.emailInvalid");
      if (form.password.length < 6) errs.password = t("auth.passwordMin");
    } else if (step === 2 && form.role !== "tourist") {
      if (!form.titleEn.trim() || !form.titleAr.trim()) errs.title = isRTL ? "الاسم مطلوب" : "Title is required";
      if (!form.price.trim()) errs.price = isRTL ? "السعر مطلوب" : "Price is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "pacta12");
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dgncqrtc5/image/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) setForm((p) => ({ ...p, avatar: data.secure_url }));
    } catch { /* silent fail */ }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newUrls = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((p) => [...p, ...newUrls]);
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "pacta12");
      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dgncqrtc5/image/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.secure_url) setForm((p) => ({ ...p, images: [...p.images, data.secure_url] }));
      } catch { /* silent fail */ }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (step === 1 && form.role === "tourist") {
      await doRegister();
      return;
    }
    if (step === 1) { setStep(2); return; }
    await doRegister();
  };

  const doRegister = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        avatar: form.avatar || avatarPreview,
        role: form.role,
        language: isRTL ? "ar" : "en",
        titleEn: form.titleEn.trim(),
        titleAr: form.titleAr.trim(),
        descEn: form.descEn.trim(),
        descAr: form.descAr.trim(),
        price: form.price,
        wilaya: form.wilaya,
        images: form.images,
        roomsAvailable: form.roomsAvailable,
        propertyClass: form.propertyClass,
        maxCapacity: form.maxCapacity,
        maxGroupSize: form.maxGroupSize,
        languagesSpoken: form.languagesSpoken ? form.languagesSpoken.split(",").map((s) => s.trim()).filter(Boolean) : [],
        specializations: form.specializations ? form.specializations.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://pacta-iw8j.onrender.com/api"}/auth/register-complete`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("pacta_token", data.data?.token || data.token);
        localStorage.setItem("pacta_user", JSON.stringify(data.data?.user || data.user));
        toast.success(isRTL ? "تم إنشاء الحساب بنجاح" : "Account created successfully");
        window.location.href = "/dashboard";
      } else {
        throw new Error(data.message || t("auth.authFailed"));
      }
    } catch (err: any) {
      toast.error(err.message || t("auth.serverError"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3.5 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 focus:border-pacta-gold/40 transition-all text-pacta-navy placeholder:text-gray-300";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-pacta-cream via-pacta-sand/30 to-pacta-cream px-4 py-12 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-pacta-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-pacta-navy/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-pacta-navy/5 border border-pacta-sand p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-10 relative">
              <img src="/logo.png" alt="PACTA" className="w-full h-full object-contain" />
            </div>
          </div>
          
          {/* Progress */}
          <div className="mb-8">
            <div className="h-2 bg-pacta-sand rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pacta-navy to-pacta-teal transition-all duration-500" style={{ width: `${(step / 2) * 100}%` }} />
            </div>
            <p className="text-center text-xs font-bold text-gray-400 mt-3">{isRTL ? `الخطوة ${step} من 2` : `Step ${step} of 2`}</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-pacta-navy">{step === 1 ? t("auth.registerTitle") : isRTL ? "تفاصيل الخدمة" : "Service Details"}</h1>
            <p className="text-gray-400 text-sm font-medium mt-2">
              {step === 1 ? (isRTL ? "اختر نوع حسابك وأدخل بياناتك" : "Choose your account type and enter your details") : (isRTL ? "أكمل معلومات خدمتك أو عقارك" : "Complete your service or property information")}
            </p>
          </div>

          {/* Step 1: Account Info */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Role Selection */}
              <div className="grid grid-cols-1 gap-2">
                {ROLE_CONFIG.map((role) => {
                  const Icon = role.icon;
                  const isSelected = form.role === role.id;
                  return (
                    <button key={role.id} type="button" onClick={() => setForm({ ...form, role: role.id })}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-300 ${isSelected ? "border-pacta-navy bg-pacta-navy/5 shadow-md shadow-pacta-navy/5" : "border-pacta-sand hover:border-pacta-sand-dark"}`}>
                      <div className={`p-2 rounded-xl ${isSelected ? "bg-gradient-to-br " + role.gradient + " text-white" : role.bg + " " + role.color}`}>
                        <Icon size={18} />
                      </div>
                      <span className="flex-1 text-sm font-bold text-pacta-navy">{t(`roles.${role.id}`)}</span>
                      {isSelected && <CheckCircle2 size={18} className="text-pacta-navy" />}
                    </button>
                  );
                })}
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                <label className="relative w-20 h-20 rounded-full border-2 border-dashed border-pacta-sand hover:border-pacta-gold bg-pacta-sand/30 flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 group">
                  {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-300" />}
                  <div className="absolute inset-0 bg-pacta-navy/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><UploadCloud size={16} /></div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("auth.nameLabel")}</label>
                <div className="relative">
                  <User size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-300 ${isRTL ? "right-4" : "left-4"}`} />
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} ${inputCls} ${errors.name ? "border-red-300" : ""}`} placeholder="John Doe" />
                </div>
                {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("auth.emailLabel")}</label>
                <div className="relative">
                  <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-300 ${isRTL ? "right-4" : "left-4"}`} />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} ${inputCls} ${errors.email ? "border-red-300" : ""}`} placeholder="name@example.com" />
                </div>
                {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("auth.passwordLabel")}</label>
                <div className="relative">
                  <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-300 ${isRTL ? "right-4" : "left-4"}`} />
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`${isRTL ? "pr-11 pl-11" : "pl-11 pr-11"} ${inputCls} ${errors.password ? "border-red-300" : ""}`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-1/2 -translate-y-1/2 text-gray-300 hover:text-pacta-navy ${isRTL ? "left-4" : "right-4"}`}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs font-bold">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Service Details */}
          {step === 2 && form.role !== "tourist" && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{isRTL ? "الاسم (EN)" : "Name (EN)"}</label>
                  <input type="text" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{isRTL ? "الاسم (AR)" : "Name (AR)"}</label>
                  <input type="text" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" className={`${inputCls} text-right`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{isRTL ? "الولاية" : "Wilaya"}</label>
                <select value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: e.target.value })} className={`${inputCls} appearance-none`}>
                  {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{isRTL ? "الوصف (EN)" : "Description (EN)"}</label>
                  <textarea value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{isRTL ? "الوصف (AR)" : "Description (AR)"}</label>
                  <textarea value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} rows={3} dir="rtl" className={`${inputCls} resize-none text-right`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
                  {form.role === "guide" ? (isRTL ? "السعر/يوم (DA)" : "Price/Day (DA)") : (isRTL ? "السعر/ليلة (DA)" : "Price/Night (DA)")}
                </label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
                {errors.price && <p className="text-red-500 text-xs font-bold">{errors.price}</p>}
              </div>

              {/* Images */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{isRTL ? "صور" : "Images"}</label>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {imagePreviews.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-pacta-sand">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setImagePreviews((p) => p.filter((_, j) => j !== i)); setForm((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) })); }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-pacta-sand hover:border-pacta-gold rounded-2xl cursor-pointer transition-all duration-300">
                  <UploadCloud size={20} className="text-gray-300 mb-1" />
                  <span className="text-xs font-bold text-gray-400">{isRTL ? "اضغط لرفع الصور" : "Click to upload images"}</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-pacta-sand text-gray-500 rounded-2xl font-bold text-sm hover:border-pacta-gold/50 hover:text-pacta-navy transition-all duration-300">
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                {t("auth.back")}
              </button>
            )}
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-pacta-navy/25 transition-all duration-300 disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>{step === 1 && form.role !== "tourist" ? (isRTL ? "متابعة" : "Continue") : (isRTL ? "إنشاء حساب" : "Create Account")}
                  {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</>
              )}
            </button>
          </div>

          <p className="text-center text-sm font-medium text-gray-400 mt-6">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="text-pacta-navy font-bold hover:text-pacta-gold transition-colors">{t("auth.switchLogin")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
