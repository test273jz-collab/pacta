import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { wishlistService } from "@/services/otherServices";
import { Heart, MapPin, Loader2, ArrowRight, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Wishlist() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistService.getMy().then((res) => {
      if (res.success) setItems(res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await wishlistService.remove(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success(isRTL ? "تمت الإزالة" : "Removed");
    } catch {
      toast.error(t("common.error"));
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
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-pacta-navy mb-8">{t("wishlist.title")}</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pacta-sand p-20 text-center max-w-xl mx-auto">
          <Heart size={48} className="text-gray-200 mx-auto mb-5" />
          <p className="font-bold text-xl text-pacta-navy mb-2">{t("wishlist.empty")}</p>
          <p className="text-sm text-gray-400 font-medium mb-6">{t("wishlist.explore")}</p>
          <button onClick={() => navigate("/explore")} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300">
            {isRTL ? "استكشف الآن" : "Explore Now"}{isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-3xl border border-pacta-sand/80 overflow-hidden hover:shadow-xl hover:shadow-pacta-navy/5 transition-all duration-500 group">
              <div className="relative h-44 bg-pacta-sand cursor-pointer" onClick={() => navigate(`/listing/${item.listingId}?type=${item.listingModel}`)}>
                {item.listingDetails?.images?.[0] ? (
                  <img src={item.listingDetails.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pacta-navy/5 to-pacta-teal/10 flex items-center justify-center text-pacta-navy/20">
                    <Heart size={32} />
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleRemove(item._id); }}
                  className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-xl text-red-500 hover:bg-red-50 transition-all duration-300">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-pacta-navy text-sm mb-2">{item.listingDetails?.titleEn || item.listingDetails?.nameEn || item.listingId}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                  <MapPin size={12} className="text-pacta-gold" /><span>{item.listingDetails?.wilaya || "Algiers"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-pacta-navy">{(item.listingDetails?.pricePerNight || item.listingDetails?.pricePerDay || 0).toLocaleString()} DA</span>
                  <button onClick={() => navigate(`/book/${item.listingId}?type=${item.listingModel}`)}
                    className="px-4 py-2 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white text-[11px] font-bold rounded-xl hover:shadow-lg transition-all duration-300">
                    {t("providers.bookDirect")}
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
