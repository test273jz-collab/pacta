import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

export default function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-pacta-navy text-white/80 relative overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pacta-navy via-pacta-navy to-pacta-teal/30 pointer-events-none" />

      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-pacta-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-pacta-teal/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-32  h-10 relative">
                <img
                  src="/logo.png"
                  alt="PACTA"
                  className="w-full h-full object-contain object-left brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-sm font-medium text-white/50 leading-relaxed">
              {isRTL
                ? "منصتك المتكاملة لاستكشاف روعة السياحة الجزائرية بكل ثقة وأمان"
                : "Your comprehensive platform to explore Algerian tourism with confidence and security"}
            </p>
            <div className="flex items-center gap-2 text-xs text-pacta-gold/70">
              <Heart size={12} className="fill-pacta-gold text-pacta-gold" />
              <span>
                {isRTL ? "صنع بحب في الجزائر" : "Made with love in Algeria"}
              </span>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-xs font-bold text-pacta-gold uppercase tracking-[0.2em] mb-5">
              {t("footer.destinations")}
            </h4>
            <ul className="space-y-3">
              {["cultural", "medical", "leisure"].map((type) => (
                <li key={type}>
                  <Link
                    to={`/explore?category=${type}`}
                    className="text-sm font-medium text-white/50 hover:text-pacta-gold transition-colors duration-300"
                  >
                    {type === "cultural"
                      ? isRTL
                        ? "السياحة الثقافية"
                        : "Cultural Tours"
                      : type === "medical"
                        ? isRTL
                          ? "السياحة العلاجية"
                          : "Medical Stay"
                        : isRTL
                          ? "الترفيه والمرح"
                          : "Leisure & Fun"}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-bold text-pacta-gold uppercase tracking-[0.2em] mb-5">
              {t("footer.services")}
            </h4>
            <ul className="space-y-3">
              {[
                {
                  path: "/providers/hotel",
                  label: isRTL ? "الفنادق المعتمدة" : "Verified Hotels",
                },
                {
                  path: "/providers/guide",
                  label: isRTL ? "المرشدين المحليين" : "Certified Guides",
                },
                {
                  path: "/providers/resort",
                  label: isRTL ? "المنتجعات الفاخرة" : "Premium Resorts",
                },
                {
                  path: "/providers/rental",
                  label: isRTL ? "عقارات للإيجار" : "Home Rentals",
                },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm font-medium text-white/50 hover:text-pacta-gold transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-pacta-gold uppercase tracking-[0.2em] mb-5">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-medium text-white/50">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Mail size={14} className="text-pacta-gold" />
                </div>
                <span className="break-all">support@pactatourism.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-white/50">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Phone size={14} className="text-pacta-gold" />
                </div>
                <span dir="ltr">+213 (06) 61 81 75 19</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-white/50">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Phone size={14} className="text-pacta-gold" />
                </div>
                <span dir="ltr">+213 (07) 99 70 22 76</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-white/50">
                <div className="p-2 bg-white/5 rounded-lg">
                  <MapPin size={14} className="text-pacta-gold" />
                </div>
                <span>Algiers, Algeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs font-medium text-white/30">
            &copy; {new Date().getFullYear()} PACTA. {t("footer.rights")}
          </span>
          <div className="flex gap-6">
            <Link
              to="#"
              className="text-xs font-medium text-white/30 hover:text-pacta-gold transition-colors duration-300"
            >
              {t("footer.terms")}
            </Link>
            <Link
              to="#"
              className="text-xs font-medium text-white/30 hover:text-pacta-gold transition-colors duration-300"
            >
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
