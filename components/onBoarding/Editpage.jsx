import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../ui/loading/LoadingOrder";
import { FaArrowLeft } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import Loaderstart from "../../ui/loading/Loaderstart";
import NewButton from "../../ui/NewButton";

const EditPage = ({ setCurrentSection }) => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    pageid: "",
    pageTitle: "",
    stepNumber: "",
    title: "",
    sentence: "",
    stepImage: null,
  });

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
        stepNumber: stepData.stepNumber || "",
        title: stepData.title || "",
        sentence: stepData.sentence || "",
        stepImage: stepData.image || null,
      });
      setImagePreview(stepData.image || null);
    } catch (error) {
      // toast.error("Failed to fetch page data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getById(id);
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
      form.append("stepNumber", formData.stepNumber);
      form.append("title", formData.title);
      form.append("sentence", formData.sentence);

      if (formData.stepImage instanceof File) {
        form.append("stepImage", formData.stepImage);
      }

      await axios.patch(
        `${BASE_URL}/onboarding/${formData.pageid}`,
        form,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Page updated successfully");
      setCurrentSection("On Boarding");
      navigate("/Admin");
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to update page.");

    } finally {
      setLoading(false);
    }
  };
  console.log("Form Data:", formData);
  console.log("Image Preview:", imagePreview);

  return (
    <div className="w-full min-h-[100%] mx-auto p-6 bg-white rounded-lg shadow">
      {!loading && formData.pageid ? (
        <>
          <h2 className="text-xl font-semibold flex items-center gap-1 text-[#7A83A3] mb-6">
            <IoIosArrowBack className="cursor-pointer" onClick={() => setCurrentSection("On Boarding")} />
            Edit Page {formData.pageTitle}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Page Title */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">
                Page Title
              </label>
              <input
                type="text"
                name="pageTitle"
                value={formData.pageTitle}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
              />
            </div>

            {/* Step Number */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">
                Step Number
              </label>
              <input
                type="text"
                name="stepNumber"
                value={formData.stepNumber}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
              />
            </div>

            {/* Sentence */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">
                Sentence
              </label>
              <input
                type="text"
                name="sentence"
                value={formData.sentence}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">
                Photo
              </label>
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
                      : ""
                  }
                  className="w-full  border cursor-auto border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none"
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
                    className="mt-3 absolute object-contain top-[-6.5px] end-22 w-13 h-8 rounded-lg"
                  />
                )}

              </div>

            </div>

            {/* Submit Button */}
            <NewButton
              type="submit"
              className="w-[120px] h-9 text-sm bg-[#344767] hover:bg-[#344767d3] transition"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </NewButton>
          </form>
        </>
      ) : (
        <Loaderstart />
      )}
    </div>
  );
};

export default EditPage;
