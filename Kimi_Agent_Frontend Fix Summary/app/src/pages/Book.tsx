import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { providerService } from "@/services/listingService";
import { reservationService } from "@/services/reservationService";
import { MapPin, Star, Users, MessageSquare, ShieldCheck, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { UnifiedListing } from "@/types";

export default function Book() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();

  const [listing, setListing] = useState<UnifiedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [error, setError] = useState("");

  const listingType = searchParams.get("type") || "Hotel";

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (id) {
      providerService.getById(id).then((res) => {
        if (res.success) setListing(res.data ?? null);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  const days = calculateDays();
  const pricePerUnit = listing?.pricePerNight || listing?.pricePerDay || listing?.price || 0;
  const totalPrice = days * pricePerUnit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (days <= 0) { setError(isRTL ? "يرجى اختيار تواريخ صحيحة" : "Please select valid dates"); return; }
    setError("");
    setBookingLoading(true);
    try {
      const payload = {
        listingId: id!,
        listingModel: listingType.charAt(0).toUpperCase() + listingType.slice(1),
        startDate, endDate, guestCount, totalPrice, specialRequests, currency: "DZD",
      };
      const res = await reservationService.create(payload);
      if (res.success) {
        setSuccess(true);
        toast.success(t("listing.bookingSuccess"));
        setTimeout(() => navigate("/reservations"), 2000);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setError(err.message || t("listing.bookingError"));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream">
        <Loader2 size={32} className="animate-spin text-pacta-navy" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream">
        <p className="text-gray-400 font-bold">{t("listing.notFound")}</p>
      </div>
    );
  }

  const title = isRTL ? listing.titleAr || listing.nameAr : listing.titleEn || listing.nameEn;
  const images = listing.images?.length ? listing.images : listing.image ? [listing.image] : [];
  const unitLabel = listing.pricePerDay ? t("listing.priceDay") : t("listing.priceNight");
  const maxGuests = listing.maxCapacity || listing.maxGuests || 10;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Listing Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-pacta-sand p-6">
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 h-56 rounded-2xl overflow-hidden mb-5">
                <div className="col-span-1 h-full"><img src={images[0]} alt="" className="w-full h-full object-cover" /></div>
                <div className="grid grid-rows-2 gap-2 h-full">
                  {images[1] && <div className="h-full"><img src={images[1]} alt="" className="w-full h-full object-cover" /></div>}
                  {images[2] && <div className="h-full"><img src={images[2]} alt="" className="w-full h-full object-cover" /></div>}
                </div>
              </div>
            )}
            <h1 className="text-xl font-bold text-pacta-navy">{title}</h1>
            <div className="flex items-center gap-4 text-sm font-semibold text-gray-400 mt-3">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-pacta-gold" />{listing.wilaya}</span>
              <span className="flex items-center gap-1.5 text-amber-500"><Star size={14} className="fill-current" />{listing.rating?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Right - Booking Form */}
        <div className="bg-white rounded-3xl border border-pacta-sand p-6 lg:p-8">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-lg font-bold text-pacta-navy">{isRTL ? "تأكيد الحجز" : "Confirm Booking"}</h2>
            <p className="text-xl font-bold text-pacta-navy">{pricePerUnit.toLocaleString()} <span className="text-xs font-semibold text-gray-400">DA/{unitLabel}</span></p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-pacta-navy/5 rounded-2xl mb-6">
            <ShieldCheck size={18} className="text-pacta-green shrink-0" />
            <span className="text-xs font-bold text-pacta-navy/70">{t("listing.cashOnArrival")}</span>
          </div>

          {success ? (
            <div className="p-8 bg-pacta-green/10 border border-pacta-green/20 rounded-3xl text-center">
              <CheckCircle size={48} className="text-pacta-green mx-auto mb-4" />
              <p className="font-bold text-pacta-navy text-lg">{t("listing.bookingSuccess")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{listingType === "guide" ? t("listing.tourStart") : t("listing.checkIn")}</label>
                  <input type="date" required min={new Date().toISOString().split("T")[0]} value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3.5 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{listingType === "guide" ? t("listing.tourEnd") : t("listing.checkOut")}</label>
                  <input type="date" required min={startDate || new Date().toISOString().split("T")[0]} value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3.5 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{t("listing.guests")}</label>
                <div className="flex items-center bg-pacta-sand/40 border border-pacta-sand rounded-2xl px-4">
                  <Users size={14} className="text-gray-400" />
                  <input type="number" min={1} max={maxGuests} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-transparent border-0 py-3.5 px-2 text-xs font-bold focus:outline-none text-pacta-navy" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{t("listing.specialRequestsLabel")}</label>
                <div className="flex bg-pacta-sand/40 border border-pacta-sand rounded-2xl px-4 py-3">
                  <MessageSquare size={14} className="text-gray-400 mt-1 shrink-0" />
                  <textarea rows={2} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder={isRTL ? "أي طلبات خاصة..." : "Any special requests..."}
                    className="w-full bg-transparent border-0 text-xs font-medium focus:outline-none resize-none px-2 text-pacta-navy placeholder:text-gray-300" />
                </div>
              </div>

              {days > 0 && (
                <div className="bg-pacta-sand/40 rounded-2xl p-5 space-y-3 border border-pacta-sand">
                  <div className="flex justify-between font-semibold text-gray-500 text-xs">
                    <span>{isRTL ? "المدة" : "Duration"}: {days} {isRTL ? "يوم" : "days"}</span>
                    <span>{pricePerUnit.toLocaleString()} DA x {days}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t border-pacta-sand pt-3">
                    <span className="text-pacta-navy">{t("listing.totalPrice")}:</span>
                    <span className="text-pacta-navy">{totalPrice.toLocaleString()} DA</span>
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-xs font-bold p-4 bg-red-50 rounded-2xl">{error}</p>}

              <button type="submit" disabled={bookingLoading || success}
                className="w-full py-4 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-pacta-navy/25 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2">
                {bookingLoading ? <Loader2 size={18} className="animate-spin" /> : t("listing.bookNow")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
