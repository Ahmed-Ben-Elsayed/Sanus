import React, { useEffect, useState } from "react";
import ReusableInput from "../../ui/ReuseInput";
import { MdArrowBack, MdArrowForward, MdOutlineDateRange, MdOutlineFileDownload } from "react-icons/md";
import ReusableSelector from "../../ui/ReusableSelector";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoIosArrowDown,
  IoIosArrowUp,
} from "react-icons/io";
import { PiExport } from "react-icons/pi";
import { toast } from "react-toastify";
import { TbDatabaseExclamation } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Loaderstart from "../../ui/loading/Loaderstart";

export const Tracking = ({}) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState(null);
  const [loading, setloading] = useState(true);
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState();

  const [filters, setFilters] = useState({
    orderNumber: "",
    phone: "",
    plan: "",
    package: "",
    from: "",
    to: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 7,
  });

  useEffect(() => {
    const calculatePageSize = () => {
      const tableHeight = window.innerHeight - 300;
      const rowHeight = 50;
      const calculatedPageSize = Math.floor(tableHeight / rowHeight);

      setPagination((prev) => ({
        ...prev,
        pageSize: calculatedPageSize,
      }));
    };

    calculatePageSize();
    window.addEventListener("resize", calculatePageSize);

    return () => window.removeEventListener("resize", calculatePageSize);
  }, []);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [packages, setPackages] = useState([]);

  const getOrders = async () => {
    try {
      setloading(true);
      const res = await axios.get(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const fetchedOrders = res?.data?.data?.orders || [];
      setOrders(fetchedOrders);

      const totalItems = fetchedOrders.length;
      const totalPages = Math.ceil(totalItems / pagination.pageSize);

      setPagination((prev) => ({
        ...prev,
        totalItems,
        totalPages,
        currentPage: 1,
      }));
      console.log(res);
    } catch (err) {
      console.log(err);
    } finally {
      setloading(false);
    }
  };

  const [plans, setplanse] = useState([]);
  const getPackages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/package`);
      const formatted = [
        { label: "All Packages", value: "All" },
        ...response?.data?.data?.packages.map((pkg) => ({
          label: pkg.name,
          value: pkg._id,
        })),
      ];
      console.log(response);

      console.log("Formatted packages:", formatted);
      setPackages(formatted);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    }
  };
  const getPalans = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/plans/`);
      const formatted = [
        { label: "All Packages", value: "" },
        ...response?.data?.data?.plans.map((pkg) => ({
          label: pkg.label,
          value: pkg.value,
        }))
      ];

      setplanse(formatted);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    }
  };

  useEffect(() => {
    getOrders();
    getPackages();
    getPalans();
  }, []);

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
      }));
    }
  };

  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;

  const exportToExcelDeleviey = () => {
    if (!orders || orders.length === 0) {
      console.warn("No orders available to export.");
      return;
    }

    const dataForExport = orders.map((cust, index) => ({
      "Marchent": "28",
      "Order Number": `${startIndex + index + 1}`,
      "Delivery Date": new Date().toLocaleDateString(),
      "Delivery Mode": "Standard",
      "Delivery Type": "Delivery",
      "Package Name": cust.items?.[0]?.package?.name || "N/A",
      "Date": new Date(cust.createdAt).toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      "Customer Name": cust.user?.name || "",
      " Customer Phone": cust?.shippingAddress?.phone || "",
      "Timeslot": cust.time_slot.value || "N/A",
      "SMS": "True",
      "Address": cust?.shippingAddress?.address || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);

    const columnWidths = Object.keys(dataForExport[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...dataForExport.map((row) => String(row[key] || "").length)
      ) + 2,
    }));
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Delivery Details");

    XLSX.writeFile(workbook, "Delivery_Details.xlsx");
  };

  const exportToExcel = () => {
    if (!orders || orders.length === 0) {
      console.warn("No orders available to export.");
      return;
    }

    const dataForExport = orders.map((cust, index) => ({
      "Order Number": `${startIndex + index + 1}`,
      "Customer Name": cust.user?.name || "",
      " Customer Phone": cust?.shippingAddress?.phone || "",
      "Package Name": cust.items?.[0]?.package?.name || "N/A",
      "Date": new Date(cust.createdAt).toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      "Cost": cust.totalAmount || "N/A",
      "Timeslot": cust.time_slot.value || "N/A",
      "Status": cust?.status || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);

    const columnWidths = Object.keys(dataForExport[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...dataForExport.map((row) => String(row[key] || "").length)
      ) + 2,
    }));
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscription Details");

    XLSX.writeFile(workbook, "Subscription_Details.xlsx");
  };

  const getPaymentClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-gray-800";
      case "paid":
        return "bg-green-100 text-gray-800";
      case "Payment Failed":
        return "bg-red-100 text-gray-800";
      default:
        return "";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-gray-800";
      case "scheduled_freeze":
        return "bg-blue-100 text-gray-800";
      case "frozen":
        return "bg-blue-100 text-gray-800";
      case "cancel":
        return "bg-gray-200 text-gray-800";
      case "expired":
        return "bg-[#F8D991] text-gray-800";
      default:
        return "";
    }
  };

  const handleStatusChange = async (newStatus, orderId) => {
    try {
      setloading(true);
      await axios.patch(
        `${BASE_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      getOrders();
    } catch (error) {
      toast.error("Error updating status");
      console.error("Error updating status:", error);
    } finally {
      setloading(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus, orderId) => {
    try {
      setloading(true);
      await axios.patch(
        `${BASE_URL}/orders/${orderId}/payment`,
        { paymentStatus: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      getOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setloading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const filteredOrders = orders.filter((order, i) => {
    const { orderNumber, phone, package: pkg, from, to } = filters;

    const packageId = order.items?.[0]?.package?._id || "";

    const matchesOrderNumber = orderNumber
      ? String(i).includes(orderNumber)
      : true;

    const matchesPhone = phone
      ? order.shippingAddress?.phone?.includes(phone)
      : true;

    const matchesPackage = pkg ? packageId === pkg || pkg === "All" : true;
    const paymentStatus = order?.paymentStatus === "paid";
    const status = order?.status === "active";
    const matchesFrom = from
      ? new Date(order.createdAt) >= new Date(from)
      : true;
    const matchesTo = to
      ? new Date(order.createdAt) <= new Date(to)
      : true;
    const hasFutureMeals = order.MealPlan?.dailyPlans?.some(plan => {
      return new Date(plan.date) >= new Date().setHours(0, 0, 0, 0);
    });

    return (
      matchesOrderNumber &&
      matchesPhone &&
      matchesPackage &&
      matchesFrom &&
      status &&
      matchesTo && paymentStatus && hasFutureMeals
    );
  });

  useEffect(() => {
    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);

    setPagination((prev) => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: 1,
    }));
  }, [filters, orders]);

  const paginatedOrders = filteredOrders.slice(
    (pagination.currentPage - 1) * pagination.pageSize,
    pagination.currentPage * pagination.pageSize
  );

  return (
    <>
      {loading && <Loaderstart />}
      <div className="shadow-sm rounded-xl w-full bg-white min-h-[calc(100vh-77px)] p-2 sm:p-4 flex flex-col">
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-2 sm:gap-4 mb-4 sm:mb-6">
          {/* Filters */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:flex flex-wrap gap-10 md:gap-3 w-full md:w-auto">
            <div className="min-w-[140px] flex-1">
              <ReusableInput
                name="orderNumber"
                label="Order Number"
                placeholder="Enter Number"
                value={filters.orderNumber}
                onChange={handleFilterChange}
                className="text-[#476171] text-xs py-2 h-[42px] w-full"
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <ReusableInput
                name="phone"
                label="Customer Phone"
                placeholder="Enter Phone"
                value={filters.phone}
                onChange={handleFilterChange}
                className="text-[#476171] text-xs py-2 h-[42px] w-full"
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <ReusableSelector
                name="package"
                label="Package Name"
                placeholder="Select a package"
                value={filters.package}
                onChange={handleFilterChange}
                options={packages}
                className="mt-3 min-w-[100%!important]"
                custclassNameItems="w-[100%!important] start-[0px!important]"
                custclassName="bg-white  text-gray-700 text-xs py-2 h-[42px] w-[100%!imprtant]"
              />
            </div>
            <div className="min-w-[120px] flex-1">
              <ReusableInput
                name="from"
                label="Date From"
                type="date"
                value={filters.from}
                onChange={handleFilterChange}
                className="text-[#476171] text-xs py-2 h-[42px] w-full"
              />
            </div>
            <div className="min-w-[120px] flex-1">
              <ReusableInput
                name="to"
                label="To"
                type="date"
                value={filters.to}
                onChange={handleFilterChange}
                className="text-[#476171] text-xs py-2 h-[42px] w-full"
              />
            </div>
          </div>
          <div className="flex mt-10  flex-col gap-2 flex-shrink-0 md:mt-[-10px!important] min-w-[130px] w-full md:w-auto">
            <ReusableSelector
              placeholder={
                <span className="flex items-center gap-1 text-sm text-white">
                  <PiExport className="text-white text-lg font-bold" /> Export
                </span>
              }
              options={[
                { label: "Export Delivery", value: "Delivery" },
                { label: " Export Subscription", value: "excel" },
              ]}
              onChange={(e) => {
                const value = e?.target?.value;
                if (value === "Delivery") exportToExcelDeleviey();
                else if (value === "excel") exportToExcel();
              }}
              custclassNameItems="w-[100%!important] start-[0px!important]"
            />
          </div>
        </div>
        <hr className="border-none block h-[1.5px] mt-[-10px] mb-3 sm:mb-5 bg-gray-200" />

        {/* Table Section */}
        <div className="flex-grow overflow-x-auto rounded-lg">
          {paginatedOrders?.length > 0 ? (
            <div className="overflow-x-auto md:h-[100%] min-h-[50vh] ">
              <table className="min-w-full divide-y   divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#7B809A] tracking-wider">
                      Order
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#7B809A] tracking-wider">
                      Customer
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#7B809A] tracking-wider">
                      Phone
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#7B809A] tracking-wider">
                      Package
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#7B809A] tracking-wider">
                      Date
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#7B809A] tracking-wider">
                      Cost
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#7B809A] tracking-wider">
                      Time Slot
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#7B809A] tracking-wider">
                      Status
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#7B809A] tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-2 sm:px-4 py-6 text-cente r text-gray-500 text-sm"
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order, i) => (
                      <React.Fragment key={i}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                            <div className="flex text-xs sm:text-sm items-center gap-2">
                              <button
                                onClick={() =>
                                  setExpandedOrderIndex(expandedOrderIndex === i ? null : i)
                                }
                                className="focus:outline-none"
                              >
                                {expandedOrderIndex === i ? (
                                  <IoIosArrowUp className="text-gray-600 text-sm cursor-pointer" />
                                ) : (
                                  <IoIosArrowDown className="text-gray-600 text-sm cursor-pointer" />
                                )}
                              </button>
                              <span className="text-[#344767] text-xs sm:text-sm font-medium">
                                # {startIndex + i + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-[#344767] text-xs sm:text-sm">
                            {order?.user?.name}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-[#344767] text-xs sm:text-sm">
                            {order?.shippingAddress?.phone}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-[#344767] text-xs sm:text-sm">
                            {order?.items?.[0]?.package?.name}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-[#344767] text-xs sm:text-sm">
                            {new Date(order.MealPlan.dailyPlans[0].date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-[#344767] text-xs sm:text-sm">
                            {order?.totalAmount}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-gray-700 text-xs sm:text-sm">
                            {order?.time_slot?.value}
                          </td>
                          <td className="px-2 sm:px-4 py-3">
                            <ReusableSelector
                              name="status"
                              custclassNameArrow="text-[#344767!important]"
                              custclassNameItems="w-[100%!important] start-[0px!important]"
                              value={order?.status}
                              onChange={(e) => {
                                if (e.target.value !== "scheduled_freeze")
                                  handleStatusChange(e.target.value, order._id);
                                if (e.target.value === "scheduled_freeze") {
                                  navigate("/Admin/Tracking_Subscription/scheduled_freeze", {
                                    state: { orderId: order?._id || order?.id },
                                  });
                                }
                              }}
                              options={[
                                { label: "Active", value: "active" },
                                { label: "Freeze", value: "scheduled_freeze" },
                                { label: "Cancel", value: "cancel" },
                                { label: "Expired", value: "expired" },
                              ]}
                              className="py-[0px!important]"
                              custclassName={`rounded-md text-xs w-[90%] min-h-[2px!important] h-[30px!important] flex items-center ${getStatusClass(
                                order?.status
                              )}`}
                            />
                          </td>
                          <td className="px-2 sm:px-4 py-3">
                            <ReusableSelector
                              name="action"
                              custclassNameItems="start-[-59px!important] w-[170px!important]"
                              placeholder="Actions"
                              onChange={(e) => {
                                if (e.target.value === "info") {
                                  navigate("/Admin/Tracking_Subscription/moreinfo", {
                                    state: { orderId: order?._id || order?.id },
                                  });
                                } else if (e.target.value === "note") {
                                } else if (e.target.value === "scheduled_freeze") {
                                  navigate("/Admin/Tracking_Subscription/scheduled_freeze", {
                                    state: { orderId: order?._id || order?.id },
                                  });
                                } else if (e.target.value === "Add") {
                                  navigate("/Admin/Tracking_Subscription/Add");
                                } else if (e.target.value === "time slot") {
                                  navigate("/Admin/Tracking_Subscription/time_slot", {
                                    state: { orderId: order?._id || order?.id },
                                  });
                                } else if (e.target.value === "Chang") {
                                  navigate("/Admin/Tracking_Subscription/Change_Box", {
                                    state: { orderId: order?._id || order?.id },
                                  });
                                } else if (e.target.value === "ChangL") {
                                  navigate("/Admin/Tracking_Subscription/Change_Location", {
                                    state: { orderId: order?._id || order?.id },
                                  });
                                }
                              }}
                              options={[
                                { value: "info", label: "More Details", icon: "/Icons.png" },
                                { value: "time slot", label: "Change Time Slot", icon: "/Timer.png" },
                                { value: "Chang", label: "Change Box", icon: "/Box.png" },
                                { value: "ChangL", label: "Change Location", icon: "/Location.png" },
                              ]}
                              custclassName="rounded-md text-xs w-[90%] min-h-[2px!important] h-[30px!important] flex items-center"
                            />
                          </td>
                        </tr>
                        {expandedOrderIndex === i && (
                          <tr>
                            <td colSpan="9" className="px-2 sm:px-4 py-3 bg-gray-50">
                              <div className="grid grid-cols-1 text-xs sm:text-sm">
                                <div>
                                  <p className="text-gray-600 gap-2 justify-center flex flex-col">
                                    {order?.history?.map((msg, index) => (
                                      <div className="w-full flex items-center gap-1" key={index}>
                                        <MdArrowForward /> {msg?.message}
                                      </div>
                                    ))}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>

              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] py-12">
              <TbDatabaseExclamation className="text-5xl text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">No Tracking Subscription Found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalItems > pagination.pageSize && (
          <div className="mt-auto bg-white border-t border-gray-200 px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(
                  startIndex + pagination.pageSize,
                  pagination.totalItems
                )}
              </span>{" "}
              of <span className="font-medium">{pagination.totalItems}</span>{" "}
              orders
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${pagination.currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowBack className="inline mr-1" />
                Previous
              </button>

              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (
                    pagination.currentPage >=
                    pagination.totalPages - 2
                  ) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  if (pageNum > pagination.totalPages || pageNum < 1)
                    return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${pagination.currentPage === pageNum
                          ? "bg-gray-700 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${pagination.currentPage === pagination.totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Next
                <IoIosArrowForward className="inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};