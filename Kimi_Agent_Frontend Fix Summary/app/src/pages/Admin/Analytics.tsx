import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart3, Users, Star, TrendingUp, Loader2, CalendarCheck,
  DollarSign, Hotel, ArrowUpRight, RefreshCw, Activity,
} from "lucide-react";
import { analyticsService } from "@/services/otherServices";
import { toast } from "sonner";

interface DailyPoint { _id: string; count: number; revenue?: number }
interface Overview {
  counts: { users: number; hotels: number; rentals: number; resorts: number; guides: number; reservations: number; reviews: number; pendingContacts: number };
  totalListings: number;
  recentActivity: { reservationsLast30Days: number; newUsersLast30Days: number };
}
interface RevenueData { summary: { totalRevenue: number; avgOrderValue: number; totalOrders: number }; monthlyTrend: DailyPoint[] }
interface ReservationData { statusDistribution: Record<string, number>; dailyTrends: DailyPoint[]; byType: Record<string, number> }

export default function AdminAnalytics() {
  const { isRTL } = useLanguage();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [reservations, setReservations] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [ovRes, revRes, resRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getRevenue?.() || Promise.resolve({ success: false }),
        analyticsService.getReservationStats?.() || Promise.resolve({ success: false }),
      ]);
      if (ovRes.success) setOverview(ovRes.data);
      if (revRes.success) setRevenue(revRes.data);
      if (resRes.success) setReservations(resRes.data);
    } catch {
      toast.error(isRTL ? "خطأ في تحميل البيانات" : "Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-pacta-navy" />
          <p className="text-sm text-gray-400 font-medium">{isRTL ? "جاري تحميل التحليلات..." : "Loading analytics..."}</p>
        </div>
      </div>
    );
  }

  const topStats = [
    {
      label: isRTL ? "المستخدمون" : "Total Users",
      val: overview?.counts?.users || 0,
      sub: `+${overview?.recentActivity?.newUsersLast30Days || 0} ${isRTL ? "هذا الشهر" : "this month"}`,
      icon: Users,
      gradient: "from-pacta-navy to-pacta-teal",
    },
    {
      label: isRTL ? "إجمالي الحجوزات" : "Reservations",
      val: overview?.counts?.reservations || 0,
      sub: `${overview?.recentActivity?.reservationsLast30Days || 0} ${isRTL ? "آخر 30 يوم" : "last 30 days"}`,
      icon: CalendarCheck,
      gradient: "from-pacta-teal to-emerald-500",
    },
    {
      label: isRTL ? "التقييمات" : "Reviews",
      val: overview?.counts?.reviews || 0,
      sub: isRTL ? "تقييم موثق" : "verified reviews",
      icon: Star,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: isRTL ? "القوائم النشطة" : "Active Listings",
      val: overview?.totalListings || 0,
      sub: `${overview?.counts?.hotels || 0}H · ${overview?.counts?.resorts || 0}R · ${overview?.counts?.guides || 0}G · ${overview?.counts?.rentals || 0}Re`,
      icon: Hotel,
      gradient: "from-violet-600 to-purple-500",
    },
    {
      label: isRTL ? "الإيرادات" : "Total Revenue",
      val: revenue?.summary?.totalRevenue ? `${revenue.summary.totalRevenue.toLocaleString()} DA` : "—",
      sub: `${isRTL ? "متوسط الطلب" : "Avg order"}: ${revenue?.summary?.avgOrderValue ? `${Math.round(revenue.summary.avgOrderValue).toLocaleString()} DA` : "—"}`,
      icon: DollarSign,
      gradient: "from-pacta-gold to-amber-400",
    },
    {
      label: isRTL ? "الرسائل المعلقة" : "Pending Contacts",
      val: overview?.counts?.pendingContacts || 0,
      sub: isRTL ? "تحتاج رد" : "awaiting reply",
      icon: Activity,
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  // Monthly trend chart
  const monthlyData = revenue?.monthlyTrend || [];
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue || d.count || 0), 1);
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  // Reservation status
  const statusDist = reservations?.statusDistribution || {};
  const totalRes = Object.values(statusDist).reduce((a, b) => a + b, 0) || 1;
  const statusColors: Record<string, string> = {
    pending: "bg-amber-400",
    confirmed: "bg-pacta-teal",
    completed: "bg-emerald-500",
    cancelled: "bg-rose-400",
  };

  // By type
  const byType = reservations?.byType || {};
  const typeColors: Record<string, string> = {
    Hotel: "bg-pacta-navy",
    Resort: "bg-pacta-teal",
    Guide: "bg-amber-500",
    Rental: "bg-violet-500",
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pacta-navy to-pacta-teal text-white rounded-2xl shadow-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-pacta-navy">{isRTL ? "لوحة التحليلات" : "Analytics Dashboard"}</h1>
            <p className="text-gray-400 text-sm">{isRTL ? "نظرة عامة على أداء المنصة" : "Real-time platform performance overview"}</p>
          </div>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-pacta-sand text-sm font-bold text-pacta-navy rounded-xl hover:border-pacta-navy/30 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {isRTL ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {topStats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl border border-pacta-sand p-6 shadow-sm hover:shadow-lg hover:border-pacta-sand/80 transition-all duration-500 group">
            <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg mb-4 group-hover:scale-105 transition-transform duration-300`}>
              <stat.icon size={20} />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.label}</p>
            <p className="text-3xl font-bold text-pacta-navy mt-1 mb-1">{typeof stat.val === "number" ? stat.val.toLocaleString() : stat.val}</p>
            <div className="flex items-center gap-1 text-emerald-500">
              <ArrowUpRight size={12} />
              <span className="text-[11px] font-semibold">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-pacta-sand p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-pacta-navy">{isRTL ? "الإيرادات الشهرية" : "Monthly Revenue"}</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{isRTL ? "آخر 12 شهر" : "Last 12 months"}</p>
            </div>
            <span className="px-3 py-1 bg-pacta-navy/5 text-pacta-navy text-xs font-bold rounded-xl">DA</span>
          </div>
          {monthlyData.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-48">
              {monthlyData.map((d, i) => {
                const h = Math.max(8, ((d.revenue || d.count || 0) / maxRevenue) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                    <span className="text-[9px] font-bold text-gray-400 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                      {((d.revenue || d.count || 0) / 1000).toFixed(0)}k
                    </span>
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-pacta-navy to-pacta-teal transition-all duration-700 hover:from-pacta-gold hover:to-amber-400 cursor-pointer"
                      style={{ height: `${h}%` }}
                      title={`${d._id}: ${(d.revenue || d.count || 0).toLocaleString()} DA`}
                    />
                    <span className="text-[9px] text-gray-400 font-bold">{d._id?.slice(5) || ""}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-48">
              {months.map((m, i) => {
                const fakeH = [40, 55, 45, 70, 60, 80, 90, 65, 75, 55, 85, 95][i];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full rounded-t-xl bg-gradient-to-t from-pacta-navy/30 to-pacta-teal/30" style={{ height: `${fakeH}%` }} />
                    <span className="text-[9px] text-gray-400 font-bold">{m}</span>
                  </div>
                );
              })}
            </div>
          )}
          {monthlyData.length === 0 && (
            <p className="text-center text-xs text-gray-300 mt-2">{isRTL ? "لا توجد بيانات بعد" : "No revenue data yet — sample view"}</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-3xl border border-pacta-sand p-7">
          <h2 className="text-base font-bold text-pacta-navy mb-1">{isRTL ? "حالة الحجوزات" : "Booking Status"}</h2>
          <p className="text-xs text-gray-400 font-medium mb-6">{isRTL ? "توزيع الحجوزات" : "Distribution breakdown"}</p>
          <div className="space-y-4">
            {Object.entries(statusDist).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="capitalize text-gray-600">{status}</span>
                  <span className="text-pacta-navy">{count} ({Math.round((count / totalRes) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-pacta-cream rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${statusColors[status] || "bg-gray-400"}`}
                    style={{ width: `${(count / totalRes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(statusDist).length === 0 && (
              <p className="text-xs text-gray-300 text-center py-6">{isRTL ? "لا توجد حجوزات بعد" : "No bookings yet"}</p>
            )}
          </div>

          {/* By Type */}
          {Object.keys(byType).length > 0 && (
            <div className="mt-6 pt-5 border-t border-pacta-sand">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{isRTL ? "حسب النوع" : "By type"}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(byType).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-pacta-cream rounded-xl">
                    <span className={`w-2 h-2 rounded-full ${typeColors[type] || "bg-gray-400"}`} />
                    <span className="text-xs font-bold text-gray-600">{type}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform summary row */}
      <div className="bg-gradient-to-br from-pacta-navy to-pacta-teal rounded-3xl p-7 text-white">
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp size={18} />
          <h2 className="font-bold text-base">{isRTL ? "ملخص المنصة" : "Platform Summary"}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: isRTL ? "فنادق" : "Hotels", val: overview?.counts?.hotels || 0 },
            { label: isRTL ? "منتجعات" : "Resorts", val: overview?.counts?.resorts || 0 },
            { label: isRTL ? "مرشدون" : "Guides", val: overview?.counts?.guides || 0 },
            { label: isRTL ? "عقارات" : "Rentals", val: overview?.counts?.rentals || 0 },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-white">{item.val}</p>
              <p className="text-xs text-white/60 font-bold uppercase tracking-wider mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
