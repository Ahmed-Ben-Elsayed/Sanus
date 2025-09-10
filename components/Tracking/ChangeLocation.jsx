import React, { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import ReusableSelector from '../../ui/ReusableSelector';
import ReusableInput from '../../ui/ReuseInput';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../ui/loading/LoadingOrder';
import { toast } from 'react-toastify';
import NewButton from '../../ui/NewButton';
import { FaPlus } from 'react-icons/fa';

export const ChangeLocation = ( ) => {
  const location = useLocation();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [shippingAddress, setShippingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const orderId = location.state?.orderId;
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    type: 'Home',
    zone: '',
    street: '',
    building: '',
    floor: '',
    details: '',
    phone: '',
    city: '',
    country: '',
  });

  const fetchOrderById = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const fetchedAddress = response?.data?.data?.order?.shippingAddress;
      setShippingAddress(fetchedAddress);
      console.log(response.data.data.order.shippingAddress);
      
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrderById(orderId);
  }, [orderId]);

  useEffect(() => {
    if (shippingAddress) {
      setAddress((prev) => ({
        ...prev,
        type: shippingAddress.type || 'Home',
        zone: shippingAddress.zone || '',
        street: shippingAddress.street || '',
        building: shippingAddress.building || '',
        floor: shippingAddress.floor || '',
        details: shippingAddress.address || '',
        phone: shippingAddress.phone || '',
        city: shippingAddress.city || '',
        country: shippingAddress.country || '',
      }));
    }
  }, [shippingAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.zone || !address.phone) {
      alert('Zone and phone are required.');
      return;
    }

    const payload = {
      shippingAddress: {
        type: address.type,
        zone: address.zone,
        street: address.street,
        building: address.building,
        floor: address.floor,
        phone: address.phone,
        city: address.city || '-',
        country: address.country || 'egypt',
        address: address.details,
      },
      time_slot_id: '68593627f6d0244425c8c3a7',
      time_slot_value: '6am-11am',
    };

    try {
      setLoading(true);
      await axios.patch(`${BASE_URL}/orders/${orderId}/details`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Address updated successfully.');
      setLoading(false);
      navigate("/Admin/Tracking_Subscription", { state: {} });
    } catch (err) {
      console.error('Error updating address:', err);
      toast.error('Failed to update address.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setAddress({
      type: 'Home',
      zone: '',
      street: '',
      building: '',
      floor: '',
      details: '',
      phone: '',
      city: '',
      country: '',
    });
  };

  useEffect(() => {
    const { zone, street, building, floor, phone } = address;
    const summary = `Zone: ${zone || '-'}, Street: ${street || '-'}, Building: ${building || '-'}, Floor: ${floor || '-'}, Phone: ${phone || '-'}`;
    setAddress((prev) => ({
      ...prev,
      details: summary,
    }));
  }, [address.zone, address.street, address.building, address.floor, address.phone]);

  return (
    <>
      {loading && <Loading />}
      <div className="w-full mx-auto h-full  md:min-h-[calc(100vh-77px)] overflow-auto p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-1 text-[#7A83A3]">
            <IoIosArrowBack
              className="cursor-pointer"
              onClick={() => { navigate("/Admin/Tracking_Subscription", { state: {} }) }}
            />
            Change Location
          </h2>
          <NewButton
            type="button"
            onClick={handleAddNew}
            className="bg-[#476171] cursor-pointer text-white px-4 py-1 rounded text-sm"
            children={"Add New"}
            icon={FaPlus}
          >
          </NewButton>
        </div>

        <hr className="h-[1px] my-5 w-full border-none bg-[#E8E8E8]" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <ReusableSelector
            name="type"
            value={address.type}
            onChange={handleChange}
            label="Other Address"
            options={[
              { label: 'Home', value: 'Home' },
              { label: 'Work', value: 'Work' },
              { label: 'Other', value: 'Other' },
            ]}
            custclassName="bg-white text-[#476171!important] min-w-[150%!important]"
            custclassNameArrow="text-[#476171!important]"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ReusableInput name="zone" onChange={handleChange} value={address.zone} label="Zone" className="min-w-full" />
            <ReusableInput name="street" onChange={handleChange} value={address.street} label="Street" className="min-w-full" />
            <ReusableInput name="building" onChange={handleChange} value={address.building} label="Building" className="min-w-full" />
            <ReusableInput name="floor" onChange={handleChange} value={address.floor} label="Floor" className="min-w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#476171]">Details</label>
            <textarea
              name="details"
              value={address.details}
              onChange={handleChange}
              rows={4}
              className="w-full border text-[#476171] border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="max-w-[250px]">
            <ReusableInput
              name="phone"
              onChange={handleChange}
              value={address.phone}
              label="Phone"
              className="w-full"
            />
          </div>

          <div>
            < NewButton
              type="submit"
              className="bg-[#476171] cursor-pointer text-white py-2 px-6 rounded-md hover:bg-gray-800"
              disabled={loading}
              children="Save"
            >
            </NewButton>
          </div>
        </form>
      </div>
    </>
  );
};
