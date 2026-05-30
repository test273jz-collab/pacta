import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { providerService } from "@/services/listingService";
import { reviewService, wishlistService } from "@/services/otherServices";
import {
  MapPin, Star, ArrowLeft, Heart, Wifi, Wind, Waves, Utensils, Car,
  Dumbbell, BedDouble, Bath, Users, Check, Loader2, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { UnifiedListing, Review, ReviewSummary } from "@/types";
import { reviewExtService } from "@/services/otherServices";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();

  const [listing, setListing] = useState<UnifiedListing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [, setActiveImage] = useState(0);
  const [helpfulVoted, setHelpfulVoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listingRes, reviewsRes, summaryRes] = await Promise.all([
        providerService.getById(id!),
        reviewService.getByListing(id!, { limit: 5 }),
        reviewService.getSummary(id!),
      ]);
      if (listingRes.success) setListing(listingRes.data ?? null);
      if (reviewsRes.success) setReviews(reviewsRes.data || []);
      if (summaryRes.success) setReviewSummary(summaryRes.data);

      if (isAuthenticated) {
        wishlistService.check(id!).then((res) => {
          if (res.success) setInWishlist(res.data?.inWishlist ?? false);
        }).catch(() => {});
      }
    } catch {
      toast.error(t("listing.notFound"));
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    try {
      if (inWishlist) {
        toast.success(isRTL ? "تمت الإزالة" : "Removed from wishlist");
        setInWishlist(false);
      } else {
        await wishlistService.add({
          listingId: id!,
          listingModel: (searchParams.get("type") || "Hotel") as any,
        });
        setInWishlist(true);
        toast.success(isRTL ? "تمت الإضافة" : "Added to wishlist");
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const getAmenityIcons = (amenity: string) => {
    const map: Record<string, any> = {
      hasPool: <Waves size={14} />, hasSpa: <Star size={14} />, hasGym: <Dumbbell size={14} />,
      hasFreeParking: <Car size={14} />, hasRestaurant: <Utensils size={14} />,
      breakfastIncluded: <Utensils size={14} />, hasWiFi: <Wifi size={14} />, hasAC: <Wind size={14} />,
      hasKitchen: <Utensils size={14} />, hasPrivateEntrance: <Check size={14} />,
      hasPrivateBeach: <Waves size={14} />, hasWaterpark: <Waves size={14} />,
      hasClub: <Star size={14} />, hasSportsCourts: <Dumbbell size={14} />,
      hasKidsClub: <Users size={14} />, hasParking: <Car size={14} />, hasWasher: <Check size={14} />,
    };
    return map[amenity] || <Check size={14} />;
  };

  const getAmenityLabel = (amenity: string) => {
    const labels: Record<string, string> = {
      hasPool: isRTL ? "مسبح" : "Pool", hasSpa: isRTL ? "سبا" : "Spa", hasGym: isRTL ? "جيم" : "Gym",
      hasFreeParking: isRTL ? "موقف مجاني" : "Free Parking", hasRestaurant: isRTL ? "مطعم" : "Restaurant",
      breakfastIncluded: isRTL ? "إفطار" : "Breakfast", hasWiFi: "WiFi", hasAC: isRTL ? "مكيف" : "AC",
      hasKitchen: isRTL ? "مطبخ" : "Kitchen", hasPrivateEntrance: isRTL ? "مدخل خاص" : "Private Entrance",
      hasPrivateBeach: isRTL ? "شاطئ خاص" : "Private Beach", hasWaterpark: isRTL ? "منتزه مائي" : "Waterpark",
      hasClub: isRTL ? "نادي" : "Club", hasSportsCourts: isRTL ? "ملاعب" : "Sports Courts",
      hasKidsClub: isRTL ? "نادي أطفال" : "Kids Club", hasParking: isRTL ? "موقف" : "Parking",
      hasWasher: isRTL ? "غسالة" : "Washer",
    };
    return labels[amenity] || amenity;
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
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream px-4">
        <div className="text-center">
          <p className="text-gray-400 font-bold text-lg mb-4">{t("listing.notFound")}</p>
          <button onClick={() => navigate("/explore")} className="px-6 py-3 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl">
            {t("listing.backToExplore")}
          </button>
        </div>
      </div>
    );
  }

  const title = isRTL ? listing.titleAr || listing.nameAr : listing.titleEn || listing.nameEn;
  const desc = isRTL ? listing.descAr : listing.descEn;
  const images = listing.images?.length ? listing.images : listing.image ? [listing.image] : [];
  const price = listing.pricePerNight || listing.pricePerDay || listing.price || 0;
  const unit = listing.pricePerDay ? t("listing.priceDay") : t("listing.priceNight");
  const listingType = searchParams.get("type") || listing.listingType;

  const amenities: string[] = [];
  if (listing.amenities) {
    Object.entries(listing.amenities).forEach(([k, v]) => { if (v) amenities.push(k); });
  }
  if (listing.houseFeatures) {
    Object.entries(listing.houseFeatures).forEach(([k, v]) => { if (v) amenities.push(k); });
  }
  if (listing.leisureActivities) {
    Object.entries(listing.leisureActivities).forEach(([k, v]) => { if (v) amenities.push(k); });
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Breadcrumb */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-pacta-navy mb-6 transition-colors">
        <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
        {t("listing.backToExplore")}
      </button>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-pacta-navy/5 text-pacta-navy text-[10px] font-bold uppercase tracking-wider rounded-xl">
              {listingType}
            </span>
            {listing.propertyClass && (
              <div className="flex items-center gap-0.5">
                {[...Array(listing.propertyClass)].map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-pacta-navy">{title}</h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mt-2">
            <MapPin size={14} className="text-pacta-gold" />
            <span>{listing.wilaya}</span>
            <span className="text-gray-200 mx-1">·</span>
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-bold text-pacta-navy">{listing.rating?.toFixed(1) || "5.0"}</span>
            <span className="text-gray-300">({listing.reviewCount || 0} {isRTL ? "تقييم" : "reviews"})</span>
          </div>
        </div>
        <button onClick={handleWishlist}
          className={`p-3 rounded-2xl border transition-all duration-300 ${inWishlist ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-pacta-sand text-gray-400 hover:text-red-500 hover:border-red-200"}`}>
          <Heart size={20} className={inWishlist ? "fill-current" : ""} />
        </button>
      </div>

      {/* Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-3xl overflow-hidden mb-10 h-[300px] md:h-[450px]">
          <div className="relative h-full cursor-pointer" onClick={() => setActiveImage(0)}>
            <img src={images[0]} alt="" className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="hidden md:grid grid-cols-2 gap-2 h-full">
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative h-full cursor-pointer" onClick={() => setActiveImage(i + 1)}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-3xl border border-pacta-sand p-6 sm:p-8">
            <h2 className="text-lg font-bold text-pacta-navy mb-4">{t("listing.description")}</h2>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">{desc || (isRTL ? "لا يوجد وصف" : "No description available")}</p>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="bg-white rounded-3xl border border-pacta-sand p-6 sm:p-8">
              <h2 className="text-lg font-bold text-pacta-navy mb-5">{t("listing.features")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 p-3.5 bg-pacta-sand/40 rounded-2xl">
                    <span className="text-pacta-navy">{getAmenityIcons(amenity)}</span>
                    <span className="text-sm font-semibold text-gray-700">{getAmenityLabel(amenity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structure */}
          {listing.structure && (
            <div className="bg-white rounded-3xl border border-pacta-sand p-6 sm:p-8">
              <h2 className="text-lg font-bold text-pacta-navy mb-5">{t("profile.structure")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: BedDouble, val: listing.structure.roomsCount, label: isRTL ? "غرف" : "Rooms" },
                  { icon: Bath, val: listing.structure.bathroomsCount, label: isRTL ? "حمامات" : "Baths" },
                  { icon: Users, val: listing.structure.maxGuests, label: isRTL ? "ضيوف" : "Guests" },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-pacta-sand/40 rounded-2xl text-center">
                    <item.icon size={20} className="mx-auto text-pacta-navy/40 mb-2" />
                    <p className="text-2xl font-bold text-pacta-navy">{item.val}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-3xl border border-pacta-sand p-6 sm:p-8">
            {/* Header + Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-pacta-navy">
                {isRTL ? "التقييمات" : "Reviews"} ({reviewSummary?.totalReviews || 0})
              </h2>
              {reviewSummary && reviewSummary.totalReviews > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="text-xl font-bold text-pacta-navy">{reviewSummary.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400 font-medium">/ 5</span>
                </div>
              )}
            </div>

            {/* Rating Distribution */}
            {reviewSummary && reviewSummary.totalReviews > 0 && reviewSummary.distribution && (
              <div className="mb-6 p-4 bg-pacta-cream rounded-2xl space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = (reviewSummary as any).distribution?.[star] || 0;
                  const pct = reviewSummary.totalReviews > 0 ? (count / reviewSummary.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-10 flex-shrink-0">
                        <span className="text-xs font-bold text-gray-500">{star}</span>
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Review Cards */}
            {reviews.length === 0 ? (
              <div className="text-center py-10">
                <Star size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm font-medium">{isRTL ? "لا توجد تقييمات بعد" : "No reviews yet"}</p>
                <p className="text-gray-300 text-xs mt-1">{isRTL ? "كن أول من يقيّم هذه الخدمة" : "Be the first to review this listing"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="p-5 bg-pacta-sand/30 rounded-2xl border border-pacta-sand/60 hover:border-pacta-gold/20 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pacta-navy to-pacta-teal text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {review.tourist?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-pacta-navy">{review.tourist?.name || "User"}</p>
                            {(review as any).isVerifiedTrip && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-lg">
                                <Check size={8} /> {isRTL ? "رحلة موثقة" : "Verified Trip"}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.createdAt && (
                        <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">
                          {new Date(review.createdAt).toLocaleDateString(isRTL ? "ar-DZ" : "en-US", { month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed mb-3">{review.comment}</p>

                    {/* Helpful Vote */}
                    <button
                      onClick={async () => {
                        if (!isAuthenticated) { navigate("/login"); return; }
                        try {
                          await reviewExtService.voteHelpful(review._id);
                          setHelpfulVoted((prev) => {
                            const next = new Set(prev);
                            if (next.has(review._id)) next.delete(review._id); else next.add(review._id);
                            return next;
                          });
                        } catch { /**/ }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        helpfulVoted.has(review._id)
                          ? "bg-pacta-navy/10 text-pacta-navy"
                          : "bg-pacta-cream hover:bg-pacta-sand text-gray-500"
                      }`}
                    >
                      👍 {isRTL ? "مفيد" : "Helpful"}
                      {(review as any).helpfulCount > 0 && (
                        <span className="opacity-60">({(review as any).helpfulCount})</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-3xl border border-pacta-sand p-6 sm:p-8 shadow-sm">
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-3xl font-bold text-pacta-navy">{price.toLocaleString()} DA</span>
              <span className="text-sm text-gray-400 font-medium">/{unit}</span>
            </div>

            <div className="flex items-center gap-3 p-4 bg-pacta-navy/5 rounded-2xl mb-6">
              <ShieldCheck size={18} className="text-pacta-green shrink-0" />
              <span className="text-xs font-bold text-pacta-navy/70">{t("listing.cashOnArrival")}</span>
            </div>

            <button
              onClick={() => navigate(`/book/${id}?type=${listingType}`)}
              className="w-full py-4 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-pacta-navy/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              {t("listing.bookNow")}
            </button>

            <div className="mt-8 space-y-4 pt-6 border-t border-pacta-sand">
              {listing.roomsAvailable !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">{isRTL ? "الغرف المتاحة" : "Rooms Available"}</span>
                  <span className="font-bold text-pacta-navy">{listing.roomsAvailable}</span>
                </div>
              )}
              {listing.maxCapacity !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">{isRTL ? "السعة القصوى" : "Max Capacity"}</span>
                  <span className="font-bold text-pacta-navy">{listing.maxCapacity}</span>
                </div>
              )}
              {listing.maxGuests !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">{isRTL ? "الضيوف" : "Max Guests"}</span>
                  <span className="font-bold text-pacta-navy">{listing.maxGuests}</span>
                </div>
              )}
              {listing.maxGroupSize !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">{isRTL ? "حجم المجموعة" : "Group Size"}</span>
                  <span className="font-bold text-pacta-navy">{listing.maxGroupSize}</span>
                </div>
              )}
              {listing.languagesSpoken && listing.languagesSpoken.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">{isRTL ? "اللغات" : "Languages"}</span>
                  <span className="font-bold text-pacta-navy">{listing.languagesSpoken.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
