import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSelector() {
  const { lang } = useLanguage();

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.body.className = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return null;
}
