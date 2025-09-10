import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import ReusableInput from '../../ui/ReuseInput';
import Modal from '../../ui/Modal';
import Loaderstart from '../../ui/loading/Loaderstart';
import { TbDatabaseExclamation } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Templete = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [Templetes, setTempletes] = useState([]);
  const [TempleteId, setTempletesId] = useState(null);
  const [AllTempletes, setAllTempletes] = useState([]);
  const [plane, setPlane] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const BaseUrl = import.meta.env.VITE_API_BASE_URL;

  const getTempletes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BaseUrl}/template`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.status === 200) {
        console.log(res.data.data.templates);
        setTempletes(res.data.data.templates);
        setAllTempletes(res.data.data.templates);
      }
    } catch (err) {
      console.error("Error fetching templetes:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanes = async () => {
    try {
      setLoading(true);
      const planes = await axios.get(`${BaseUrl}/plans`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (planes.status === 200) {
        console.log(planes.data.data.plans);
        setPlane(planes.data.data.plans);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTempletes();
    // getPlanes();
  }, []);

  const filters = {
    TempleteName: '',
    from: '',
    to: '',
  };
  const [filter, setFilter] = useState(filters);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = () => {
    const filtered = AllTempletes.filter((tpl) => {
      const isNameMatch = filter.TempleteName
        ? tpl?.name?.toLowerCase().includes(filter.TempleteName.toLowerCase())
        : true;

      const isFromDateMatch = filter.from
        ? new Date(tpl.startDate) >= new Date(filter.from)
        : true;

      const isToDateMatch = filter.to
        ? new Date(tpl.startDate) <= new Date(filter.to)
        : true;

      return isNameMatch && isFromDateMatch && isToDateMatch;
    });

    setTempletes(filtered);
  };

  useEffect(() => {
    handleFilterSubmit();
  }, [filter]);

  // delete
  const deleteTemplete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${BaseUrl}/template/templates/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      toast.success('Templete Deleted Successfully');
      setTempletesId("");
      setModal(false);

      const newTempletes = Templetes?.filter((t) => t._id !== id);
      setTempletes(newTempletes);
    } catch (err) {
      setModal(false);
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loaderstart />}
      <div className="shadow-sm rounded-xl w-full bg-white h-full md:min-h-[calc(100vh-77px)] p-4 flex flex-col">
        {/* Filter Section */}
        <div className="flex flex-col  lg:flex-row justify-between items-stretch lg:items-end gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-full">
            <ReusableInput
              name="TempleteName"
              label="Templete Name"
              placeholder="Enter T. Name"
              className="w-full"
              onChange={handleFilterChange}
              value={filter.TempleteName}
            />
            <ReusableInput
              name="from"
              label="Date From"
              type="date"
              className="w-full"
              onChange={handleFilterChange}
              value={filter.from}
            />
            <ReusableInput
              name="to"
              label="To"
              type="date"
              onChange={handleFilterChange}
              className="w-full"
              value={filter.to}
            />
            <div className="flex  !items-end">
              <button
                onClick={() => {
                  navigate('/Admin/Templates/Add', {
                    state: {}
                  });
                }}
                className="bg-[#476171] cursor-pointer text-white hover:bg-[#476171] flex items-center justify-center gap-2 py-[8px] px-5 !mb-[1px] rounded-lg w-full h-max"
              >
                <span className="hidden sm:inline">Add New</span>
                <MdAdd className="text-xl" />
              </button>
            </div>
          </div>
        </div>
        <hr className="border-none block h-[1.5px] mb-5 bg-gray-200" />
        {/* Table */}
        {Templetes?.length > 0 ? (
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-100 text-[#7B809A]">
                  <th className="p-2 lg:p-3">Templete Name</th>
                  <th className="p-2 lg:p-3 hidden sm:table-cell">Start Date</th>
                  <th className="p-2 lg:p-3 hidden md:table-cell">Num Of Meal</th>
                  <th className="p-2 lg:p-3">Breakfast</th>
                  <th className="p-2 lg:p-3 hidden lg:table-cell">Snack AM</th>
                  <th className="p-2 lg:p-3 hidden lg:table-cell">Snack PM</th>
                  <th className="p-2 lg:p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {

                  Templetes.map((tpl, index) => (
                    <tr key={index} className="border-b border-b-gray-300 text-[#344767]">
                      <td className="p-2 lg:p-3 font-medium">{tpl?.name}</td>
                      <td className="p-2 lg:p-3 hidden sm:table-cell">{new Date(tpl?.startDate).toLocaleDateString()}</td>
                      <td className="p-2 lg:p-3 hidden md:table-cell">{"" || '5'}</td>
                      <td className="p-2 lg:p-3">{tpl?.breakfastOptionsCount}</td>
                      <td className="p-2 lg:p-3 hidden lg:table-cell">{tpl?.snacksAMOptionsCount}</td>
                      <td className="p-2 lg:p-3 hidden lg:table-cell">{tpl?.snacksPMOptionsCount}</td>
                      <td className="p-2 lg:p-3">
                        <div className="flex items-center justify-start gap-1">
                          <button
                            onClick={() => {
                              navigate('/Admin/Templates/Edit', {
                                state: { TempleteId: tpl?._id || tpl.id }
                              });
                            }}
                            className="p-1 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                            aria-label="Edit template"
                          >
                            <img alt="Edit" srcSet="/edit.png" className='w-4 h-4 md:w-4 md:h-4' />
                          </button>
                          <button
                            onClick={() => { setModal(true); setTempletesId(tpl?._id) }}
                            className="p-1 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                            aria-label="Delete template"
                          >
                            <img alt="Delete" srcSet="/Delete.png" className='w-4 h-4 md:w-5 md:h-5' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[60vh] flex justify-center items-center text-[#476171] flex-col gap-3 text-lg sm:text-2xl text-center p-4">
            <TbDatabaseExclamation className="text-4xl sm:text-5xl" />
            <p>No templetes Found</p>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              Try adjusting your filters or create a new templete
            </p>
          </div>
        )}
        {modal &&
          <Modal
            onClose={() => setModal(false)}
            onConfirm={() => deleteTemplete(TempleteId)}
            cancelText='No'
            open={modal}
            showActions
          >
            {"Are You Sure Delete This Template?"}
          </Modal>
        }
      </div>
    </>
  );
};

export default Templete;