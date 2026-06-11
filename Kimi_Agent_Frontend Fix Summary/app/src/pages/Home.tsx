import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGlobalData } from "@/contexts/DataContext";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Bed,
  Palmtree,
  Map,
  Home as HomeIcon,
  Star,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Sparkles,
  ExternalLink,
  CalendarCheck,
} from "lucide-react";
import MiniAssistant from "@/components/MiniAssistant";

export default function Home() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

   const ads = [
    {
      _id: "6a23f22caec2971665f5b36f",
      titleEn: "The Golden Dunes of Taghit",
      titleAr: "الكثبان الذهبية في تاغيت",
      descEn:
        "Lose yourself in the endless amber dunes of the Sahara — where silence meets the stars.",
      descAr:
        "اكتشف الكثبان العنبرية اللانهائية للصحراء، حيث يلتقي الصمت بالنجوم.",
      video: "https://www.pexels.com/download/video/2055060/",
      poster: "https://images.pexels.com/videos/2055060/pictures/preview-0.jpg",
      category: "sahara",
      link: "/explore?category=guide&wilaya=Béchar",
      displayOrder: 1,
      clickCount: 0,
      isActive: true,
    },

    {
      _id: "6a23f22caec2971665f5b37e",
      titleEn: "Waterfalls of Kherrata",
      titleAr: "شلالات خراطة",
      descEn:
        "Step into a lush canyon where waterfalls cascade into emerald pools — one of Algeria's hidden natural wonders.",
      descAr:
        "ادخل وادياً مورقاً حيث تنهمر الشلالات في برك زمردية — إحدى عجائب الجزائر الطبيعية.",
      video: "https://www.pexels.com/download/video/6981411/",
      poster: "https://images.pexels.com/videos/6981411/pictures/preview-0.jpg",
      category: "nature",
      link: "/explore?category=guide&wilaya=Béjaïa",
      displayOrder: 6,
      clickCount: 0,
      isActive: true,
    },

    {
      _id: "6a23f22caec2971665f5b370",
      titleEn: "Endless Dunes of the Erg Occidental",
      titleAr: "كثبان العرق الغربي اللانهائية",
      descEn:
        "Drone over mesmerizing patterns of wind-sculpted gold across the Algerian Sahara.",
      descAr:
        "تحليق فوق أنماط رائعة من الذهب المنحوت بالرياح في الصحراء الجزائرية.",
      video: "https://www.pexels.com/download/video/3059046/",
      poster: "https://images.pexels.com/videos/3059046/pictures/preview-0.jpg",
      category: "sahara",
      link: "/explore?category=guide&wilaya=Adrar",
      displayOrder: 7,
      clickCount: 0,
      isActive: true,
    },

    {
      _id: "6a23f22caec2971665f5b372",
      titleEn: "Stargazing in the Sahara",
      titleAr: "مراقبة النجوم في الصحراء",
      descEn:
        "Far from city lights, the Algerian Sahara reveals the Milky Way in all its glory.",
      descAr:
        "بعيداً عن أضواء المدينة، تكشف الصحراء الجزائرية عن درب التبانة بكل روعتها.",
      video: "https://www.pexels.com/download/video/1877846/",
      poster: "https://images.pexels.com/videos/1877846/pictures/preview-0.jpg",
      category: "sahara",
      link: "/explore?category=guide&wilaya=Illizi",
      displayOrder: 9,
      clickCount: 0,
      isActive: true,
    },

    {
      _id: "6a23f22caec2971665f5b373",
      titleEn: "The Hidden Coves of Béjaïa",
      titleAr: "الخلجان المخفية في بجاية",
      descEn:
        "Emerald waters, dramatic limestone cliffs and secret grottos along Algeria's Mediterranean coast.",
      descAr:
        "مياه زمردية وجروف كلسية رائعة وكهوف سرية على ساحل البحر الأبيض المتوسط.",
      video: "https://www.pexels.com/download/video/5619876/",
      poster: "https://images.pexels.com/videos/5619876/pictures/preview-0.jpg",
      category: "beach",
      link: "/explore?category=resort&wilaya=Béjaïa",
      displayOrder: 10,
      clickCount: 0,
      isActive: true,
    },

    {
      _id: "6a23f22caec2971665f5b374",
      titleEn: "Wild Coast of Skikda",
      titleAr: "الساحل البري لسكيكدة",
      descEn:
        "Untamed waves, sculpted rocks and salty air — where mountains meet the sea.",
      descAr:
        "أمواج جامحة وصخور منحوتة وهواء بحري نقي حيث تلتقي الجبال بالبحر.",
      video: "https://www.pexels.com/download/video/4625195/",
      poster: "https://images.pexels.com/videos/4625195/pictures/preview-0.jpg",
      category: "beach",
      link: "/explore?category=resort&wilaya=Skikda",
      displayOrder: 11,
      clickCount: 0,
      isActive: true,
    },
  ]
   const categories = [
  {
    id: "6a0a01182950f01f8e422e19",
    slug: "cultural",
    labelEn: "Cultural Tourism",
    labelAr: "سياحة ثقافية",
    iconName: "Compass",
    count: "0+",
    bgClass: "bg-amber-50 text-amber-600",
    image:
      "https://res.cloudinary.com/dgncqrtc5/image/upload/v1779040534/pacta_tourism/cultural.jpg",
    order: 1,
    isActive: true,
  },

  {
    id: "6a0a03192950f01f8e422e1b",
    slug: "business",
    labelEn: "Business & Commercial",
    labelAr: "سياحة تجارية",
    iconName: "Briefcase",
    count: "0+",
    bgClass: "bg-amber-50 text-amber-600",
    image:
      "https://res.cloudinary.com/dgncqrtc5/image/upload/v1779041048/pacta_tourism/business.jpg",
    order: 2,
    isActive: true,
  },

  {
    id: "6a0a03d12950f01f8e422e1c",
    slug: "leisure",
    labelEn: "Leisure & Entertainment",
    labelAr: "سياحة ترفيهية",
    iconName: "Palmtree",
    count: "0+",
    bgClass: "bg-amber-50 text-amber-600",
    image:
      "https://res.cloudinary.com/dgncqrtc5/image/upload/v1779041232/pacta_tourism/leisure.jpg",
    order: 3,
    isActive: true,
  },

  {
    id: "6a0a02222950f01f8e422e1a",
    slug: "medical",
    labelEn: "Medical & Therapeutic",
    labelAr: "سياحة علاجية",
    iconName: "Activity",
    count: "0+",
    bgClass: "bg-amber-50 text-amber-600",
    image:
      "https://res.cloudinary.com/dgncqrtc5/image/upload/v1779040802/pacta_tourism/medical.jpg",
    order: 4,
    isActive: true,
  },

  {
    id: "6a23f47f29d66148c58ba094",
    slug: "religious",
    labelEn: "Religious Tourism",
    labelAr: "سياحة دينية",
    iconName: "Moon",
    count: "95+",
    bgClass: "bg-emerald-50 text-emerald-600",
    image:
      "https://images.pexels.com/photos/24964989/pexels-photo-24964989.jpeg",
    order: 5,
    isActive: true,
  },

  {
    id: "6a23f47f29d66148c58ba095",
    slug: "educational",
    labelEn: "Educational Tourism",
    labelAr: "سياحة تعليمية",
    iconName: "GraduationCap",
    count: "45+",
    bgClass: "bg-purple-50 text-purple-600",
    image:
      "https://images.pexels.com/photos/8199141/pexels-photo-8199141.jpeg",
    order: 6,
    isActive: true,
  },
];
  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "hotel":
        return <Bed size={18} />;
      case "resort":
        return <Palmtree size={18} />;
      case "guide":
        return <Map size={18} />;
      case "rental":
        return <HomeIcon size={18} />;
      default:
        return <Compass size={18} />;
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

  const testimonials = [
    {
      name: isRTL ? "أمين .ك" : "Amine K.",
      role: isRTL ? "مسافر موثق" : "Verified Traveler",
      text: isRTL
        ? "كان حجز مرشد محلي عبر باكتا لرحلتنا إلى الطاسيلي سهلاً للغاية. خدمة رائعة!"
        : "Booking a local guide through PACTA for our Tassili trip was seamless. Incredible service!",
    },
    {
      name: isRTL ? "سارة .ب" : "Sarah B.",
      role: isRTL ? "شريك فندقي" : "Hotel Partner",
      text: isRTL
        ? "بصفتي مديرة فندق في بجاية، ضاعفت هذه المنصة حجوزاتنا في غضون أشهر قليلة."
        : "As a property manager in Bejaia, this platform doubled our bookings within months.",
    },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {/* ─────────────────────────────────────────────
          HERO CAROUSEL  (single unified implementation)
      ───────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden bg-pacta-navy">
        {ads.map((ad, idx) => (
          <div
            key={ad._id}
            className={`absolute inset-0 transition-all duration-1000 ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Replace the old <img> block with this */}
            {ad.video ? (
              <video
                key={ad.video} // Use the video URL as the key to force a re-load
                src={ad.video}
                poster={ad.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata" // Change from "auto" to "metadata" to load faster
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : ad?.poster ? (
              <img
                src={ad?.poster}
                alt={isRTL ? ad.titleAr : ad.titleEn}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}

            {/* Gradient — stronger on the text side */}
            {isRTL ? (
              /* Arabic: text on the RIGHT → heavy gradient on the right */
              <div className="absolute inset-0 bg-gradient-to-l from-pacta-navy/90 via-pacta-navy/55 to-pacta-navy/20" />
            ) : (
              /* LTR: text on the LEFT → heavy gradient on the left */
              <div className="absolute inset-0 bg-gradient-to-r from-pacta-navy/90 via-pacta-navy/55 to-pacta-navy/20" />
            )}
            {/* Bottom vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-pacta-navy/50 via-transparent to-transparent" />

            {/* Content — aligned to the correct side */}
            <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center">
              <div
                className={`max-w-xl text-white ${
                  isRTL ? "text-right mr-auto" : "text-left ml-0"
                }`}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pacta-gold/20 backdrop-blur-sm border border-pacta-gold/30 rounded-full text-xs font-bold uppercase tracking-widest mb-5 text-pacta-gold">
                  <Sparkles size={12} />
                  {ad?.category}
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5 text-white drop-shadow-sm">
                  {isRTL ? ad.titleAr : ad.titleEn}
                </h1>
                {/* Inside the content block, above the title */}

                <p className="text-white/75 text-base sm:text-lg font-medium mb-10 leading-relaxed max-w-lg">
                  {isRTL ? ad.descAr : ad.descEn}
                </p>

                <button
                  onClick={() => navigate(ad.link || "/explore")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pacta-gold to-pacta-gold-light text-pacta-navy-dark font-bold rounded-2xl hover:shadow-xl hover:shadow-pacta-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  {t("hero.exploreNow")}
                  {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Prev / Next buttons */}
        {ads.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentSlide((p) => (p - 1 + ads.length) % ads.length)
              }
              className={`absolute top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-2xl border border-white/10 text-white shadow-lg hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center ${
                isRTL ? "right-6" : "left-6"
              }`}
            >
              {isRTL ? <ChevronRight size={26} /> : <ChevronLeft size={26} />}
            </button>

            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % ads.length)}
              className={`absolute top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-2xl border border-white/10 text-white shadow-lg hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center ${
                isRTL ? "left-6" : "right-6"
              }`}
            >
              {isRTL ? <ChevronLeft size={26} /> : <ChevronRight size={26} />}
            </button>

            {/* Dot pagination */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-xl border border-white/10">
              {ads.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`transition-all duration-500 rounded-full ${
                    i === currentSlide
                      ? "w-8 h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"
                      : "w-2 h-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ─────────────────────────────────────────────
          CATEGORIES SECTION  (beautiful cards with
          description + CTA button)
      ───────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 lg:py-28">
        <div className="mb-14">
          <span className="text-xs font-bold text-pacta-gold uppercase tracking-[0.2em] mb-3 block">
            {isRTL ? "استكشف حسب" : "Browse By"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-pacta-navy">
            {t("hero.browseByType")}
          </h2>
          <p className="text-gray-400 font-medium text-sm mt-2 max-w-lg">
            {isRTL
              ? "اختر نوع مغامرتك القادمة في الجزائر"
              : "Choose your next Algerian adventure type"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative bg-white rounded-3xl border border-pacta-sand/80 overflow-hidden hover:shadow-2xl hover:shadow-pacta-navy/10 hover:border-pacta-gold/30 transition-all duration-500 flex flex-col"
            >
              {/* Image block */}
              <div className="relative h-56 overflow-hidden bg-pacta-sand flex-shrink-0">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={isRTL ? cat.labelAr : cat.labelEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pacta-navy/5 to-pacta-teal/10 flex items-center justify-center text-pacta-navy/20">
                    <Compass size={48} />
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-pacta-navy/70 via-pacta-navy/20 to-transparent" />

                {/* Category badge (top) */}
                <div
                  className={`absolute top-4 ${isRTL ? "right-4" : "left-4"}`}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pacta-gold/90 rounded-xl text-[10px] font-bold uppercase tracking-wider text-pacta-navy-dark shadow-lg">
                    <Compass size={11} />
                    {isRTL ? cat.labelAr : cat.labelEn}
                  </span>
                </div>

                {/* Title over image bottom */}
                <div
                  className={`absolute bottom-4 px-5 w-full ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <h3 className="font-bold text-white text-xl leading-tight drop-shadow">
                    {isRTL ? cat.labelAr : cat.labelEn}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div
                className={`p-6 flex flex-col flex-1 gap-4 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                  {isRTL ? cat.descAr : cat.descEn}
                </p>

                <button
                  onClick={() => navigate(`/explore?category=${cat.slug}`)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white text-sm font-bold rounded-2xl hover:shadow-lg hover:shadow-pacta-navy/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-auto"
                >
                  {isRTL ? "استكشف الآن" : "Explore Now"}
                  {isRTL ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          VERIFIED PROVIDERS SECTION  (beautiful cards)
      ───────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28 relative overflow-hidden">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230C2D4D' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">
          <div className="mb-14">
            <span className="text-xs font-bold text-pacta-gold uppercase tracking-[0.2em] mb-3 block">
              {isRTL ? "الأفضل مبيعاً" : "Top Rated"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-pacta-navy">
              {t("hero.verifiedProviders")}
            </h2>
            <p className="text-gray-400 font-medium text-sm mt-2 max-w-lg">
              {isRTL
                ? "أفضل الخدمات المتاحة مباشرة بدون وسطاء"
                : "Top premium partners connected directly to you"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.slice(0, 8).map((item) => {
              const title = isRTL
                ? item.titleAr || item.nameAr
                : item.titleEn || item.nameEn;
              const price =
                item.pricePerNight || item.pricePerDay || item.price || 0;
              const unit = item.pricePerDay
                ? t("listing.priceDay")
                : t("listing.priceNight");
              const rating = item.rating?.toFixed(1) || "5.0";

              return (
                <div
                  key={item._id}
                  className="group flex flex-col bg-white rounded-3xl border border-pacta-sand/80 overflow-hidden hover:shadow-2xl hover:shadow-pacta-navy/10 hover:border-pacta-gold/25 transition-all duration-500"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-pacta-sand overflow-hidden flex-shrink-0">
                    {item.images?.[0] || item.image ? (
                      <img
                        src={item.images?.[0] || item.image!}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pacta-navy/5 to-pacta-teal/10 flex items-center justify-center text-pacta-navy/20">
                        {getTypeIcon(item.listingType)}
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-pacta-navy/50 via-transparent to-transparent" />

                    {/* Type badge */}
                    <span
                      className={`absolute top-3 ${
                        isRTL ? "right-3" : "left-3"
                      } px-3 py-1.5 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-pacta-navy rounded-xl shadow-sm`}
                    >
                      {getTypeLabel(item.listingType)}
                    </span>

                    {/* Rating badge */}
                    <span
                      className={`absolute top-3 ${
                        isRTL ? "left-3" : "right-3"
                      } flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur text-[10px] font-bold text-amber-600 rounded-xl shadow-sm`}
                    >
                      <Star
                        size={10}
                        className="fill-amber-500 text-amber-500"
                      />
                      {rating}
                    </span>

                    {/* Price overlay at image bottom */}
                    <div
                      className={`absolute bottom-3 ${
                        isRTL ? "left-3" : "right-3"
                      }`}
                    >
                      <span className="px-3 py-1.5 bg-pacta-navy/80 backdrop-blur rounded-xl text-white text-xs font-bold">
                        {price.toLocaleString()} DA
                        <span className="text-white/60 font-medium ml-0.5">
                          /{unit}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div
                    className={`p-5 flex flex-col gap-3 flex-1 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-pacta-navy text-sm mb-1.5 line-clamp-1 leading-snug">
                        {title}
                      </h3>
                      <div
                        className={`flex items-center gap-1.5 text-xs text-gray-400 ${
                          isRTL ? "flex-row-reverse justify-end" : ""
                        }`}
                      >
                        <MapPin
                          size={12}
                          className="text-pacta-gold flex-shrink-0"
                        />
                        <span className="line-clamp-1">{item.wilaya}</span>
                      </div>
                    </div>

                    {/* Stars row */}
                    <div
                      className={`flex gap-0.5 ${
                        isRTL ? "justify-end" : "justify-start"
                      }`}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={11}
                          className={
                            s <= Math.round(Number(rating))
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200"
                          }
                        />
                      ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col gap-2 mt-auto pt-1">
                      <button
                        onClick={() =>
                          navigate(`/book/${item._id}?type=${item.listingType}`)
                        }
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white text-[11px] font-bold rounded-xl hover:shadow-lg hover:shadow-pacta-navy/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                      >
                        <CalendarCheck size={12} />
                        {t("providers.bookDirect")}
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/listing/${item._id}?type=${item.listingType}`,
                          )
                        }
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-pacta-cream border border-pacta-sand text-gray-500 text-[11px] font-bold rounded-xl hover:border-pacta-gold/50 hover:text-pacta-navy hover:bg-white transition-all duration-300"
                      >
                        <ExternalLink size={11} />
                        {t("providers.viewDetails")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          TESTIMONIALS
      ───────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 lg:py-28">
        <div className="relative bg-gradient-to-br from-pacta-navy via-pacta-navy to-pacta-teal/80 rounded-[2rem] p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-pacta-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-pacta-teal/20 rounded-full blur-3xl" />

          <div className="grid lg:grid-cols-3 gap-10 items-center relative z-10">
            <div className={isRTL ? "text-right" : "text-left"}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pacta-gold/20 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-pacta-gold mb-5">
                <Sparkles size={12} />
                {t("hero.communityFeedback")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
                {t("hero.testimonials")}
              </h2>
              <p className="text-white/50 text-sm font-medium leading-relaxed max-w-sm">
                {isRTL
                  ? "نحن نضمن جودة التعامل والاتصال المباشر بين جميع الأطراف"
                  : "We ensure quality direct connections between all parties"}
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
              {testimonials.map((tstm, i) => (
                <div
                  key={i}
                  className={`bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all duration-500 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`flex gap-1 mb-4 ${
                      isRTL ? "justify-end" : "justify-start"
                    }`}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className="fill-pacta-gold text-pacta-gold"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 font-medium leading-relaxed mb-5 italic">
                    &ldquo;{tstm.text}&rdquo;
                  </p>
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pacta-gold to-pacta-gold-light flex items-center justify-center text-pacta-navy-dark font-bold text-sm flex-shrink-0">
                      {tstm.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {tstm.name}
                      </p>
                      <p className="text-[11px] text-pacta-gold font-medium">
                        {tstm.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mini Assistant */}
      <MiniAssistant />
    </div>
  );
}
