import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGlobalData } from "@/contexts/DataContext";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Globe,
  LayoutDashboard,
  User,
  LogOut,
  Heart,
  Bell,
  Building2,
  Palmtree,
  Compass,
  Home,
  MapPin,
} from "lucide-react";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { lang, setLang, t, isRTL } = useLanguage();
  const { categories } = useGlobalData();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [netOpen, setNetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setLangOpen(false);
    setCatOpen(false);
    setNetOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setLangOpen(false);
        setCatOpen(false);
        setNetOpen(false);
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.explore"), path: "/explore" },
  ];

  const networkItems = [
    { label: t("providers.hotels"), path: "/providers/hotel", icon: Building2 },
    {
      label: t("providers.resorts"),
      path: "/providers/resort",
      icon: Palmtree,
    },
    { label: t("providers.guides"), path: "/providers/guide", icon: Compass },
    { label: t("providers.rentals"), path: "/providers/rental", icon: Home },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      ref={headerRef}
      dir={isRTL ? "rtl" : "ltr"}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-pacta-navy/5 border-b border-pacta-sand"
          : "bg-white/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-36 h-10 relative overflow-hidden">
              <img
                src="/logo.png"
                alt="PACTA"
                className="w-full h-full object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-pacta-navy/5 text-pacta-navy"
                    : "text-gray-500 hover:text-pacta-navy hover:bg-pacta-sand/50"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setCatOpen(!catOpen);
                  setNetOpen(false);
                }}
                className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  catOpen
                    ? "bg-pacta-navy/5 text-pacta-navy"
                    : "text-gray-500 hover:text-pacta-navy hover:bg-pacta-sand/50"
                }`}
              >
                {t("nav.categories")}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${catOpen ? "rotate-180" : ""}`}
                />
              </button>
              {catOpen && (
                <div
                  className={`absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-pacta-navy/10 border border-pacta-sand p-2 z-50 ${isRTL ? "right-0" : "left-0"} animate-in fade-in slide-in-from-top-2 duration-200`}
                >
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => navigate(`/explore?category=${cat.slug}`)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-pacta-gold/10 hover:text-pacta-navy rounded-xl transition-all duration-200 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                    >
                      <span>{isRTL ? cat.labelAr : cat.labelEn}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Network Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNetOpen(!netOpen);
                  setCatOpen(false);
                }}
                className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  netOpen
                    ? "bg-pacta-navy/5 text-pacta-navy"
                    : "text-gray-500 hover:text-pacta-navy hover:bg-pacta-sand/50"
                }`}
              >
                {t("nav.network")}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${netOpen ? "rotate-180" : ""}`}
                />
              </button>
              {netOpen && (
                <div
                  className={`absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-pacta-navy/10 border border-pacta-sand p-2 z-50 ${isRTL ? "right-0" : "left-0"} animate-in fade-in slide-in-from-top-2 duration-200`}
                >
                  {networkItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-pacta-gold/10 hover:text-pacta-navy rounded-xl transition-all duration-200 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                    >
                      <item.icon size={16} className="text-pacta-gold" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive("/contact")
                  ? "bg-pacta-navy/5 text-pacta-navy"
                  : "text-gray-500 hover:text-pacta-navy hover:bg-pacta-sand/50"
              }`}
            >
              {t("nav.contact")}
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Search */}
            <div className="hidden lg:block relative">
              {showSearch ? (
                <form
                  onSubmit={handleSearch}
                  className="flex items-center animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("dashboard.searchPlaceholder")}
                    className="w-56 px-4 py-2 bg-pacta-sand/50 border border-pacta-sand rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pacta-gold/50 text-pacta-navy placeholder:text-gray-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="ml-2 p-2 text-gray-400 hover:text-pacta-navy transition-colors"
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2.5 text-gray-400 hover:text-pacta-navy hover:bg-pacta-sand/50 rounded-xl transition-all duration-300"
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="p-2.5 text-gray-400 hover:text-pacta-navy hover:bg-pacta-sand/50 rounded-xl transition-all duration-300"
              >
                <Globe size={20} />
              </button>
              {langOpen && (
                <div
                  className={`absolute top-full mt-2 w-40 bg-white rounded-2xl shadow-xl shadow-pacta-navy/10 border border-pacta-sand p-1.5 z-50 ${isRTL ? "left-0" : "right-0"} animate-in fade-in slide-in-from-top-2 duration-200`}
                >
                  <button
                    onClick={() => {
                      setLang("en");
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${lang === "en" ? "bg-pacta-navy/5 text-pacta-navy" : "text-gray-600 hover:bg-pacta-sand/50"}`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => {
                      setLang("ar");
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${lang === "ar" ? "bg-pacta-navy/5 text-pacta-navy" : "text-gray-600 hover:bg-pacta-sand/50"}`}
                  >
                    🇩🇿 العربية
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/wishlist")}
                className="hidden sm:flex p-2.5 text-gray-400 hover:text-pacta-gold hover:bg-pacta-gold/10 rounded-xl transition-all duration-300 relative"
              >
                <Heart size={20} />
              </button>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/notifications")}
                className="hidden sm:flex p-2.5 text-gray-400 hover:text-pacta-navy hover:bg-pacta-navy/5 rounded-xl transition-all duration-300 relative"
              >
                <Bell size={20} />
              </button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-pacta-sand/50 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pacta-navy to-pacta-teal text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 hidden sm:block transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {profileOpen && (
                  <div
                    className={`absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-pacta-navy/10 border border-pacta-sand p-2 z-50 ${isRTL ? "left-0" : "right-0"} animate-in fade-in slide-in-from-top-2 duration-200`}
                  >
                    <div className="px-3 py-2 border-b border-pacta-sand mb-1">
                      <p className="font-bold text-pacta-navy text-sm truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-pacta-gold/10 hover:text-pacta-navy rounded-xl transition-all duration-200"
                    >
                      <LayoutDashboard size={16} className="text-pacta-gold" />{" "}
                      {t("nav.dashboard")}
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-pacta-gold/10 hover:text-pacta-navy rounded-xl transition-all duration-200"
                    >
                      <User size={16} className="text-pacta-gold" />{" "}
                      {t("nav.profile")}
                    </Link>
                    <Link
                      to="/reservations"
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-pacta-gold/10 hover:text-pacta-navy rounded-xl transition-all duration-200"
                    >
                      <MapPin size={16} className="text-pacta-gold" />{" "}
                      {t("nav.reservations")}
                    </Link>
                    {[
                      "hotel_owner",
                      "resort_owner",
                      "rental_owner",
                      "guide",
                    ].includes(user?.role || "") && (
                      <Link
                        to="/provider/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-pacta-gold/10 hover:text-pacta-navy rounded-xl transition-all duration-200"
                      >
                        <Building2 size={16} className="text-pacta-teal" />{" "}
                        {isRTL ? "لوحة المزود" : "Provider Panel"}
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        to="/admin/analytics"
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-pacta-gold/10 hover:text-pacta-navy rounded-xl transition-all duration-200"
                      >
                        <LayoutDashboard
                          size={16}
                          className="text-violet-500"
                        />{" "}
                        {isRTL ? "لوحة الإدارة" : "Admin Panel"}
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                      <LogOut size={16} /> {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-pacta-navy transition-all duration-300"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-pacta-navy/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 text-gray-500 hover:text-pacta-navy hover:bg-pacta-sand/50 rounded-xl transition-all duration-300"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-pacta-sand bg-white/95 backdrop-blur-xl max-h-[calc(100vh-5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-300">
          <div className="px-4 py-4 space-y-1">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 mb-4"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("dashboard.searchPlaceholder")}
                className="flex-1 px-4 py-3 bg-pacta-sand/50 border border-pacta-sand rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pacta-gold/50"
              />
              <button
                type="submit"
                className="p-3 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white rounded-xl shadow-md"
              >
                <Search size={18} />
              </button>
            </form>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.path)
                    ? "bg-pacta-navy/5 text-pacta-navy"
                    : "text-gray-600 hover:bg-pacta-sand/50"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-pacta-sand mt-2">
              <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t("nav.categories")}
              </p>
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => navigate(`/explore?type=${cat.slug}`)}
                  className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-pacta-gold/10 hover:text-pacta-navy rounded-xl transition-all"
                >
                  {isRTL ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-pacta-sand mt-2">
              <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t("nav.network")}
              </p>
              {networkItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-pacta-gold/10 hover:text-pacta-navy rounded-xl transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="pt-4 border-t border-pacta-sand mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="block text-center px-4 py-3 border-2 border-pacta-sand text-pacta-navy font-bold text-sm rounded-xl hover:bg-pacta-sand/50 transition-all"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="block text-center px-4 py-3 bg-gradient-to-r from-pacta-navy to-pacta-teal text-white font-bold text-sm rounded-xl shadow-md"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
