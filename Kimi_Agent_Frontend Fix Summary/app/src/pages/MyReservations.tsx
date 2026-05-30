import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { reservationService } from "@/services/reservationService";
import {
  Calendar, Users, MessageSquareText, XCircle, CheckCircle2, Clock,
  ShieldCheck, Loader2, ArrowRight, ArrowLeft, Bed, Palmtree,
  Map, Home, Compass, Star, Camera, X, Upload, ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import type { Reservation } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ==================== REVIEW MODAL ====================
interface ReviewModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSubmit: (reservationId: string) => void;
  isRTL: boolean;
}

function ReviewModal({ reservation, onClose, onSubmit, isRTL }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const listingTitle = isRTL
    ? reservation.listingDetails?.titleAr || reservation.listingDetails?.nameAr || reservation.listingDetails?.titleEn
    : reservation.listingDetails?.titleEn || reservation.listingDetails?.nameEn || reservation.listingDetails?.titleAr;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (mediaFiles.length + files.length > 5) {
      toast.error(isRTL ? "الحد الأقصى 5 صور/مقاطع" : "Maximum 5 media files");
      return;
    }
    const newFiles = [...mediaFiles, ...files].slice(0, 5);
    setMediaFiles(newFiles);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setMediaPreviews(previews);
  };

  const removeMedia = (idx: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== idx);
    const newPreviews = mediaPreviews.filter((_, i) => i !== idx);
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const uploadToCloudinary = async (file: File): Promise<{ url: string; type: string; publicId: string } | null> => {
    try {
      const token = localStorage.getItem("pacta_token") || localStorage.getItem("token");
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        return {
          url: data.data.url || data.url,
          type: file.type.startsWith("video") ? "video" : "image",
          publicId: data.data.publicId || data.publicId || "",
        };
      }
    } catch { /* ignore */ }
    return null;
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast.error(isRTL ? "يرجى اختيار تقييم" : "Please select a rating");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error(isRTL ? "التعليق يجب أن يكون 10 أحرف على الأقل" : "Comment must be at least 10 characters");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("pacta_token") || localStorage.getItem("token");

      // Upload media files if any
      let media: { url: string; type: string; publicId: string }[] = [];
      if (mediaFiles.length > 0) {
        const uploads = await Promise.all(mediaFiles.map(uploadToCloudinary));
        media = uploads.filter(Boolean) as typeof media;
      }

      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reservationId: reservation._id,
          rating,
          comment: comment.trim(),
          media,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isRTL ? "تم إرسال تقييمك بنجاح!" : "Review submitted successfully!");
        onSubmit(reservation._id);
        onClose();
      } else {
        toast.error(data.message || "Error");
      }
    } catch {
      toast.error(isRTL ? "حدث خطأ" : "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-pacta-sand">
          <div>
            <h3 className="text-lg font-bold text-pacta-navy">
              {isRTL ? "أضف تقييمك" : "Write a Review"}
            </h3>
            {listingTitle && (
              <p className="text-xs text-gray-400 mt-0.5">{listingTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-pacta-sand/50 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {isRTL ? "تقييمك" : "Your Rating"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      n <= (hoverRating || rating)
                        ? "fill-pacta-gold text-pacta-gold"
                        : "text-gray-200 fill-gray-100"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="self-center text-sm font-bold text-pacta-navy ml-2">
                  {["", "Terrible", "Poor", "Average", "Good", "Excellent"][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {isRTL ? "تعليقك" : "Your Comment"}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder={isRTL ? "شاركنا تجربتك..." : "Share your experience..."}
              className="w-full px-4 py-3 bg-pacta-sand/30 border border-pacta-sand rounded-2xl text-sm text-pacta-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 resize-none"
            />
            <p className="text-[10px] text-gray-300 text-end mt-1">{comment.length}/1000</p>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {isRTL ? "صور / مقاطع (اختياري)" : "Photos / Videos (optional)"}
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {/* Media previews */}
            {mediaPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {mediaPreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-pacta-sand">
                    {mediaFiles[i]?.type.startsWith("video") ? (
                      <video src={src} className="w-full h-full object-cover" />
                    ) : (
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {mediaFiles.length < 5 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-pacta-sand rounded-2xl text-gray-400 text-sm hover:border-pacta-gold/50 hover:text-pacta-gold transition-all"
              >
                <ImagePlus size={16} />
                {isRTL ? "أضف صورة أو مقطع" : "Add photo or video"}
                <span className="text-xs opacity-60">({mediaFiles.length}/5)</span>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 py-3 rounded-2xl border border-pacta-sand text-pacta-navy font-semibold text-sm hover:bg-pacta-sand/30 transition-colors"
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !rating}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><Loader2 size={14} className="animate-spin" /> {isRTL ? "جاري الإرسال..." : "Submitting..."}</>
            ) : (
              <><Star size={14} /> {isRTL ? "إرسال التقييم" : "Submit Review"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function MyReservations() {
  const navigate = useNavigate();
  const { isLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviewTarget, setReviewTarget] = useState<Reservation | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    reservationService
      .getMy()
      .then((res) => { if (res.success) setReservations(res.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm(t("dashboard.confirmCancel"))) return;
    try {
      await reservationService.updateStatus(id, "cancelled");
      setReservations((prev) => prev.map((r) => r._id === id ? { ...r, status: "cancelled" } : r));
      toast.success(isRTL ? "تم الإلغاء" : "Cancelled");
    } catch {
      toast.error(t("dashboard.cancelError"));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
          <CheckCircle2 size={12} /> {t("reservations.status.confirmed")}
        </span>
      );
      case "completed": return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-pacta-navy text-white rounded-xl text-xs font-bold">
          <ShieldCheck size={12} /> {t("reservations.status.completed")}
        </span>
      );
      case "cancelled": return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold">
          <XCircle size={12} /> {t("reservations.status.cancelled")}
        </span>
      );
      default: return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-xs font-bold">
          <Clock size={12} className="animate-pulse" /> {t("reservations.status.pending")}
        </span>
      );
    }
  };

  const getListingIcon = (model: string) => {
    switch (model?.toLowerCase()) {
      case "hotel":  return <Bed size={18} className="text-pacta-navy" />;
      case "resort": return <Palmtree size={18} className="text-pacta-teal" />;
      case "guide":  return <Map size={18} className="text-pacta-gold" />;
      case "rental": return <Home size={18} className="text-pacta-ocean" />;
      default:       return <Compass size={18} className="text-gray-600" />;
    }
  };

  const filtered = filterStatus === "all" ? reservations : reservations.filter((r) => r.status === filterStatus);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream">
        <Loader2 size={32} className="animate-spin text-pacta-navy" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-pacta-navy">{t("reservations.title")}</h1>
        <p className="text-gray-400 font-medium text-sm mt-2">{t("reservations.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: t("dashboard.totalReservations"), val: reservations.length, icon: Compass, color: "text-pacta-navy", bg: "bg-pacta-navy/5" },
          { label: t("dashboard.confirmed"), val: reservations.filter((r) => r.status === "confirmed").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: t("dashboard.pending"), val: reservations.filter((r) => r.status === "pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: t("dashboard.completed"), val: reservations.filter((r) => r.status === "completed").length, icon: ShieldCheck, color: "text-pacta-navy", bg: "bg-pacta-navy/5" },
          { label: t("dashboard.totalRevenue"), val: `${reservations.filter((r) => ["confirmed","completed"].includes(r.status)).reduce((acc,r)=>acc+r.totalPrice,0).toLocaleString()} DA`, icon: ArrowRight, color: "text-pacta-ocean", bg: "bg-pacta-ocean/5" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-pacta-sand shadow-sm">
            <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} ${stat.color} mb-2`}>
              <stat.icon size={16} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.label}</p>
            <p className="text-xl font-bold text-pacta-navy mt-1">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              filterStatus === status
                ? "bg-gradient-to-r from-pacta-navy to-pacta-teal text-white shadow-md"
                : "bg-white text-gray-500 border border-pacta-sand hover:border-pacta-gold/50"
            }`}
          >
            {status === "all" ? t("common.all") : t(`reservations.status.${status as any}`)}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pacta-sand p-20 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-pacta-sand/50 text-gray-300 flex items-center justify-center rounded-3xl mx-auto mb-5">
            <Clock size={32} />
          </div>
          <p className="font-bold text-xl text-pacta-navy mb-2">{t("reservations.noReservations")}</p>
          <p className="text-sm text-gray-400 font-medium mb-6">{t("reservations.startExploring")}</p>
          <button
            onClick={() => navigate("/explore")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            {isRTL ? "استكشف الآن" : "Explore Now"}
            {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((booking) => {
            const listingDetails = booking.listingDetails;
            const title = isRTL
              ? listingDetails?.titleAr || listingDetails?.nameAr
              : listingDetails?.titleEn || listingDetails?.nameEn;
            const isCompleted = booking.status === "completed";
            const alreadyReviewed = reviewedIds.has(booking._id);

            return (
              <div key={booking._id} className="bg-white rounded-3xl border border-pacta-sand shadow-sm hover:shadow-lg hover:shadow-pacta-navy/5 transition-all duration-500 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-11 h-11 rounded-2xl bg-pacta-navy/5 flex items-center justify-center">
                        {getListingIcon(booking.listingModel)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold tracking-[0.15em] text-pacta-navy bg-pacta-navy/5 px-3 py-1 rounded-lg uppercase">
                          {booking.listingModel}
                        </span>
                        {title && <h3 className="font-bold text-pacta-navy text-sm mt-1.5">{title}</h3>}
                      </div>
                      <div className="ms-auto">{getStatusBadge(booking.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-3 bg-pacta-sand/30 p-4 rounded-2xl">
                        <Calendar size={16} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{t("reservations.duration")}</p>
                          <p className="text-xs font-bold text-pacta-navy">
                            {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-pacta-sand/30 p-4 rounded-2xl">
                        <Users size={16} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{t("reservations.guestsLabel")}</p>
                          <p className="text-xs font-bold text-pacta-navy">{booking.guestCount || 1} {isRTL ? "ضيوف" : "Guests"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-pacta-sand/30 p-4 rounded-2xl">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{t("reservations.totalPrice")}</p>
                          <p className="text-sm font-bold text-pacta-navy">
                            {booking.totalPrice?.toLocaleString()}{" "}
                            <span className="text-xs text-pacta-navy bg-pacta-navy/5 px-2 py-0.5 rounded">DA</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-amber-50/40 border border-amber-100/60 rounded-2xl p-4 flex gap-3 items-start">
                        <MessageSquareText size={14} className="text-pacta-gold mt-0.5 shrink-0" />
                        <p className="text-xs font-medium text-gray-600 italic">&ldquo;{booking.specialRequests}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex lg:flex-col gap-2 justify-end">
                    {booking.status === "pending" && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 border border-red-100 text-red-500 font-bold text-xs rounded-2xl hover:bg-red-100 transition-all"
                      >
                        <XCircle size={14} />
                        {t("reservations.cancelBtn")}
                      </button>
                    )}
                    {booking.status === "confirmed" && (
                      <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-2xl">
                        <CheckCircle2 size={14} />
                        {t("reservations.status.confirmed")}
                      </div>
                    )}
                    {/* Review button for completed reservations */}
                    {isCompleted && !alreadyReviewed && (
                      <button
                        onClick={() => setReviewTarget(booking)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pacta-gold to-amber-400 text-white font-bold text-xs rounded-2xl hover:opacity-90 transition-all shadow-md"
                      >
                        <Star size={14} />
                        {isRTL ? "أضف تقييم" : "Write Review"}
                      </button>
                    )}
                    {isCompleted && alreadyReviewed && (
                      <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pacta-gold/10 border border-pacta-gold/30 text-pacta-gold font-bold text-xs rounded-2xl">
                        <Star size={14} className="fill-pacta-gold" />
                        {isRTL ? "تم التقييم" : "Reviewed"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          reservation={reviewTarget}
          isRTL={isRTL}
          onClose={() => setReviewTarget(null)}
          onSubmit={(id) => setReviewedIds((prev) => new Set([...prev, id]))}
        />
      )}
    </div>
  );
}
