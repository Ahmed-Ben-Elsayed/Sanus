import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../ui/loading/LoadingOrder";
import { IoIosArrowBack } from "react-icons/io";
import Loaderstart from "../../ui/loading/Loaderstart";
import NewButton from "../../ui/NewButton";

const CreatePage = ({ setCurrentSection }) => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    pageTitle: "",
    stepNumber: "",
    title: "",
    sentence: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.pageTitle.trim() ||
      !formData.stepNumber.trim() ||
      !formData.title.trim() ||
      !formData.sentence.trim() ||
      !formData.stepImage
    ) {
      return toast.error("Please fill all fields and upload an image.");
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("pageTitle", formData.pageTitle);
      body.append("stepNumber", formData.stepNumber);
      body.append("title", formData.title);
      body.append("sentence", formData.sentence);
      body.append("stepImage", formData.stepImage);

      await axios.post(`${BASE_URL}/onboarding`, body, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Page created successfully");
      setCurrentSection?.("On Boarding");
      navigate("/Admin", { replace: true });
    } catch(err) {
      toast.error(err?.response?.data?.message);      
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
        const n = localStorage.getItem("numberOfPages");
        if (n>=3) {
                navigate("/Admin", { replace: true });
            } 
    },[])
  return (
    <div className="w-full min-h-[100%] mx-auto p-6 bg-white rounded-lg shadow">
      {loading ? (
        <Loaderstart />
      ) : (
        <>
         <h2 className="text-lg md:text-xl mb-4 font-semibold flex items-center gap-1 text-[#7A83A3]">
                  <IoIosArrowBack
                    className="cursor-pointer"
                    onClick={() => navigate("/Admin")}
                  />
                  Create Page
                </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Page Title */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">
                Page Title
              </label>
              <input
                name="pageTitle"
                value={formData.pageTitle}
                onChange={handleChange}
                className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
              />
            </div>
  <div>
    <label className="block text-sm font-medium text-[#6b7280] mb-1">
      Step Number
    </label>
    <input
      name="stepNumber"
      value={formData.stepNumber}
      onChange={handleChange}
      className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-[#6b7280] mb-1">
      Title
    </label>
    <input
      name="title"
      value={formData.title}
      onChange={handleChange}
      className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-[#6b7280] mb-1">
      Sentence
    </label>
    <input
      name="sentence"
      value={formData.sentence}
      onChange={handleChange}
      className="w-full border border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none focus:ring-[#344767]"
    />
  </div>
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
        value={formData.stepImage?.name || ""}
        className="w-full border cursor-auto border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none"
      />
      {imagePreview && (
        <img
          src={imagePreview}
          className="mt-3 absolute object-contain top-[-6.5px] end-22 w-8 h-8 rounded-lg"
          alt="Preview"
        />
      )}
    </div>
  </div>
  <NewButton
    type="submit"
    className="w-[12%] bg-[#344767] hover:bg-[#344767d3] mt-2"
    disabled={loading}
  >
    {loading ? "Saving..." : "Create"}
  </NewButton>
</form>
        </>
      )}
    </div>
  );
};

export default CreatePage;
