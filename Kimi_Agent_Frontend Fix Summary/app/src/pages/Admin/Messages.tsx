import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Loader2, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminMessages() {
  const { isRTL } = useLanguage();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("pacta_token");
      const res = await fetch(`${API_URL}/admin/contacts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) setMessages(data.data || []);
    } catch { } finally { setLoading(false); }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const token = localStorage.getItem("pacta_token");
      await fetch(`${API_URL}/admin/contacts/${id}/read`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMessages((prev) => prev.map((m) => m._id === id ? { ...m, isRead: true } : m));
    } catch { }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream">
        <Loader2 size={32} className="animate-spin text-pacta-navy" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-pacta-gold to-amber-500 text-white rounded-2xl">
          <Mail size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-pacta-navy">{isRTL ? "الرسائل" : "Messages"}</h1>
          <p className="text-gray-400 text-sm">{messages.length} {isRTL ? "رسالة" : "messages"}</p>
        </div>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg._id} className={`bg-white rounded-3xl border p-6 transition-all duration-300 ${msg.isRead ? "border-pacta-sand" : "border-pacta-gold/30 shadow-sm shadow-pacta-gold/5"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-pacta-navy">{msg.name}</h3>
                  {!msg.isRead && <span className="w-2 h-2 bg-pacta-gold rounded-full" />}
                </div>
                <p className="text-xs text-gray-400 mb-1">{msg.email}</p>
                <p className="text-xs font-bold text-pacta-navy/70 uppercase tracking-wider mb-3">{msg.subject}</p>
                <p className="text-sm text-gray-600">{msg.message}</p>
              </div>
              <div className="flex gap-2">
                {!msg.isRead && (
                  <button onClick={() => handleMarkRead(msg._id)}
                    className="p-2.5 bg-pacta-navy/5 text-pacta-navy rounded-xl hover:bg-pacta-navy hover:text-white transition-all duration-300" title={isRTL ? "تعيين كمقروء" : "Mark as read"}>
                    <CheckCircle size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="bg-white rounded-3xl border border-pacta-sand p-16 text-center">
            <Mail size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="font-bold text-lg text-pacta-navy">{isRTL ? "لا توجد رسائل" : "No messages"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
