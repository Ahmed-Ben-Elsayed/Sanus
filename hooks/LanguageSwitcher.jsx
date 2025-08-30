import React, { useEffect } from "react";
import { FaEarthAfrica } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  useEffect(() => {
    const currentLang = localStorage.getItem("language") || "en";
    i18n.changeLanguage(currentLang);
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  }, [i18n]);

  return (
    <FaEarthAfrica
      className="text-2xl cursor-pointer hover:text-gray-400 transition-colors duration-200"
      onClick={toggleLanguage}
      title="Switch Language"
    />
  );
};

export default LanguageSwitcher;
