import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { providerService, categoryService } from "@/services/listingService";
import { WILAYAS } from "@/lib/constants";
import {
  Search,
  MapPin,
  Star,
  Bed,
  Palmtree,
  Compass,
  Home,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import type { UnifiedListing, Category } from "@/types";

export default function Explore() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState<UnifiedListing[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const typeParam = searchParams.get("type") || "";
  const categoryParam = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const wilayaParam = searchParams.get("wilaya") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchListings();
  }, [searchParams, page]);

  const fetchListings = async () => {
    setLoading(true);

    try {
      const params = {
        type: typeParam || undefined,
        category: categoryParam || undefined,
        search: searchQuery || undefined,
        wilaya: wilayaParam || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        page,
        limit: 12,
      };

      console.log("REQUEST PARAMS:", params);

      const res = await providerService.getListings(params);

      console.log("FULL RESPONSE:", res);

      const data = res?.data;

      if (!data || typeof data !== "object") {
        setListings([]);
        setTotal(0);
        return;
      }

      let flat = data;
      console.log("FLAT:", flat);

      // ✅ CLIENT-SIDE FILTER FALLBACK (important if backend ignores filters)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        flat = flat.filter((i) =>
          (i.titleEn || i.titleAr || "").toLowerCase().includes(q),
        );
      }

      if (wilayaParam) {
        flat = flat.filter((i) => i.wilaya === wilayaParam);
      }

      if (minPrice) {
        flat = flat.filter((i) => (i.pricePerNight || 0) >= Number(minPrice));
      }

      if (maxPrice) {
        flat = flat.filter((i) => (i.pricePerNight || 0) <= Number(maxPrice));
      }

      // optional sort (frontend fallback)
      if (sortBy === "pricePerNight") {
        flat.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
      }

      setListings(flat);
      setTotal(flat.length);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setListings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== "page") newParams.delete("page");
    setSearchParams(newParams);
    setPage(1);
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "hotel":
        return <Bed size={16} />;
      case "resort":
        return <Palmtree size={16} />;
      case "guide":
        return <Compass size={16} />;
      case "rental":
        return <Home size={16} />;
      default:
        return <Compass size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case "hotel":
        return isRTL ? "فندق" : "Hotel";
      case "resort":
        return isRTL ? "منتجع" : "Resort";
      case "guide":
        return isRTL ? "مرشد" : "Guide";
      case "rental":
        return isRTL ? "عقار" : "Rental";
      default:
        return type;
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10"
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-pacta-navy">
          {searchQuery
            ? `${isRTL ? "نتائج البحث: " : "Search Results: "}${searchQuery}`
            : t("nav.explore")}
        </h1>
        <p className="text-gray-400 font-medium text-sm mt-2">
          {total} {isRTL ? "نتيجة" : "results found"}
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-3xl border border-pacta-sand p-5 mb-8 space-y-4 shadow-sm shadow-pacta-navy/5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-300 ${isRTL ? "right-4" : "left-4"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder={
                isRTL
                  ? "ابحث عن فنادق، منتجعات، مرشدين..."
                  : "Search hotels, resorts, guides..."
              }
              className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-3.5 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy placeholder:text-gray-300`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-pacta-sand rounded-2xl font-bold text-sm text-gray-500 hover:border-pacta-gold/50 hover:text-pacta-navy transition-all duration-300"
          >
            <SlidersHorizontal size={16} />
            {isRTL ? "التصفية" : "Filters"}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter("type", "")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${!typeParam ? "bg-gradient-to-r from-pacta-navy to-pacta-teal text-white shadow-md" : "bg-pacta-sand/50 text-gray-500 hover:bg-pacta-gold/10 hover:text-pacta-navy"}`}
          >
            {t("common.all")}
          </button>
          {["hotel", "resort", "guide", "rental"].map((typeValue) => (
            <button
              key={typeValue}
              onClick={() => updateFilter("type", typeValue)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 capitalize ${typeParam === typeValue ? "bg-gradient-to-r from-pacta-navy to-pacta-teal text-white shadow-md" : "bg-pacta-sand/50 text-gray-500 hover:bg-pacta-gold/10 hover:text-pacta-navy"}`}
            >
              {getTypeLabel(typeValue)}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-pacta-sand">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 block">
                {isRTL ? "الولاية" : "Wilaya"}
              </label>
              <select
                value={wilayaParam}
                onChange={(e) => updateFilter("wilaya", e.target.value)}
                className="w-full p-3 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy"
              >
                <option value="">{isRTL ? "الكل" : "All"}</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 block">
                {isRTL ? "الحد الأدنى" : "Min Price"}
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                className="w-full p-3 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy"
                placeholder="DA"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 block">
                {isRTL ? "الحد الأقصى" : "Max Price"}
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                className="w-full p-3 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy"
                placeholder="DA"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 block">
                {isRTL ? "الترتيب" : "Sort"}
              </label>
              <select
                value={sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="w-full p-3 bg-pacta-sand/40 border border-pacta-sand rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-pacta-gold/40 text-pacta-navy"
              >
                <option value="createdAt">{isRTL ? "الأحدث" : "Newest"}</option>
                <option value="pricePerNight">
                  {isRTL ? "السعر" : "Price"}
                </option>
                <option value="rating">{isRTL ? "التقييم" : "Rating"}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-pacta-navy" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold text-lg">
            {isRTL ? "لا توجد نتائج" : "No results found"}
          </p>
          <p className="text-gray-300 text-sm mt-1">
            {isRTL
              ? "جرب تعديل معايير البحث"
              : "Try adjusting your search criteria"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((item) => {
            const title = isRTL
              ? item.titleAr || item.nameAr
              : item.titleEn || item.nameEn;
            const price =
              item.pricePerNight || item.pricePerDay || item.price || 0;
            const unit = item.pricePerDay
              ? t("listing.priceDay")
              : t("listing.priceNight");
            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-pacta-sand/80 overflow-hidden hover:shadow-xl hover:shadow-pacta-navy/5 hover:border-pacta-gold/20 transition-all duration-500 group"
              >
                <div
                  className="relative h-44 bg-pacta-sand overflow-hidden cursor-pointer"
                  onClick={() =>
                    navigate(`/listing/${item._id}?type=${item.listingType}`)
                  }
                >
                  {item.images?.[0] || item.image ? (
                    <img
                      src={item.images?.[0] || item.image!}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pacta-navy/5 to-pacta-teal/10 flex items-center justify-center text-pacta-navy/20">
                      {getIcon(item.listingType)}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 right-3 flex justify-between">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-pacta-navy rounded-xl flex items-center gap-1">
                      {getIcon(item.listingType)}{" "}
                      {getTypeLabel(item.listingType)}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur text-[10px] font-bold text-amber-600 rounded-xl">
                      <Star
                        size={10}
                        className="fill-amber-500 text-amber-500"
                      />{" "}
                      {item.rating?.toFixed(1) || "5.0"}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-pacta-navy text-sm mb-2 line-clamp-1">
                    {title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                    <MapPin size={12} className="text-pacta-gold" />
                    <span className="line-clamp-1">{item.wilaya}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-pacta-navy">
                      {price.toLocaleString()} DA
                      <span className="text-[10px] font-medium text-gray-400 ml-1">
                        /{unit}
                      </span>
                    </span>
                    <button
                      onClick={() =>
                        navigate(`/book/${item._id}?type=${item.listingType}`)
                      }
                      className="px-4 py-2 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white text-[11px] font-bold rounded-xl hover:shadow-lg hover:shadow-pacta-navy/20 transition-all duration-300"
                    >
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
