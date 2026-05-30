import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { profileService } from "@/services/otherServices";
import { WILAYAS } from "@/lib/constants";
import {
  User as UserIcon, Lock, LogOut, Camera, Loader2, CheckCircle, AlertCircle,
  Shield, Building2, Star,
} from "lucide-react";


const inputCls = "w-full px-4 py-3.5 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy placeholder:text-gray-300 transition-all";

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group" onClick={() => onChange(!checked)}>
      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${checked ? "bg-gradient-to-br from-pacta-navy to-pacta-teal border-pacta-navy" : "bg-white border-pacta-sand group-hover:border-pacta-gold"}`}>
        {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span className="text-sm font-semibold text-gray-600 select-none">{label}</span>
    </label>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { lang, t, isRTL, setLang } = useLanguage();
  const avatarRef = useRef<HTMLInputElement>(null);

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState(lang);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [business, setBusiness] = useState<any>({});

  useEffect(() => {
    profileService.get().then((res) => {
      if (res.success && res.data) {
        const u = res.data.user;
        setName(u.name || "");
        setPhone(u.phone || "");
        setBio(u.bio || "");
        setLocation(u.location || "");
        setLanguage(u.language || "en");
        setAvatarPreview(u.avatar || "");
        if (res.data.businessListing) setBusiness(res.data.businessListing);
      }
    }).catch(() => {}).finally(() => setFetching(false));
  }, []);

  const patch = (u: any) => setBusiness((p: any) => ({ ...p, ...u }));
  const patchNested = (k: string, u: any) => setBusiness((p: any) => ({ ...p, [k]: { ...p[k], ...u } }));

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const payload: any = { name, phone, bio, location, language };
      if (avatarFile) {
        const reader = new FileReader();
        const avatarData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(avatarFile);
        });
        payload.avatar = avatarData;
      }
      if (user?.role !== "tourist" && user?.role !== "admin") {
        payload.businessData = JSON.stringify(business);
      }
      const res = await profileService.update(payload);
      if (res.success) {
        setStatus({ type: "success", msg: t("profile.successUpdate") });
        if (res.data?.user) { setName(res.data.user.name); setAvatarPreview(res.data.user.avatar); }
        setLang(language);
      } else throw new Error(res.message);
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message || t("profile.errorUpdate") });
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    setStatus(null);
    try {
      await profileService.changePassword({ currentPassword: currentPw, newPassword: newPw });
      setStatus({ type: "success", msg: t("profile.passwordSuccess") });
      setCurrentPw(""); setNewPw("");
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message || t("profile.passwordError") });
    } finally { setSavingPw(false); }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream">
        <Loader2 size={32} className="animate-spin text-pacta-navy" />
      </div>
    );
  }

  const isProvider = user?.role !== "tourist" && user?.role !== "admin";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-pacta-sand shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer group" onClick={() => avatarRef.current?.click()}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pacta-sand to-pacta-cream overflow-hidden border-2 border-pacta-sand">
              {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-5 text-gray-200" />}
            </div>
            <div className="absolute inset-0 bg-pacta-navy/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Camera size={16} /></div>
            <input type="file" ref={avatarRef} className="hidden" accept="image/*" onChange={(e) => {
              if (e.target.files?.[0]) { setAvatarFile(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }
            }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-pacta-navy">{user?.name}</h1>
            <p className="text-sm text-gray-400 font-medium">{user?.email}</p>
            <span className="mt-1.5 inline-block px-3 py-1 bg-pacta-navy/5 text-pacta-navy text-[10px] font-bold rounded-lg uppercase tracking-wider">
              {t(`roles.${user?.role}`)}
            </span>
          </div>
        </div>
        <button onClick={logout} className="px-6 py-3 bg-red-50 text-red-500 border border-red-100 font-bold text-sm rounded-2xl flex items-center gap-2 hover:bg-red-100 transition-all">
          <LogOut size={16} /> {t("nav.logout")}
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold mb-8 ${status.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"}`}>
          {status.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{status.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-3xl border border-pacta-sand shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-4 border-b border-pacta-sand">
              <Shield size={16} className="text-pacta-navy" />
              <h3 className="font-bold text-pacta-navy text-sm uppercase tracking-[0.15em]">{t("profile.accountInfo")}</h3>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.displayName")}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.phone")}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+213..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.bio")}</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.location")}</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.interfaceLanguage")}</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className={`${inputCls} appearance-none`}>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3.5 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-pacta-navy/25 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />}{t("profile.saveChanges")}
            </button>
          </form>

          <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-3xl border border-pacta-sand shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-4 border-b border-pacta-sand">
              <Lock size={16} className="text-pacta-navy" />
              <h3 className="font-bold text-pacta-navy text-sm uppercase tracking-[0.15em]">{t("profile.security")}</h3>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.currentPassword")}</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={inputCls} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.newPassword")}</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={savingPw}
              className="w-full py-3.5 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2">
              {savingPw && <Loader2 size={16} className="animate-spin" />}{t("profile.updateCredentials")}
            </button>
          </form>
        </div>

        {/* Right Column - Business */}
        {isProvider && (
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-3xl border border-pacta-sand shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-pacta-sand">
                <Building2 size={16} className="text-pacta-navy" />
                <h3 className="font-bold text-pacta-navy text-sm uppercase tracking-[0.15em]">{t("profile.businessProfile")}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.nameEn")}</label>
                  <input type="text" value={business.titleEn || business.nameEn || ""} onChange={(e) => patch(business.nameEn !== undefined ? { nameEn: e.target.value } : { titleEn: e.target.value })} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.nameAr")}</label>
                  <input type="text" value={business.titleAr || business.nameAr || ""} onChange={(e) => patch(business.nameAr !== undefined ? { nameAr: e.target.value } : { titleAr: e.target.value })} className={`${inputCls} text-right`} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.price")}</label>
                  <input type="number" value={business.pricePerDay || business.pricePerNight || ""} onChange={(e) => patch(business.pricePerDay !== undefined ? { pricePerDay: Number(e.target.value) } : { pricePerNight: Number(e.target.value) })} className={inputCls} min={0} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.wilaya")}</label>
                  <select value={business.wilaya || ""} onChange={(e) => patch({ wilaya: e.target.value })} className={`${inputCls} appearance-none`}>
                    {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.descEn")}</label>
                  <textarea value={business.descEn || ""} onChange={(e) => patch({ descEn: e.target.value })} rows={4} className={`${inputCls} resize-none`} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.descAr")}</label>
                  <textarea value={business.descAr || ""} onChange={(e) => patch({ descAr: e.target.value })} rows={4} className={`${inputCls} resize-none text-right`} dir="rtl" />
                </div>
              </div>
              {user?.role === "hotel_owner" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.roomsAvailable")}</label>
                      <input type="number" value={business.roomsAvailable || ""} onChange={(e) => patch({ roomsAvailable: Number(e.target.value) })} className={inputCls} min={1} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.propertyClass")}</label>
                      <div className="flex items-center gap-1 h-[50px]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => patch({ propertyClass: s })} className={`${(business.propertyClass || 3) >= s ? "text-amber-400" : "text-gray-200"} transition-colors`}>
                            <Star size={26} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("profile.amenities")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {["hasPool", "hasSpa", "hasGym", "hasFreeParking", "hasRestaurant", "breakfastIncluded", "hasWiFi", "hasAC"].map((key) => (
                        <Checkbox key={key} checked={business.amenities?.[key] || false} onChange={(v) => patchNested("amenities", { [key]: v })} label={key.replace("has", "").replace("breakfastIncluded", "Breakfast")} />
                      ))}
                    </div>
                  </div>
                </>
              )}
              <button type="submit" disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60">
                {saving && <Loader2 size={16} className="animate-spin" />}{t("profile.saveChanges")}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
