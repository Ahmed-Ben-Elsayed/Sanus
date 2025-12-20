import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../ui/loading/LoadingOrder";
import { IoIosArrowBack } from "react-icons/io";
import Loaderstart from "../../ui/loading/Loaderstart";
import NewButton from "../../ui/NewButton";

const EditPage = () => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    pageid: "",
    pageTitle: "",
    pageTitleAr: "صفحة",
    stepNumber: "",
    title: "",
    titleAr: "",
    sentence: "",
    sentenceAr: "",
    stepImage: null,
  });

  const getFileNameFromUrl = (url) => {
    try {
      const parts = url.split("/");
      return parts[parts.length - 1];
    } catch (e) {
      return "";
    }
  };

  const getById = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/onboarding/step/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const stepData = response.data.data.step;

      setFormData({
        pageid: stepData.id || stepData._id,
        pageTitle: stepData.pageTitle || "",
        pageTitleAr: stepData.pageTitleAr || "",
        stepNumber: stepData.stepNumber || "",
        title: stepData.title || "",
        titleAr: stepData.titleAr || "",
        sentence: stepData.sentence || "",
        sentenceAr: stepData.sentenceAr || "",
        stepImage: stepData.image || null,
      });

      setImagePreview(stepData.image || null);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch page data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getById(id);
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const form = new FormData();
      form.append("pageTitle", formData.pageTitle);
      form.append("pageTitleAr", formData.pageTitleAr);
      form.append("stepNumber", formData.stepNumber);
      form.append("title", formData.title);
      form.append("titleAr", formData.titleAr);
      form.append("sentence", formData.sentence);
      form.append("sentenceAr", formData.sentenceAr);
      if (formData.stepImage instanceof File) {
        form.append("stepImage", formData.stepImage);
      }

      await axios.patch(`${BASE_URL}/onboarding/${formData.pageid}`, form, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Page updated successfully");
      navigate("/Admin/On_Boarding");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[100%] mx-auto p-6 bg-white rounded-lg shadow">
      {!loading && formData.pageid ? (
        <>
          <h2 className="text-xl font-semibold flex items-center gap-1 text-[#7A83A3] mb-6">
            <IoIosArrowBack
              className="cursor-pointer"
              onClick={() => navigate(`/Admin/On_Boarding`)}
            />
            Edit Page — {formData.pageTitle || formData.pageTitleAr}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Page Title EN */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Page Title (Dashboard)</label>
              <input
                type="text"
                name="pageTitle"
                value={formData.pageTitle}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
                placeholder="Page Title "
              />
            </div>

        

            {/* Step Number */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Step Number</label>
              <input
                type="text"
                name="stepNumber"
                value={formData.stepNumber}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
                placeholder="1"
              />
            </div>

            {/* Title EN */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Title ( Application )</label>
              <input
                type="text"
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
                type="text"
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
                type="text"
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
                type="text"
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
                  value={
                    formData.stepImage instanceof File
                      ? formData.stepImage.name
                      : formData.stepImage
                      ? getFileNameFromUrl(formData.stepImage)
                      : ""
                  }
                  className="w-full border cursor-auto border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none"
                />

                {/* Preview */}
                {imagePreview && (
                  <img
                    src={
                      imagePreview.startsWith("blob:")
                        ? imagePreview
                        : imagePreview.replace("http://137.184.244.200:5050", "/img-proxy")
                    }
                    alt="Step Preview"
                    className="mt-3 absolute object-contain top-[-9.5px] end-23 w-10 h-8 rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Submit Button - span full width and aligned to right */}
            <div className="md:col-span-2 flex justify-end">
              <NewButton
                type="submit"
                className="w-[120px] h-9 text-sm bg-[#344767]  hover:bg-[#2A3C47]  transition"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </NewButton>
            </div>
          </form>
        </>
      ) : (
        <Loaderstart />
      )}
    </div>
  );
};

export default EditPage;
