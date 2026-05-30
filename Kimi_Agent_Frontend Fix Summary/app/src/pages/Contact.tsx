import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { contactService } from "@/services/otherServices";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactService.submit(form);
      setSent(true);
      toast.success(t("contact.success"));
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error(t("contact.error"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3.5 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy placeholder:text-gray-300 transition-all";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Info */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-pacta-navy mb-3">{t("contact.title")}</h1>
          <p className="text-gray-400 font-medium text-sm mb-10">{t("contact.subtitle")}</p>
          <div className="space-y-4">
            {[
              { icon: Mail, label: "support@pactatourism.com", href: "mailto:support@pactatourism.com" },
              { icon: Phone, label: "+213 (0) 23 45 67 89", href: "tel:+213023456789" },
              { icon: MapPin, label: "Algiers, Algeria", href: "#" },
            ].map((item, i) => (
              <a key={i} href={item.href} className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-pacta-sand hover:shadow-lg hover:shadow-pacta-navy/5 hover:border-pacta-gold/20 transition-all duration-500 group">
                <div className="p-3 bg-pacta-navy/5 text-pacta-navy rounded-2xl group-hover:bg-gradient-to-br group-hover:from-pacta-navy group-hover:to-pacta-teal group-hover:text-white transition-all duration-500">
                  <item.icon size={20} />
                </div>
                <span className="text-sm font-bold text-pacta-navy">{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl border border-pacta-sand p-6 lg:p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-16">
              <CheckCircle size={56} className="text-pacta-green mx-auto mb-5" />
              <p className="font-bold text-xl text-pacta-navy mb-5">{t("contact.success")}</p>
              <button onClick={() => setSent(false)} className="px-6 py-3 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg transition-all">
                {isRTL ? "إرسال رسالة أخرى" : "Send another"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("contact.name")}</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("contact.email")}</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("contact.subject")}</label>
                <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{t("contact.message")}</label>
                <textarea rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputCls} resize-none`} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-pacta-navy/25 transition-all duration-300 disabled:opacity-60">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} />{t("contact.send")}</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
