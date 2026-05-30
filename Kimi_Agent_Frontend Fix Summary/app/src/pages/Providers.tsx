import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGlobalData } from "@/contexts/DataContext";
import { Bed, Palmtree, Compass, Home, MapPin, Star } from "lucide-react";

export default function Providers() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { providers, loading } = useGlobalData();
  const { t, isRTL } = useLanguage();

  const typeMap: Record<string, { label: string; icon: any; gradient: string }> = {
    hotel: { label: t("providers.hotels"), icon: Bed, gradient: "from-pacta-navy to-pacta-teal" },
    resort: { label: t("providers.resorts"), icon: Palmtree, gradient: "from-pacta-teal to-pacta-green" },
    guide: { label: t("providers.guides"), icon: Compass, gradient: "from-pacta-gold to-amber-500" },
    rental: { label: t("providers.rentals"), icon: Home, gradient: "from-pacta-ocean to-sky-500" },
  };

  const config = typeMap[type || "hotel"] || typeMap.hotel;
  const Icon = config.icon;

  const filtered = providers.filter((p) =>
    p.listingType?.toLowerCase() === (type || "hotel").toLowerCase()
  );

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-pacta-navy">{config.label}</h1>
          <p className="text-gray-400 text-sm font-medium">{filtered.length} {isRTL ? "نتيجة" : "results"}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-3 border-pacta-navy border-t-pacta-gold rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold text-lg">{isRTL ? "لا توجد نتائج" : "No providers found"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => {
            const title = isRTL ? item.titleAr || item.nameAr : item.titleEn || item.nameEn;
            const price = item.pricePerNight || item.pricePerDay || item.price || 0;
            const unit = item.pricePerDay ? t("listing.priceDay") : t("listing.priceNight");
            return (
              <div key={item._id} className="bg-white rounded-3xl border border-pacta-sand/80 overflow-hidden hover:shadow-xl hover:shadow-pacta-navy/5 hover:border-pacta-gold/20 transition-all duration-500 group">
                <div className="relative h-44 bg-pacta-sand overflow-hidden cursor-pointer" onClick={() => navigate(`/listing/${item._id}?type=${item.listingType}`)}>
                  {item.images?.[0] || item.image ? (
                    <img src={item.images?.[0] || item.image!} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${config.gradient} bg-opacity-10`}>
                      <Icon size={32} className="text-white/50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-600">{item.rating?.toFixed(1) || "5.0"}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-pacta-navy text-sm mb-2 line-clamp-1">{title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                    <MapPin size={12} className="text-pacta-gold" />
                    <span>{item.wilaya}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-pacta-navy">{price.toLocaleString()} DA<span className="text-[10px] font-medium text-gray-400 ml-1">/{unit}</span></span>
                    <button onClick={() => navigate(`/book/${item._id}?type=${item.listingType}`)}
                      className="px-4 py-2 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white text-[11px] font-bold rounded-xl hover:shadow-lg transition-all duration-300">
                      {t("providers.bookDirect")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
