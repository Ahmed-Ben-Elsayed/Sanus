import React, { useEffect, useState } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import ReusableInput from "../../ui/ReuseInput";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loaderstart from "../../ui/loading/Loaderstart";
import NewButton from "../../ui/NewButton";

export const Customers = () => {
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    dateFrom: "",
    dateTo: "",
  });
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getCustomer = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      const res = await axios.get(`${BASE_URL}/auth/getUsersInfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res?.data?.Data || [];
      setCustomer(data);
    } catch (err) {
      console.error("Error fetching customer data:", err);
      toast.error("Failed to load customer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCustomer();
  }, []);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredCustomers = customer.filter((cust) => {
    const nameMatch = cust.name
      ?.toLowerCase()
      .includes(filters.name.toLowerCase());

    const emailMatch = cust.email
      ?.toLowerCase()
      .includes(filters.email.toLowerCase());

    const custDate = new Date(cust.createdAt);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

    const dateMatch =
      (!fromDate || custDate >= fromDate) && (!toDate || custDate <= toDate);

    return nameMatch && emailMatch && dateMatch;
  });

  const exportToExcel = () => {
    const dataForExport = customer.map((cust) => ({
      Name: cust.name,
      Phone: cust.phone,
      Email: cust.email,
      Age: cust.age,
      Gender: cust.gender,
      "Height (cm)": cust.height,
      "Weight (kg)": cust.weight,
      BMI: cust.bmi,
      "Join Date": new Date(cust.createdAt).toLocaleDateString("en-GB"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    const fileName = `customers_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="shadow-sm bg-white rounded-xl w-full h-full md:min-h-[calc(100vh-77px)] p-4 overflow-y-auto">
      <div className="overflow-x-auto">
        {/* === Filters === */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end flex-wrap">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full md:w-auto">
            <div className="min-w-[160px] flex-1">
              <ReusableInput
                label="Name"
                name="name"
                placeholder="Enter name"
                className="text-[#476171]"
                onChange={handleInputChange}
                value={filters.name}
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <ReusableInput
                label="Email"
                name="email"
                placeholder="Enter email"
                className="text-[#476171]"
                onChange={handleInputChange}
                value={filters.email}
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <ReusableInput
                label="From Date"
                name="dateFrom"
                type="date"
                className="text-[#476171]"
                onChange={handleInputChange}
                value={filters.dateFrom}
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <ReusableInput
                label="To Date"
                name="dateTo"
                type="date"
                className="text-[#476171]"
                onChange={handleInputChange}
                value={filters.dateTo}
              />
            </div>
          </div>
          <NewButton
            onClick={exportToExcel}
            className="min-w-[140px] mt-2 md:mt-0"
            icon={MdOutlineFileDownload}
          >
            Export
          </NewButton>
        </div>

        <hr className="bg-[#D1D1D1] border-none h-[1px] my-3 w-full mx-auto" />

        {/* === Table === */}
        {loading ? (
          <Loaderstart />
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-10 text-[#476171] font-semibold">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-max mt-3 w-full text-sm text-left">
              <thead className="text-[#7B809A] text-[12px] bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Age</th>
                  <th className="px-4 py-2">Gender</th>
                  <th className="px-4 py-2">Height</th>
                  <th className="px-4 py-2">Weight</th>
                  <th className="px-4 py-2">Join Date</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredCustomers.map((cust, index) => (
                  <tr
                    key={index}
                    className="border-b border-b-[#E8E8E8] text-[#476171] hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 text-[12px] font-semibold">
                      {cust.name}
                    </td>
                    <td className="px-4 py-2 text-[12px]">{cust.email}</td>
                    <td className="px-4 py-2 text-[12px]">{cust.age}</td>
                    <td className="px-4 py-2 text-[12px]">{cust.gender}</td>
                    <td className="px-4 py-2 text-[12px]">{cust.height} cm</td>
                    <td className="px-4 py-2 text-[12px]">{cust.weight} kg</td>
                    <td className="px-4 py-2 text-[12px]">
                      {new Date(cust.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td
                      onClick={() => {
                        navigate("/Admin/Account_Customers/moreInfo", {
                          state: { custId: cust.id || cust._id },
                        });
                      }}
                      className="px-4 py-2 text-[12px] text-[#44818E] underline font-bold cursor-pointer"
                    >
                      More Info
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
