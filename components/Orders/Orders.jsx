import React, { useEffect, useRef, useState } from "react";
import ReusableInput from "../../ui/ReuseInput";
import { MdOutlineDateRange, MdOutlineFileDownload } from "react-icons/md";
import ReusableSelector from "../../ui/ReusableSelector";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoIosArrowDown,
  IoIosArrowUp,
} from "react-icons/io";
import Loading from "../../ui/loading/LoadingOrder";
import { toast } from "react-toastify";
import { TbDatabaseExclamation } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import Modal from "../../ui/Modal";
import LoadingOrder from "../../ui/loading/LoadingOrder";
import NewButton from "../../ui/NewButton";
import { PiExport } from "react-icons/pi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const Orders = ({ active, setactive }) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState(null);
  const [loading, setloading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showModalorder, setShowModalorder] = useState(false);
  const [showModalsticker, setShowModalsticker] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedmeal, setSelectedmeal] = useState(null);
  const [typeMeal, setTypeMeal] = useState("");
  const [orderId, setOrderId] = useState();
  const cardRef = useRef();

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
    pageSize: 10,
  });

  const downloadPDF = async () => {
    const node = cardRef.current;
    if (!node) return;

    const originalStyles = [];
    const elements = node.querySelectorAll("*");

    elements.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);
      ["color", "backgroundColor", "borderColor"].forEach((prop) => {
        const value = computedStyle.getPropertyValue(prop);
        if (value.includes("oklch")) {
          originalStyles.push({ el, prop, value: el.style[prop] });
          if (prop === "color") el.style[prop] = "#000";
          else if (prop === "backgroundColor") el.style[prop] = "#fff";
          else if (prop === "borderColor") el.style[prop] = "#ccc";
        }
      });
    });

    const width = node.offsetWidth;
    const height = node.offsetHeight;

    try {
      const canvas = await html2canvas(node, {
        scale: 4,
        useCORS: true,
        backgroundColor: "#fff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: height > width ? "portrait" : "landscape",
        unit: "pt",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        canvas.width,
        canvas.height,
        "",
        "FAST"
      );
      pdf.save(`Order_${selectedOrder?._id || "Card"}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Error exporting PDF");
    } finally {
      originalStyles.forEach(({ el, prop, value }) => {
        el.style[prop] = value;
      });
    }
  };

  useEffect(() => {
    const calculatePageSize = () => {
      const tableHeight = window.innerHeight - 300;
      const rowHeight = 50;
      const calculatedPageSize = Math.floor(tableHeight / rowHeight);

      setPagination((prev) => ({
        ...prev,
        pageSize: calculatedPageSize > 0 ? calculatedPageSize : 10,
      }));
    };

    calculatePageSize();
    window.addEventListener("resize", calculatePageSize);

    return () => window.removeEventListener("resize", calculatePageSize);
  }, []);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [packages, setPackages] = useState([]);
  const [plans, setPlans] = useState([]);

  const getPackages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/package`);
      const formatted = response?.data?.data?.packages.map((pkg) => ({
        label: pkg.name,
        value: pkg._id,
      }));
      setPackages(formatted);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
      toast.error("Failed to fetch packages");
    }
  };

  const getPlans = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/plans/`);
      const formatted = response?.data?.data?.plans.map((pkg) => ({
        label: pkg.name,
        value: pkg._id,
      }));
      setPlans(formatted);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      toast.error("Failed to fetch plans");
    }
  };

  const getOrders = async () => {
    try {
      setloading(true);
      const res = await axios.get(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log(res.data.data.orders);

      const fetchedOrders = res?.data?.data?.orders || [];
      setOrders(fetchedOrders);

      const totalItems = fetchedOrders.length;
      const totalPages = Math.ceil(totalItems / pagination.pageSize);

      setPagination((prev) => ({
        ...prev,
        totalItems,
        totalPages,
        currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage,
      }));
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    getOrders();
    getPackages();
    getPlans();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
      }));
    }
  };

  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;

  const exportToExcel = () => {
    if (!orders || orders.length === 0) {
      toast.warn("No orders available to export");
      return;
    }
    const dataForExport = orders.map((cust, index) => ({
      "Order Number": startIndex + index + 1,
      "Customer Name": cust.user?.name || "N/A",
      Phone: cust?.shippingAddress?.phone || "N/A",
      Package: cust.items?.[0]?.package?.name || "N/A",
      PackageAr: cust.items?.[0]?.package?.nameAr || "N/A",
      From: new Date(cust.createdAt).toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      "Payment Status": cust.paymentStatus || "N/A",
      Status: cust.status || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const columnWidths = Object.keys(dataForExport[0]).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...dataForExport.map((row) => String(row[key] || "").length)
        ) + 2,
    }));
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14);
    const fileName = `Orders_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success("Exported successfully");
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
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
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
      toast.success("Payment status updated successfully");
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Error updating payment status");
    } finally {
      setloading(false);
    }
  };

  const getTodaysMealName = (order, mealType) => {
    if (!order?.MealPlan?.dailyPlans) return null;

    const today = new Date().toISOString().split("T")[0];
    const todaysPlan = order.MealPlan.dailyPlans.find(
      (plan) => plan?.date?.split("T")[0] === today
    );

    const mealEntry = todaysPlan?.meals?.[mealType]?.[0]?.meal;
    if (!mealEntry) return null;

    if (typeof mealEntry === "string") {
      return mealEntry.trim();
    }

    if (typeof mealEntry === "object") {
      return (mealEntry.name + " - " + (mealEntry?.nameAr || "")) || JSON.stringify(mealEntry);
    }

    return String(mealEntry);
  };

  const handleMealClick = (description) => {
    setSelectedDescription(description || "No meal details available");
    setShowModal(true);
  };

  const gettypemeal = (type) => {
    setTypeMeal(type);
  };

  const handleOrder = (order) => {
    setSelectedOrder(order);
    setShowModalorder(true);
  };

  const handlemeal = (order) => {
    setSelectedmeal(order);
  };

  const getTodaysMealDate = (order) => {
    const dailyPlans = order?.MealPlan?.dailyPlans || [];
    if (!dailyPlans.length) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysPlan = dailyPlans.find((p) => {
      if (!p?.date) return false;
      const planDate = new Date(p.date);
      planDate.setHours(0, 0, 0, 0);
      return planDate.getTime() === today.getTime();
    });

    if (todaysPlan?.date) {
      return new Date(todaysPlan.date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: true,
      });
    }

    if (order?.createdAt) {
      return new Date(order.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: true,
      });
    }

    return "N/A";
  };

  useEffect(() => {
    if (selectedmeal) {
    }
  }, [selectedmeal, typeMeal]);

  const filteredOrders = orders.filter((order, i) => {
    const { orderNumber, phone, package: pkg, from, to } = filters;
    const packageId = order.items?.[0]?.package?._id || "";

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    const orderDate = new Date(order.createdAt);

    const dailyPlans = order?.MealPlan?.dailyPlans || [];
    const planDates = dailyPlans.map((p) => new Date(p.date));
    const minDate = planDates.length ? new Date(Math.min(...planDates)) : null;
    const maxDate = planDates.length ? new Date(Math.max(...planDates)) : null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasTodayMeal = dailyPlans.some((plan) => {
      const planDate = new Date(plan.date);
      planDate.setHours(0, 0, 0, 0);
      return planDate.getTime() === today.getTime();
    });

    const matchesOrderNumber = orderNumber
      ? String(startIndex + i + 1).includes(orderNumber)
      : true;

    const matchesPhone = phone
      ? order.shippingAddress?.phone?.includes(phone)
      : true;

    const matchesPackage = pkg ? packageId === pkg : true;
    const matchesFrom = fromDate ? orderDate >= fromDate : true;
    const matchesTo = toDate ? orderDate <= toDate : true;
    const paymentStatus = order.paymentStatus === "paid";
    const status = order.status === "active";

    return (
      matchesOrderNumber &&
      matchesPhone &&
      matchesPackage &&
      matchesFrom &&
      matchesTo&& 
      paymentStatus &&
      status &&
      hasTodayMeal
    );
  });

  useEffect(() => {
    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);

    setPagination((prev) => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage,
    }));
  }, [filters, orders, pagination.pageSize]);

  const paginatedOrders = filteredOrders.slice(
    (pagination.currentPage - 1) * pagination.pageSize,
    pagination.currentPage * pagination.pageSize
  );

  return (
    <>
      {loading && <LoadingOrder />}
      <div className="shadow-sm rounded-xl w-full bg-[#FFFFFF] h-full md:h-[calc(100vh-77px)] flex flex-col p-2 sm:p-4">
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-end gap-2 sm:gap-4 justify-between mb-4 sm:mb-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:flex flex-wrap gap-10  md:gap-2 w-full">
            <div className="min-w-[140px] flex-1">
              <ReusableInput
                name="orderNumber"
                label="Order Number"
                placeholder="Enter Number"
                value={filters.orderNumber}
                onChange={handleFilterChange}
                className="text-[#476171] text-xs py-2 h-[42px] w-full"
                custclassName="h-[42px]"
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
                custclassName="h-[42px]"
              />
            </div>
            <div className="flex-1">
              <ReusableSelector
                name="package"
                label="Package Name"
                placeholder="Enter package"
                value={filters.package}
                onChange={handleFilterChange}
                options={packages}
                custclassName="bg-white h-[42px] w-full text-[#476171!important] font-bold text-xs"
                custclassNameArrow="text-[#476171!important] "
                className="text-xs mt-3 min-w-[100%!important] font-bold"
                custclassNameItems="w-[100%!important] start-[0px!important]"
              />
            </div>
            <div className="min-w-[120px] md:mt-0 mt-[-30px] flex-1">
              <ReusableInput
                name="from"
                label="Date From"
                type="date"
                value={filters.from}
                onChange={handleFilterChange}
                className="text-[#476171] text-xs py-2 h-[42px] w-full"
                custclassName="h-[42px]"
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
                custclassName="h-[42px]"
              />
            </div>
          </div>
          <div className="flex flex-col mt-10 md:mt-0 gap-2 min-w-[130px] w-full md:w-auto">
            <NewButton
              onClick={exportToExcel}
              className="w-full md:w-auto"
              children={
                <span className="flex items-center justify-center gap-1 text-sm text-white">
                  <PiExport className="text-white text-lg font-bold" /> Export
                </span>
              }
            />
          </div>
        </div>
        <hr className="mb-3 sm:mb-5 bg-gray-200 border-none h-[1.5px]" />

        {/* Orders Table */}
        <div className="flex-1 min-h-0 flex flex-col">
          {paginatedOrders?.length > 0 ? (
            <>
              <div
                className="overflow-x-auto flex-grow border border-gray-200 rounded-lg"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                <table className="min-w-full w-full text-xs sm:text-sm text-left">
                  <thead className="text-[#7B809A] bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Order #
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Customer
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Phone
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Package
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Breakfast
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Lunch
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Dinner
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Snack AM
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Snack PM
                      </th>
                      <th className="px-2 py-2 sm:py-3 whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[#476171] divide-y divide-gray-200">
                    {paginatedOrders.map((order, i) => (
                      <React.Fragment key={order._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-2 py-2 sm:py-3 whitespace-nowrap">
                            <p className="font-semibold">
                              #{startIndex + i + 1}
                            </p>
                          </td>
                          <td className="px-2 py-2 sm:py-3 font-semibold whitespace-nowrap">
                            {order?.user?.name || "N/A"}
                          </td>
                          <td className="px-2 py-2 sm:py-3 font-semibold whitespace-nowrap">
                            {order?.shippingAddress?.phone || "N/A"}
                          </td>
                          <td className="px-2 py-2 sm:py-3 font-semibold whitespace-nowrap">
                            {order?.items?.[0]?.package?.name || "N/A"}
                          </td>
                          <td className="px-2 py-2 sm:py-3 font-semibold whitespace-nowrap">
                            {getTodaysMealDate(order)}
                          </td>

                          {/* Meal cells */}
                          {[
                            "breakfast",
                            "lunch",
                            "dinner",
                            "snacksAM",
                            "snacksPM",
                          ].map((mealType) => (
                            <td
                              key={mealType}
                              className="px-2 py-2 sm:py-3 font-semibold max-w-[120px] sm:max-w-[250px] truncate text-[#536C7A] cursor-pointer hover:underline whitespace-nowrap"
                            >
                              <span
                                onClick={() => {
                                  handleMealClick(
                                    getTodaysMealName(order, mealType)
                                  ),
                                    handlemeal(order),
                                    gettypemeal(mealType);
                                }}
                              >
                                {getTodaysMealName(order, mealType)
                                  ? "View Name"
                                  : "No Name"}
                              </span>
                            </td>
                          ))}

                          <td className="px-2 py-2 sm:py-3 whitespace-nowrap">
                            <ReusableSelector
                              name="action"
                              custclassNameItems="start-[-95px!important] w-[170px!important]"
                              placeholder="Action"
                              onChange={(e) => {
                                if (e.target.value === "info") {
                                  navigate(
                                    "/Admin/Restaurant_Orders/moreinfo",
                                    {
                                      state: { orderId: order?._id },
                                    }
                                  );
                                } else if (e.target.value === "note") {
                                  navigate(
                                    `/Admin/Restaurant_Orders/add_note`,
                                    {
                                      state: { orderId: order?._id },
                                    }
                                  );
                                } else if (e.target.value === "sticker") {
                                  handleOrder(order);
                                }
                              }}
                              options={[
                                {
                                  value: "note",
                                  label: "Add Note",
                                  icon: "/NoteAdd.png",
                                },
                                {
                                  value: "info",
                                  label: "More Details",
                                  icon: "/Icons.png",
                                },
                                {
                                  value: "sticker",
                                  label: "Get Sticker",
                                  icon: "/sticker.png",
                                },
                              ]}
                              custclassName="rounded-md text-xs w-full min-h-[2px!important] h-[30px!important] flex items-center"
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredOrders.length > pagination.pageSize && (
                <div className="mt-auto bg-white py-3 px-2 sm:px-4 rounded-b-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="text-xs sm:text-sm text-gray-600">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + pagination.pageSize,
                        pagination.totalItems
                      )}{" "}
                      of {pagination.totalItems} orders
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                      <button
                        onClick={() => goToPage(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className={`flex items-center gap-1 cursor-pointer px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
                          pagination.currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-[#476171] hover:bg-gray-100"
                        }`}
                      >
                        <IoIosArrowBack className="text-[#476171]" />
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
                              className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
                                pagination.currentPage === pageNum
                                  ? "bg-[#476171] cursor-pointer text-white"
                                  : "hover:bg-gray-100 cursor-pointer"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => goToPage(pagination.currentPage + 1)}
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
                          pagination.currentPage === pagination.totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-[#476171] hover:bg-gray-100 cursor-pointer"
                        }`}
                      >
                        Next
                        <IoIosArrowForward className="text-[#476171]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-[60vh] flex justify-center items-center text-[#476171] flex-col gap-3 text-lg sm:text-2xl text-center p-4">
              <TbDatabaseExclamation className="text-4xl sm:text-5xl" />
              <p>No Orders Found</p>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Try adjusting your filters or create a new order
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        children={selectedDescription}
        onClose={() => setShowModal(false)}
        open={showModal}
      >
        <h1 className="text-[#476171] text-lg font-semibold mb-4">
          {selectedDescription}
        </h1>
        <NewButton
          onClick={(e) => {
            setShowModal(false);
            setShowModalsticker(true);
          }}
          children={"Get Sticker"}
        >
          {" "}
          Get Sticker{" "}
        </NewButton>
      </Modal>

      <Modal open={showModalsticker} onClose={() => setShowModalsticker(false)}>
        <div className="p-4 text-[#000000] text-sm max-w-full overflow-auto">
          <h2 className="text-lg font-semibold mb-3">Order Details</h2>
          {selectedmeal ? (
            <>
              <div
                ref={cardRef}
                className="relative border-3 min-w-[250px] max-w-[330px] mx-auto border-black flex flex-col gap-2 rounded-md p-5 text-sm overflow-hidden"
              >
                <div
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSmooth: "always",
                    WebkitFontSmoothing: "antialiased",
                  }}
                  className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none"
                >
                  <img
                    src="/logo.png"
                    alt="Watermark"
                    className="w-30 h-27 object-contain"
                  />
                </div>

                <p>
                  <strong>Name :</strong> {selectedmeal?.user?.name || "N/A"}
                </p>
                <p>
                  <strong>Meal :</strong> {selectedDescription || "N/A"}
                </p>
                <p>
                  <strong>Type :</strong> {typeMeal || "N/A"}
                </p>
                <p>
                  <strong>Phone :</strong>{" "}
                  {selectedmeal?.shippingAddress?.phone || "N/A"}
                </p>
                <p>
                  <strong>Address :</strong>{" "}
                  {selectedmeal?.shippingAddress?.address || "N/A"}
                </p>
                <p>
                  <strong>Meal Plan :</strong>{" "}
                  {selectedmeal?.items?.[0]?.package?.name} (
                  {selectedmeal?.items?.[0]?.quantity} week)
                </p>
                <p>
                  <strong>Meal Package :</strong>{" "}
                  {selectedOrder?.items?.[0]?.package?.name} (
                  {selectedOrder?.items?.[0]?.quantity} week)
                </p>
              </div>
              <NewButton
                onClick={downloadPDF}
                className="mt-4 px-4 py-2 mx-auto"
              >
                Download PDF
              </NewButton>
            </>
          ) : (
            <p>No Meal selected.</p>
          )}
        </div>
      </Modal>

      <Modal
        open={showModalorder}
        onClose={() => {
          setShowModalorder(false), setShowModalsticker(false);
        }}
      >
        <div className="p-4 text-[#000000] text-sm max-w-full overflow-auto">
          <h2 className="text-lg font-semibold mb-3">Order Details</h2>
          {selectedOrder ? (
            <>
              <div
                ref={cardRef}
                className="relative border-3 min-w-[250px] max-w-[330px] mx-auto border-black flex flex-col gap-2 rounded-md p-5 text-sm overflow-hidden"
              >
                <div
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSmooth: "always",
                    WebkitFontSmoothing: "antialiased",
                  }}
                  className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none"
                >
                  <img
                    src="/logo.png"
                    alt="Watermark"
                    className="w-30 h-27 object-contain"
                  />
                </div>

                <p>
                  <strong>Name :</strong> {selectedOrder?.user?.name || "N/A"}
                </p>
                <p>
                  <strong>Phone :</strong>{" "}
                  {selectedOrder?.shippingAddress?.phone || "N/A"}
                </p>
                <p>
                  <strong>Address :</strong>{" "}
                  {selectedOrder?.shippingAddress?.address || "N/A"}
                </p>
                <p>
                  <strong>Meal Plan :</strong>{" "}
                  {selectedOrder?.items?.[0]?.package?.name} (
                  {selectedOrder?.items?.[0]?.quantity} week)
                </p>
                <p>
                  <strong>Meal Package :</strong>{" "}
                  {selectedOrder?.items?.[0]?.package?.name} (
                  {selectedOrder?.items?.[0]?.quantity} week)
                </p>
              </div>
              <NewButton
                onClick={downloadPDF}
                className="mt-4 px-4 py-2 mx-auto"
              >
                Download PDF
              </NewButton>
            </>
          ) : (
            <p>No order selected.</p>
          )}
        </div>
      </Modal>
    </>
  );
};
