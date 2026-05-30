import { useState, useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { reservationService } from "@/services/reservationService";
import { analyticsService } from "@/services/otherServices";
import {
  Shield, CheckCircle2, XCircle, Clock, CalendarCheck, DollarSign, Users,
  Loader2, Building2, Palmtree, Home, Map, Search, Star, BarChart3, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Reservation } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const role = user?.role;

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({ total: 0, revenue: 0, guests: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => { fetchData(); }, [role]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let resData: Reservation[] = [];
      if (role === "admin") {
        const [resAll, analyticsRes] = await Promise.all([
          reservationService.getAll(),
          analyticsService.getOverview(),
        ]);
        if (resAll.success) resData = resAll.data || [];
        if (analyticsRes.success) setAnalytics(analyticsRes.data);
      } else if (role === "tourist") {
        const res = await reservationService.getMy();
        if (res.success) resData = res.data || [];
      } else {
        const res = await reservationService.getProvider();
        if (res.success) resData = res.data || [];
      }
      setReservations(resData);
      const confirmed = resData.filter((r) => r.status === "confirmed");
      setStats({
        total: resData.length,
        revenue: confirmed.reduce((acc, r) => acc + (r.totalPrice || 0), 0),
        guests: resData.reduce((acc, r) => acc + (r.guestCount || 0), 0),
        pending: resData.filter((r) => r.status === "pending").length,
        confirmed: confirmed.length,
        completed: resData.filter((r) => r.status === "completed").length,
        cancelled: resData.filter((r) => r.status === "cancelled").length,
      });
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await reservationService.updateStatus(id, status);
      toast.success(isRTL ? "تم تحديث الحالة" : "Status updated");
      fetchData();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "completed": return "bg-pacta-navy text-white border-pacta-navy";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: "Pending", ar: "قيد الانتظار" },
      confirmed: { en: "Confirmed", ar: "مؤكد" },
      cancelled: { en: "Cancelled", ar: "ملغي" },
      completed: { en: "Completed", ar: "مكتمل" },
    };
    return labels[status]?.[isRTL ? "ar" : "en"] || status;
  };

  const getModelIcon = (model: string) => {
    switch (model?.toLowerCase()) {
      case "hotel": return <Building2 size={14} className="text-pacta-navy" />;
      case "resort": return <Palmtree size={14} className="text-pacta-teal" />;
      case "rental": return <Home size={14} className="text-pacta-ocean" />;
      case "guide": return <Map size={14} className="text-pacta-gold" />;
      default: return <CalendarCheck size={14} className="text-gray-600" />;
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case "admin": return t("dashboard.admin");
      case "hotel_owner": return t("dashboard.hotel");
      case "resort_owner": return t("dashboard.resort");
      case "rental_owner": return t("dashboard.rental");
      case "guide": return t("dashboard.guide");
      default: return t("dashboard.tourist");
    }
  };

  const filtered = reservations.filter((r) => {
    const matchesSearch = !searchQuery ||
      r.tourist?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream">
        <Loader2 size={32} className="animate-spin text-pacta-navy" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-pacta-navy to-pacta-teal text-white rounded-2xl shadow-lg shadow-pacta-navy/20">
          {role === "admin" ? <Shield size={24} /> : role === "hotel_owner" ? <Building2 size={24} /> : role === "resort_owner" ? <Palmtree size={24} /> : role === "rental_owner" ? <Home size={24} /> : role === "guide" ? <Map size={24} /> : <CalendarCheck size={24} />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-pacta-navy">{getRoleTitle()}</h1>
          <p className="text-gray-400 text-sm font-medium">{isRTL ? "نظرة شاملة على أدائك" : "Overview of your performance"}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("dashboard.totalReservations"), val: stats.total, icon: CalendarCheck, color: "text-pacta-navy", bg: "bg-pacta-navy/5" },
          { label: t("dashboard.totalRevenue"), val: `${stats.revenue.toLocaleString()} DA`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: t("dashboard.totalGuests"), val: stats.guests, icon: Users, color: "text-pacta-ocean", bg: "bg-pacta-ocean/5" },
          { label: t("dashboard.pending"), val: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-pacta-sand shadow-sm">
            <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} ${stat.color} mb-3`}><stat.icon size={20} /></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.label}</p>
            <p className="text-2xl font-bold text-pacta-navy mt-1">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Admin Analytics */}
      {role === "admin" && analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: isRTL ? "المستخدمون" : "Users", val: analytics.counts?.users || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
            { label: isRTL ? "القوائم" : "Listings", val: analytics.totalListings || 0, icon: BarChart3, color: "text-pink-600", bg: "bg-pink-50" },
            { label: isRTL ? "التقييمات" : "Reviews", val: analytics.counts?.reviews || 0, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
            { label: isRTL ? "رسائل جديدة" : "New Messages", val: analytics.counts?.pendingContacts || 0, icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-pacta-sand shadow-sm">
              <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} ${stat.color} mb-3`}><stat.icon size={20} /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.label}</p>
              <p className="text-2xl font-bold text-pacta-navy mt-1">{stat.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-300 ${isRTL ? "right-4" : "left-4"}`} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("dashboard.searchPlaceholder")}
            className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-3 bg-white border border-pacta-sand rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy`} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${filterStatus === status ? "bg-gradient-to-r from-pacta-navy to-pacta-teal text-white shadow-md" : "bg-white text-gray-500 border border-pacta-sand hover:border-pacta-gold/50"}`}>
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-3xl border border-pacta-sand overflow-hidden">
        <div className="p-6 border-b border-pacta-sand flex items-center justify-between">
          <h2 className="text-lg font-bold text-pacta-navy">{t("dashboard.allReservations")}</h2>
          <span className="text-xs font-bold text-gray-400 bg-pacta-sand/50 px-4 py-1.5 rounded-full">{filtered.length} {isRTL ? "سجل" : "records"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-pacta-sand/30 text-gray-400 uppercase text-[10px] font-bold tracking-[0.15em]">
              <tr>
                <th className="p-4 text-start">{isRTL ? "السياح" : "Tourist"}</th>
                <th className="p-4 text-start">{isRTL ? "النوع" : "Type"}</th>
                <th className="p-4 text-start">{isRTL ? "التاريخ" : "Date"}</th>
                <th className="p-4 text-start">{isRTL ? "المبلغ" : "Amount"}</th>
                <th className="p-4 text-start">{isRTL ? "الحالة" : "Status"}</th>
                {role !== "tourist" && <th className="p-4 text-end">{isRTL ? "إجراء" : "Action"}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-pacta-sand/50">
              {filtered.map((res) => (
                <tr key={res._id} className="hover:bg-pacta-sand/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pacta-navy to-pacta-teal text-white flex items-center justify-center font-bold text-xs">
                        {res.tourist?.name?.charAt(0) || "T"}
                      </div>
                      <div>
                        <p className="font-bold text-pacta-navy text-xs">{res.tourist?.name || "N/A"}</p>
                        <p className="text-[10px] text-gray-400">{res.tourist?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase bg-pacta-sand/50 text-gray-600 border-pacta-sand">
                      {getModelIcon(res.listingModel)}{res.listingModel}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs font-medium">
                    {new Date(res.startDate).toLocaleDateString()} → {new Date(res.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-bold text-pacta-navy text-xs">
                    {res.totalPrice?.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">DA</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase ${getStatusStyle(res.status)}`}>
                      {getStatusLabel(res.status)}
                    </span>
                  </td>
                  {role !== "tourist" && (
                    <td className="p-4">
                      <div className={`flex gap-2 ${isRTL ? "justify-start" : "justify-end"}`}>
                        {res.status === "pending" && (
                          <>
                            <button onClick={() => handleStatusUpdate(res._id, "confirmed")} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all" title={t("dashboard.confirm")}>
                              <CheckCircle2 size={14} />
                            </button>
                            <button onClick={() => handleStatusUpdate(res._id, "cancelled")} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all" title={t("dashboard.reject")}>
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-16 text-center">
            <p className="text-gray-400 font-bold">{t("dashboard.noResults")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
