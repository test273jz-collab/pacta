import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { notificationService } from "@/services/otherServices";
import { Bell, Check, Loader2, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { Notification } from "@/types";

export default function Notifications() {
  const { t, isRTL } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await notificationService.getMy();
      if (res.success) { setNotifications(res.data || []); setUnreadCount(res.unreadCount || 0); }
    } catch { } finally { setLoading(false); }
  };

  const markRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success(isRTL ? "تم تعيين الكل كمقروء" : "All marked as read");
    } catch { }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch { }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "reservation_new": return <Bell size={16} className="text-pacta-navy" />;
      case "reservation_confirmed": return <Check size={16} className="text-emerald-600" />;
      case "reservation_cancelled": return <Trash2 size={16} className="text-red-600" />;
      case "review_received": return <Bell size={16} className="text-pacta-gold" />;
      default: return <Bell size={16} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream">
        <Loader2 size={32} className="animate-spin text-pacta-navy" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-pacta-navy">{t("notifications.title")}</h1>
          {unreadCount > 0 && <p className="text-sm text-pacta-gold font-semibold mt-2">{unreadCount} {isRTL ? "إشعارات غير مقروءة" : "unread notifications"}</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="px-5 py-2.5 bg-pacta-navy/5 text-pacta-navy text-sm font-bold rounded-2xl hover:bg-pacta-navy hover:text-white transition-all duration-300">
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pacta-sand p-20 text-center">
          <Bell size={48} className="text-gray-200 mx-auto mb-5" />
          <p className="font-bold text-xl text-pacta-navy">{t("notifications.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className={`flex items-start gap-4 p-5 rounded-3xl border transition-all duration-300 ${n.isRead ? "bg-white border-pacta-sand" : "bg-pacta-navy/[0.02] border-pacta-navy/10"}`}>
              <div className={`p-3 rounded-2xl ${n.isRead ? "bg-pacta-sand/50" : "bg-pacta-navy/5"} shrink-0`}>{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-pacta-navy">{n.title}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">{n.message}</p>
                <p className="text-[11px] text-gray-300 mt-2 flex items-center gap-1.5">
                  <Calendar size={10} />{new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)} className="p-2.5 bg-pacta-navy/5 text-pacta-navy rounded-xl hover:bg-pacta-navy hover:text-white transition-all duration-300" title={isRTL ? "تعيين كمقروء" : "Mark as read"}>
                    <Check size={14} />
                  </button>
                )}
                <button onClick={() => deleteNotification(n._id)} className="p-2.5 bg-pacta-sand/50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all duration-300">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
