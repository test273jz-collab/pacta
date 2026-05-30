import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, X, Send, Bot, Sparkles, Hotel, Map, Home, Palmtree,
  Calendar, Star, HelpCircle, Loader2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

// ─── Knowledge base ────────────────────────────────────────────────
const knowledge = [
  {
    keywords: ["book", "booking", "reserve", "حجز", "احجز"],
    replyEn: "To book, find a listing on Explore, open the detail page, and click **Book Direct**. Choose your dates and confirm — it's that simple!",
    replyAr: "للحجز، ابحث عن خدمة في صفحة استكشف، افتح التفاصيل، ثم اضغط **احجز مباشرة**. اختر التواريخ وأكد — الأمر بهذه البساطة!",
    action: { label: "Explore listings", labelAr: "استكشف الخدمات", path: "/explore" },
  },
  {
    keywords: ["hotel", "فندق", "فنادق"],
    replyEn: "We have a wide selection of hotels across Algeria — from budget stays to luxury resorts. Filter by location and amenities on the Explore page.",
    replyAr: "لدينا تشكيلة واسعة من الفنادق في الجزائر — من الاقتصادية إلى الفاخرة. صفّ حسب الموقع والمرافق في صفحة استكشف.",
    action: { label: "Browse hotels", labelAr: "تصفح الفنادق", path: "/explore?category=hotel" },
  },
  {
    keywords: ["resort", "منتجع", "منتجعات"],
    replyEn: "Our partner resorts offer world-class amenities — pools, spas, restaurants and more. Perfect for a full vacation experience.",
    replyAr: "منتجعاتنا توفر مرافق عالمية — مسابح، سبا، مطاعم والمزيد. مثالية لتجربة عطلة كاملة.",
    action: { label: "Browse resorts", labelAr: "تصفح المنتجعات", path: "/explore?category=resort" },
  },
  {
    keywords: ["guide", "tour", "مرشد", "جولة"],
    replyEn: "Our certified local guides offer immersive tours across Algeria — from Sahara expeditions to coastal adventures and historical sites.",
    replyAr: "مرشدونا المحليون المعتمدون يقدمون جولات مميزة — من رحلات الصحراء إلى المغامرات الساحلية والمواقع التاريخية.",
    action: { label: "Find guides", labelAr: "ابحث عن مرشد", path: "/explore?category=guide" },
  },
  {
    keywords: ["rental", "house", "villa", "عقار", "إيجار", "فيلا"],
    replyEn: "Looking for a vacation rental? Browse villas, chalets, and apartments with full amenities for a home-away-from-home experience.",
    replyAr: "تبحث عن عقار للإيجار؟ تصفح الفيلات والشاليهات والشقق للحصول على تجربة البيت بعيد عن البيت.",
    action: { label: "Browse rentals", labelAr: "تصفح العقارات", path: "/explore?category=rental" },
  },
  {
    keywords: ["sahara", "desert", "صحراء", "طاسيلي", "tassili"],
    replyEn: "The Algerian Sahara is breathtaking! We offer guided Sahara tours, including Tassili n'Ajjer — a UNESCO World Heritage Site. Book a certified guide for the best experience.",
    replyAr: "الصحراء الجزائرية خلابة! نقدم جولات موجهة تشمل الطاسيلي ن'أجر — موقع تراث عالمي لليونسكو. احجز مرشدًا معتمدًا لأفضل تجربة.",
    action: { label: "Sahara tours", labelAr: "جولات الصحراء", path: "/explore?category=guide" },
  },
  {
    keywords: ["price", "cost", "fee", "سعر", "تكلفة", "كم"],
    replyEn: "Prices vary by listing type and season. All prices are shown in Algerian Dinar (DA) on each listing. Payment is made directly upon arrival — no online payment required.",
    replyAr: "الأسعار تتفاوت حسب نوع الخدمة والموسم. جميع الأسعار معروضة بالدينار الجزائري. الدفع يتم مباشرة عند الوصول — لا حاجة لدفع إلكتروني.",
  },
  {
    keywords: ["cancel", "cancellation", "إلغاء"],
    replyEn: "Cancellation policies vary by provider. You can view the policy on the listing detail page before booking. Contact your provider directly for changes.",
    replyAr: "سياسات الإلغاء تختلف حسب المزود. يمكنك الاطلاع على السياسة في صفحة التفاصيل قبل الحجز. تواصل مع مزودك مباشرة لأي تغييرات.",
  },
  {
    keywords: ["contact", "help", "support", "تواصل", "مساعدة", "دعم"],
    replyEn: "Need help? Visit our Contact page to send a message. Our team responds within 24 hours.",
    replyAr: "تحتاج مساعدة؟ زر صفحة التواصل لإرسال رسالة. فريقنا يرد خلال 24 ساعة.",
    action: { label: "Contact us", labelAr: "تواصل معنا", path: "/contact" },
  },
  {
    keywords: ["wishlist", "favorite", "save", "مفضلة", "احفظ"],
    replyEn: "You can save your favorite listings to your Wishlist by clicking the heart icon on any listing. Access it anytime from your profile.",
    replyAr: "يمكنك حفظ الخدمات المفضلة في قائمة الأمنيات بالضغط على أيقونة القلب. الوصول إليها في أي وقت من ملفك الشخصي.",
    action: { label: "My Wishlist", labelAr: "قائمة أمنياتي", path: "/wishlist" },
  },
];

const quickReplies = [
  { textEn: "How do I book?", textAr: "كيف أحجز؟", icon: Calendar },
  { textEn: "Find a guide", textAr: "أريد مرشد", icon: Map },
  { textEn: "Best resorts?", textAr: "أفضل منتجع؟", icon: Palmtree },
  { textEn: "Rental options", textAr: "خيارات الإيجار", icon: Home },
  { textEn: "Sahara tours", textAr: "جولات صحراوية", icon: Star },
  { textEn: "Get support", textAr: "الدعم الفني", icon: HelpCircle },
];

type Msg = {
  from: "bot" | "user";
  text: string;
  action?: { label: string; labelAr: string; path: string };
  isTyping?: boolean;
};

// ─── Main Component ────────────────────────────────────────────────
export default function MiniAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Greeting on first open
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      const greeting: Msg = {
        from: "bot",
        text: isRTL
          ? "مرحبًا! أنا مساعد باكتا الذكي 🌍\nيمكنني مساعدتك في البحث عن فنادق، منتجعات، مرشدين سياحيين وعقارات للإيجار في الجزائر. بماذا يمكنني مساعدتك؟"
          : "Hello! I'm the PACTA AI Assistant 🌍\nI can help you find hotels, resorts, local guides, and rentals across Algeria. What can I help you with today?",
      };
      setTimeout(() => setMessages([greeting]), 400);
    }
  }, [open, hasOpened, isRTL]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const getReply = (text: string): Omit<Msg, "from"> => {
    const lower = text.toLowerCase();
    const match = knowledge.find((k) => k.keywords.some((kw) => lower.includes(kw)));

    if (match) {
      return {
        text: isRTL ? match.replyAr : match.replyEn,
        action: match.action,
      };
    }

    return {
      text: isRTL
        ? "شكرًا على سؤالك! يمكنني مساعدتك في الحجوزات، الفنادق، المنتجعات، المرشدين والعقارات. جرّب أحد الأزرار السريعة أدناه 👇"
        : "Thanks for asking! I can help with bookings, hotels, resorts, guides, and rentals in Algeria. Try one of the quick options below 👇",
    };
  };

  const handleSend = (text?: string) => {
    const value = (text || input).trim();
    if (!value || isTyping) return;

    setMessages((prev) => [...prev, { from: "user", text: value }]);
    setInput("");
    setIsTyping(true);

    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const reply = getReply(value);
      setMessages((prev) => [...prev, { from: "bot", ...reply }]);
      setIsTyping(false);
    }, delay);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-50 w-14 h-14 rounded-full bg-gradient-to-br from-pacta-navy via-pacta-teal to-pacta-navy text-white shadow-2xl shadow-pacta-navy/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300`}
        aria-label="Open assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
        {!open && !hasOpened && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-pacta-gold rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className={`fixed bottom-24 ${isRTL ? "left-6" : "right-6"} z-50 w-[370px] max-h-[560px] flex flex-col bg-white rounded-3xl shadow-2xl shadow-pacta-navy/20 border border-pacta-sand/60 overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pacta-navy to-pacta-teal px-5 py-4 text-white flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Bot size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm leading-tight">
                {isRTL ? "مساعد باكتا" : "PACTA Assistant"}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-white/70">
                  {isRTL ? "متاح الآن" : "Online now"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-pacta-gold/20 rounded-full">
              <Sparkles size={10} className="text-pacta-gold" />
              <span className="text-[10px] font-bold text-pacta-gold">AI</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto min-h-0">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                {msg.from === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pacta-navy to-pacta-teal text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={13} />
                  </div>
                )}
                <div className={`max-w-[78%] flex flex-col gap-2 ${msg.from === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                      msg.from === "user"
                        ? "bg-gradient-to-r from-pacta-navy to-pacta-teal text-white rounded-br-sm"
                        : "bg-pacta-cream text-gray-700 rounded-bl-sm border border-pacta-sand/60"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.action && (
                    <button
                      onClick={() => { navigate(msg.action!.path); setOpen(false); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pacta-navy text-white text-xs font-bold rounded-xl hover:bg-pacta-teal transition-colors"
                    >
                      <Hotel size={11} />
                      {isRTL ? msg.action.labelAr : msg.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pacta-navy to-pacta-teal text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={13} />
                </div>
                <div className="px-4 py-3 bg-pacta-cream border border-pacta-sand/60 rounded-2xl rounded-bl-sm flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-pacta-navy/40 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 border-t border-pacta-sand/40 flex-shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {isRTL ? "أسئلة سريعة" : "Quick questions"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(isRTL ? q.textAr : q.textEn)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-pacta-cream hover:bg-pacta-sand border border-pacta-sand text-[10px] font-semibold text-gray-600 rounded-xl transition-colors"
                >
                  <q.icon size={10} className="text-pacta-navy/60" />
                  {isRTL ? q.textAr : q.textEn}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-pacta-sand/40 flex gap-2 bg-white flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRTL ? "اكتب سؤالك..." : "Type a message..."}
              className="flex-1 px-3 py-2 rounded-xl border border-pacta-sand bg-pacta-cream text-sm outline-none focus:border-pacta-navy/30 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-pacta-navy to-pacta-teal text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
            >
              {isTyping ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
