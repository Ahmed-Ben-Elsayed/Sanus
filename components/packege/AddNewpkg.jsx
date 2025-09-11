import React, { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import ReusableInput from '../../ui/ReuseInput';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReusableSelector from '../../ui/ReusableSelector';
import Loaderstart from '../../ui/loading/Loaderstart';
import { useLocation, useNavigate } from 'react-router-dom';

export const AddNewpkg = () => {
  const location = useLocation();
  const pkgId = location.state?.PkgId;

  const [form, setForm] = useState({
    name: '',
    type: 'other',
    price: '',
    numberOfDays: '',
    templateId: '',
    includeBreakfast: false,
    includeLunch: false,
    includeDinner: false,
    planId: '',
    description: '',
    image: null,
    includeSnacksAM: false,
    includeSnacksPM: false,
    carbCount: '',
  });

  const [plane, setPlane] = useState([]);
  const [Templete, setTemplete] = useState([]);

  const [pendingRequests, setPendingRequests] = useState(0);
  const loading = pendingRequests > 0;

  const BaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const trackRequest = async (fn) => {
    setPendingRequests((p) => p + 1);
    try {
      await fn();
    } finally {
      setPendingRequests((p) => p - 1);
    }
  };

  const getPackage = async () => {
    if (!pkgId) return;
    const res = await axios.get(`${BaseUrl}/package/${pkgId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = res.data.data.package;
    setForm({
      name: data.name || '',
      type: data.type || '',
      price: data.price || '',
      numberOfDays: data.numberOfDays || '',
      templateId: data.template?._id || '',
      includeBreakfast: data.includeBreakfast ?? false,
      includeLunch: data.includeLunch ?? false,
      includeDinner: data.includeDinner ?? false,
      planId: data?.plan?._id || '',
      description: data.description || '',
      image: data.image,
      includeSnacksAM: data.includeSnacksAM ?? false,
      includeSnacksPM: data.includeSnacksPM ?? false,
      carbCount: data.carbCount || '',
    });
  };

  const getPlanes = async () => {
    const planes = await axios.get(`${BaseUrl}/plans`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (planes.status === 200) setPlane(planes.data.data.plans);
  };

  const getTempletes = async () => {
    const temps = await axios.get(`${BaseUrl}/template`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (temps.status === 200) setTemplete(temps.data.data.templates);
  };

  useEffect(() => {
    trackRequest(getPlanes);
    trackRequest(getTempletes);
    if (pkgId) trackRequest(getPackage);
  }, [pkgId]);

  const [previewImage, setPreviewImage] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };


  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.numberOfDays) {
      toast.warning('Please fill all required fields');
      return;
    }

    try {
      await trackRequest(async () => {
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
          if (key === 'numberOfDays' && pkgId) return;
          if (
            ['includeBreakfast', 'includeLunch', 'includeDinner', 'includeSnacksAM', 'includeSnacksPM'].includes(key) &&
            pkgId
          )
            return;

          if (form[key] !== null && form[key] !== undefined) {
            if (key === 'price') {
              formData.append(key, Number(form[key]));
            } else if (typeof form[key] === 'boolean') {
              formData.append(key, form[key]);
            } else {
              formData.append(key, form[key]);
            }
          }
        });

        if (pkgId) {
          await axios.patch(`${BaseUrl}/package/${pkgId}`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          toast.success('Package updated successfully');
        } else {
          await axios.post(`${BaseUrl}/package`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          toast.success('Package saved successfully');
        }

        navigate('/Admin/Packages', { state: {} });
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error saving package');
    }
  };


  return (
    <>
      <div className="shadow-sm rounded-xl overflow-auto w-full bg-white h-[calc(100vh-77px)] p-4 flex flex-col">
        {loading && <Loaderstart />}
        <div className="flex items-center gap-2 mb-3">
          <IoIosArrowBack
            className="cursor-pointer text-gray-400 text-xl"
            onClick={() => {
              navigate('/Admin/Packages', { state: {} });
            }}
          />
          <h2 className="text-lg md:text-xl font-semibold text-[#7A83A3]">Add New Package</h2>
        </div>

        <hr className="border-gray-300 my-3" />

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6  gap-4">
            <ReusableInput
              name="name"
              label="Package Name"
              placeholder="Enter Name"
              value={form.name}
              onChange={handleChange}
              
            />
            <ReusableInput
              name="numberOfDays"
              label="Num of Box"
              type="number"
              maxLength='2'
              max={24}
              disabled={pkgId ? true : false}
              placeholder="e.g. 16"
              value={form.numberOfDays}
              onChange={handleChange}
            />

            <ReusableInput
              name="price"
              label="Price"
              placeholder="e.g. 1500$"
              value={form.price}
              onChange={handleChange}
            />
            <ReusableInput
              name="carbCount"
              label="Carbs"
              placeholder="e.g. 150g"
              value={form.carbCount}
              onChange={handleChange}

            />
            <ReusableSelector
              label="Plane Name"
              options={plane.map((p) => ({
                label: p?.name,
                value: p._id,
              }))}
              value={form.planId}
              onChange={(v) => setForm((prev) => ({ ...prev, planId: v.target.value }))}
              className="!max-w-[100%]"
              custclassNameItems="!w-[100%] start-[0px!important]"
              custclassNameArrow='!text-[#476171]'
              custclassName="bg-white text-gray-700 text-xs !py-[0px] mt-[3px] !w-[100%]"
            />
            <ReusableSelector
              label="Templete Name"
              options={Templete.map((p) => ({
                label: p?.name,
                value: p._id,
              }))}
              value={form.templateId}
              disabled={pkgId ? true : false}
              onChange={(v) => setForm((prev) => ({ ...prev, templateId: v.target.value }))}
              className="!max-w-[100%]"
              custclassNameArrow='!text-[#476171]'
              custclassNameItems="!w-[100%] start-[0px!important]"
              custclassName="bg-white text-gray-700 text-xs !py-[0px] mt-[3px] !w-[100%]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            {['Breakfast', 'Lunch', 'Dinner', 'SnacksAM', 'SnacksPM'].map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={`include${item}`}
                  checked={form[`include${item}`]}
                  onChange={handleCheckboxChange}
                  className='cursor-pointer'
                  disabled={pkgId ? true : false}
                />
                <span className="text-[#476171] font-medium">Include {item}</span>
              </label>
            ))}
          </div>


          <div className="flex flex-col">
            <label className="text-sm text-[#476171] font-bold mb-1"> description of Packge </label>
            <textarea
              name="description"
              rows={3}
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="Write description..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <h1 className='!mb-[-13px] !text-[#476171] font-semibold ' >Photo</h1>
         <div className="relative w-full">
  {(previewImage || (form.image && typeof form.image === "string")) && (
    <img
      alt="pkg image"
      className="w-7 end-25 absolute top-2 h-7 object-cover rounded"
      src={
        previewImage
          ? previewImage
          : form.image?.replace("http://137.184.244.200:5050", "/img-proxy")
      }
    />
  )}

  <input
    type="file"
    id="photoUpload"
    name="image"
    onChange={handleFileChange}
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
    value={form?.image && typeof form.image !== "string" ? form.image.name : ""}
    className="w-full border cursor-auto border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none"
  />
</div>

          <div>
            <button
              type="submit"
              className="bg-[#476171] cursor-pointer text-white px-5 py-2 rounded hover:bg-[#3b505c]"
            >
              Save Package
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
