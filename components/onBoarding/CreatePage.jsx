import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoIosArrowBack } from "react-icons/io";
import Loaderstart from "../../ui/loading/Loaderstart";
import NewButton from "../../ui/NewButton";

const CreatePage = () => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    pageTitle: "",
    pageTitleAr: "صفحة",
    stepNumber: "",
    title: "",
    titleAr: "",
    sentence: "",
    sentenceAr: "",
    stepImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.[0]) {
      setFormData((prev) => ({ ...prev, stepImage: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (
      !formData.pageTitle.trim() ||
      !formData.pageTitleAr.trim() ||
      !formData.stepNumber.toString().trim() ||
      !formData.title.trim() ||
      !formData.titleAr.trim() ||
      !formData.sentence.trim() ||
      !formData.sentenceAr.trim() ||
      !formData.stepImage
    ) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return toast.error("Please fill all fields (EN & AR) and upload an image.");
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("pageTitle", formData.pageTitle);
      body.append("pageTitleAr", formData.pageTitleAr);
      body.append("stepNumber", formData.stepNumber);
      body.append("title", formData.title);
      body.append("titleAr", formData.titleAr);
      body.append("sentence", formData.sentence);
      body.append("sentenceAr", formData.sentenceAr);
      body.append("stepImage", formData.stepImage);

      await axios.post(`${BASE_URL}/onboarding`, body, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Page created successfully");
      navigate("/Admin/On_Boarding", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const n = parseInt(localStorage.getItem("numberOfPages") || "0", 10);
    if (n >= 3) {
      navigate("/Admin/On_Boarding", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="w-full min-h-[100%] mx-auto p-6 bg-white rounded-lg shadow">
      {loading ? (
        <Loaderstart />
      ) : (
        <>
          <h2 className="text-lg md:text-xl mb-4 font-semibold flex items-center gap-1 text-[#7A83A3]">
            <IoIosArrowBack
              className="cursor-pointer"
              onClick={() => navigate("/Admin/On_Boarding")}
            />
            Create Page
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Page Title EN */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Page Title ( Dashboard )</label>
              <input
                name="pageTitle"
                value={formData.pageTitle}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
                placeholder="Page Title"
              />
            </div>



            {/* Step Number */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Step Number</label>
              <input
                name="stepNumber"
                value={formData.stepNumber}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
                placeholder="1"
              />
            </div>

            {/* Title EN */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Title ( Application ) </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
                placeholder="Title (EN)"
              />
            </div>

            {/* Title AR */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Title Ar ( Application )</label>
              <input
                name="titleAr"
                dir="rtl"
                value={formData.titleAr}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767] text-right"
                placeholder="Title (AR)"
              />
            </div>

            {/* Sentence EN */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Sentence</label>
              <input
                name="sentence"
                value={formData.sentence}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
                placeholder="Sentence (EN)"
              />
            </div>

            {/* Sentence AR */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Sentence Ar</label>
              <input
                name="sentenceAr"
                dir="rtl"
                value={formData.sentenceAr}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767] text-right"
                placeholder="Sentence (AR)"
              />
            </div>

            {/* Photo Upload - span full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Photo</label>
              <div className="relative w-full">
                <input
                  type="file"
                  id="photoUpload"
                  name="stepImage"
                  onChange={handleChange}
                  className="hidden"
                />
                <label
                  htmlFor="photoUpload"
                  className="absolute top-0 end-0 cursor-pointer border-[#91AEC0] h-full flex items-center px-4 py-1 text-sm text-[#344767] font-semibold border rounded-e-md"
                >
                  Browse
                </label>

                <input
                  type="text"
                  readOnly
                  value={formData.stepImage?.name || ""}
                  className="w-full border cursor-auto border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none"
                />

                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="mt-3 absolute object-contain top-[-9.5px] end-23 w-10 h-8 rounded-lg"
                    alt="Preview"
                  />
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <NewButton
                type="submit"
                className="w-[120px] h-9 text-sm bg-[#344767] hover:bg-[#344767d3] mt-2"
                disabled={loading}
              >
                {loading ? "Saving..." : "Create"}
              </NewButton>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CreatePage;
