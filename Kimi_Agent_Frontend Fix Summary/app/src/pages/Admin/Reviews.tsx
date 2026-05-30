import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Star, Flag, CheckCircle, XCircle, Loader2, Search, Filter,
  ShieldCheck, AlertTriangle, Trash2, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

// Minimal API call helper — reuses whatever base URL the project uses
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const fetchApi = async (path: string, options?: RequestInit) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    ...options,
  });
  return res.json();
};

interface ReviewDoc {
  _id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  isFlagged: boolean;
  reportCount: number;
  isVerifiedTrip: boolean;
  helpfulCount: number;
  createdAt: string;
  tourist?: { name: string; email: string; avatar?: string };
  listingModel: string;
}

export default function AdminReviews() {
  const { isRTL } = useLanguage();
  const [reviews, setReviews] = useState<ReviewDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "flagged" | "pending">("all");
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter === "flagged") params.set("isFlagged", "true");
      if (filter === "pending") params.set("isApproved", "false");
      const res = await fetchApi(`/reviews/admin/all?${params}`);
      if (res.success) setReviews(res.data || []);
    } catch {
      toast.error(isRTL ? "فشل تحميل التقييمات" : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [filter, isRTL]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const moderate = async (id: string, action: "approve" | "reject") => {
    setActing(id);
    try {
      const res = await fetchApi(`/reviews/${id}/moderate`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      if (res.success) {
        toast.success(isRTL ? `تم ${action === "approve" ? "القبول" : "الرفض"}` : `Review ${action}d`);
        setReviews((prev) =>
          prev.map((r) => r._id === id ? { ...r, isApproved: action === "approve", isFlagged: false } : r)
        );
      } else {
        toast.error(res.message || "Error");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActing(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm(isRTL ? "هل أنت متأكد من الحذف؟" : "Delete this review?")) return;
    setActing(id);
    try {
      const res = await fetchApi(`/reviews/${id}`, { method: "DELETE" });
      if (res.success) {
        toast.success(isRTL ? "تم الحذف" : "Deleted");
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      toast.error("Error");
    } finally {
      setActing(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.comment.toLowerCase().includes(q) || r.tourist?.name.toLowerCase().includes(q) || false;
  });

  const counts = {
    all: reviews.length,
    flagged: reviews.filter((r) => r.isFlagged).length,
    pending: reviews.filter((r) => !r.isApproved).length,
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl shadow-lg">
          <Star size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-pacta-navy">{isRTL ? "إدارة التقييمات" : "Reviews Management"}</h1>
          <p className="text-gray-400 text-sm">{isRTL ? "مراجعة واعتماد تقييمات المستخدمين" : "Moderate and manage user reviews"}</p>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {(["all", "flagged", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === f
                  ? "bg-pacta-navy text-white shadow-sm"
                  : "bg-white border border-pacta-sand text-gray-500 hover:border-pacta-navy/30"
              }`}
            >
              {f === "all" && (isRTL ? "الكل" : "All")} {" "}
              {f === "flagged" && (isRTL ? "مُبلَّغ عنها" : "Flagged")} {" "}
              {f === "pending" && (isRTL ? "معلقة" : "Pending")}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-lg bg-current/10 text-xs">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search size={14} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3" : "left-3"} text-gray-400`} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? "بحث في التقييمات..." : "Search reviews..."}
            className={`w-full ${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"} py-2.5 rounded-xl border border-pacta-sand bg-white text-sm outline-none focus:border-pacta-navy/30`}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-pacta-navy" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">{isRTL ? "لا توجد تقييمات" : "No reviews found"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div
              key={review._id}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                review.isFlagged ? "border-rose-200 bg-rose-50/30" : "border-pacta-sand"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: User + Content */}
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pacta-navy to-pacta-teal text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {review.tourist?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-pacta-navy">{review.tourist?.name || "Unknown"}</span>
                      <span className="text-[10px] text-gray-400">{review.tourist?.email}</span>
                      {review.isVerifiedTrip && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg">
                          <ShieldCheck size={9} /> {isRTL ? "موثق" : "Verified"}
                        </span>
                      )}
                      {review.isFlagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-500 text-[10px] font-bold rounded-lg">
                          <Flag size={9} /> {isRTL ? "مُبلَّغ" : "Flagged"}
                        </span>
                      )}
                      {!review.isApproved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg">
                          <AlertTriangle size={9} /> {isRTL ? "معلق" : "Pending"}
                        </span>
                      )}
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">{review.listingModel}</span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.comment}</p>

                    <div className="flex gap-4 mt-2 text-[11px] text-gray-400 font-medium">
                      <span>{new Date(review.createdAt).toLocaleDateString(isRTL ? "ar-DZ" : "en-US")}</span>
                      {review.helpfulCount > 0 && <span>👍 {review.helpfulCount}</span>}
                      {review.reportCount > 0 && <span className="text-rose-400">🚩 {review.reportCount} {isRTL ? "بلاغ" : "reports"}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!review.isApproved && (
                    <button
                      onClick={() => moderate(review._id, "approve")}
                      disabled={acting === review._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {acting === review._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      {isRTL ? "قبول" : "Approve"}
                    </button>
                  )}
                  {review.isApproved && (
                    <button
                      onClick={() => moderate(review._id, "reject")}
                      disabled={acting === review._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {acting === review._id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                      {isRTL ? "رفض" : "Reject"}
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review._id)}
                    disabled={acting === review._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    {isRTL ? "حذف" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
