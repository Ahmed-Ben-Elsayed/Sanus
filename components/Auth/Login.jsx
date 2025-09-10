import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loaderstart from "../../ui/loading/Loaderstart";

const Login = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/Admin/On_Boarding");
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { t, i18n } = useTranslation();
  const [loading, setloading] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setloading(true);
      const res = await axios.post(`${BASE_URL}/auth/login`, formData);
      toast.success("Login successful");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      navigate("/Admin/On_Boarding");
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      setloading(false);
    }
  };

  if (checkingAuth) return <Loaderstart />;

  return (
    <div className="bg-[#E9E2DC] min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-6xl flex flex-col-reverse lg:flex-row items-center justify-between gap-8 py-8">
        {/* Form Section */}
        <div className="bg-[#0F212D] shadow-lg text-white p-6 md:p-8 rounded-md w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#ddd6d2]">
              {t("welcome")}
            </h2>
          </div>
          <p className="text-sm text-[#ddd6d2] mb-6">{t("description")}</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-semibold text-[#ddd6d2]">
                {t("email")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-9 py-3 rounded-md bg-[#192A34] text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-1 text-sm font-semibold text-[#ddd6d2]">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-9 py-3 rounded-md bg-[#192A34] text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <div
                  onClick={togglePassword}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <hr className="my-6 border-slate-400" />

            <button
              type="submit"
              className="w-full cursor-pointer bg-gradient-to-r to-[#496576] from-[#2A414F] hover:opacity-90 py-3 rounded-md font-semibold text-[#ddd6d2]"
            >
              {loading ? <Loaderstart /> : t("signin")}
            </button>
          </form>
        </div>

        {/* Image Section */}
        <img
          className="w-40 sm:w-52 md:w-64 lg:w-72 object-contain"
          alt="sanus logo"
          src="/logo.png"
        />
      </div>
    </div>
  );
};

export default Login;
