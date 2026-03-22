import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { MdEmail, MdPhone, MdWork, MdAccessTime } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaLayerGroup } from "react-icons/fa";
import { VscGraphLine } from "react-icons/vsc";
import { BsPatchCheckFill } from "react-icons/bs";
import { base_url } from "../../config/config";
import Portfolio from "./portfolio/portfolio";

const Euser = () => {
  const { id } = useParams();
  const [userData, setUserData]       = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [isEditing, setIsEditing]     = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [isOpen, setIsOpen]           = useState(false); // ← mobile collapse
    const [iscOpen, setIscOpen]           = useState(true); // ← mobile collapse

  const [formData, setFormData]       = useState({
    rname: "", remail: "", rphone: "", country: "", password: "", dp: null,
  });

  useEffect(() => {
    fetch(`${base_url}/employeeprofile/${id}`)
      .then(r => r.json())
      .then(data => setUserData(data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (userData) {
      setFormData({
        rname:    userData.rname    || "",
        remail:   userData.remail   || "",
        rphone:   userData.rphone   || "",
        country:  userData.country  || "",
        password: "",
        dp: null,
      });
    }
  }, [userData]);

  useEffect(() => {
    fetch(`${base_url}/comtasks`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTasks(data.filter(t => t.taptr === id));
      })
      .catch(console.error)
      .finally(() => setLoadingTasks(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData(p => ({ ...p, dp: files[0] }));
    else        setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v) form.append(k, v); });
    try {
      const res  = await fetch(`${base_url}/addemployeedp/${id}`, { method: "PUT", body: form });
      const data = await res.json();
      if (data.success) {
        Swal.fire("Success", "Profile updated successfully", "success");
        setUserData(p => ({ ...p, ...data.updatedFields }));
        setIsEditing(false);
      } else {
        Swal.fire("Error", data.message || "Update failed", "error");
      }
    } catch { Swal.fire("Error", "Something went wrong", "error"); }
  };

  if (!userData) return <p>Loading...</p>;

  const totalWorkTime       = tasks.reduce((s, t) => s + parseInt(t.ttime || 0), 0);
  const totalTasksCompleted = tasks.length;
  const totalCC             = tasks.reduce((s, t) => s + parseInt(t.tcc   || 0), 0);

  return (
    <div className="px-4 lg:px-0">
      <div className="w-full lg:w-[400px] lg:mt-2 p-4 lg:h-[85vh] border-b border-gray-100 bg-white rounded-md flex-shrink-0 overflow-hidden transition-all hover:shadow-xl flex flex-col">

        {/* ── Header row — always visible, tapping toggles body on mobile ── */}
        <div
          className="flex flex-row items-center gap-4 cursor-pointer"
          onClick={() => setIsOpen(o => !o)}
        >
          <img
            className="lg:w-20 lg:h-20 h-16 w-16 rounded-full border-2 border-blue-400 object-cover"
            src={userData.rppic || "https://i.ibb.co/g3pyYnm/png-transparent-avatar-boy-man-avatar-vol-1-icon.png"}
            alt={userData.rname}
          />
          <div className="flex flex-col flex-1">
            <p className="text-[18px] font-semibold text-gray-800">{userData.rname}</p>
            <p className="text-sm text-gray-500 font-medium">ID: {id}</p>
          </div>
          {/* edit button — stop propagation so it doesn't toggle collapse */}
          <button
            onClick={e => { e.stopPropagation(); setIsEditing(true); }}
            className="text-gray-500 hover:text-blue-600 transition-colors"
            title="Edit Profile"
          >
            <CiEdit className="text-2xl" />
          </button>
        </div>

        <div className={`${isOpen ? "block" : "hidden"} md:block mt-3 overflow-y-auto `}>

          {/* tabs */}
          <div className="flex border-b border-gray-100 mb-3">
            {["Profile Details", "Portfolio"].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setShowPortfolio(i === 1)}
                className={`px-4 py-2 text-sm font-semibold transition-all ${
                  showPortfolio === (i === 1)
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* portfolio tab */}
          {showPortfolio && <Portfolio userid={userData._id} />}

          {/* profile tab */}
          {!showPortfolio && (
            <div>
              {/* details */}
              <div className="space-y-3 text-gray-700 text-[15px] mb-2">
                {[
                  { icon: <MdEmail      className="text-gray-500" />, label: "Email",          value: userData.remail   },
                  { icon: <MdPhone      className="text-gray-500" />, label: "Phone",          value: userData.rphone   },
                  { icon: <MdWork       className="text-gray-500" />, label: "Specialty",      value: userData.esprts   },
                  { icon: <FaLayerGroup className="text-gray-500" />, label: "Department",     value: userData.rdep     },
                  { icon: <FaLayerGroup className="text-gray-500" />, label: "Sub-department", value: userData.rsubdep  },
                  { icon: <MdAccessTime className="text-gray-500" />, label: "Work Time",      value: `${totalWorkTime} hrs` },
                  { icon: <BsPatchCheckFill className="text-gray-500"/>, label: "Tasks Done",  value: totalTasksCompleted },
                  { icon: <VscGraphLine className="text-gray-500" />, label: "CC Earned",      value: totalCC           },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="flex items-center gap-2 text-gray-600">{icon} {label}</span>
                    <span className="font-medium text-gray-800 break-all text-right">{value || "—"}</span>
                  </div>
                ))}
              </div>

              {/* completed tasks */}
              <p className="text-[17px] font-semibold text-gray-800 mb-2 flex items-center gap-2 border-t border-gray-100 pt-3"     onClick={() => setIscOpen(o => !o)}>
                <VscGraphLine className="text-blue-500" />
                Completed Tasks
                <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">{totalTasksCompleted}</span>
              </p>
              <div className= {`max-h-[220px] ${iscOpen ? "block" : "hidden"}  overflow-y-auto space-y-2 pr-1`} style={{ scrollbarWidth:"thin", scrollbarColor:"#bfdbfe transparent" }}>
                {loadingTasks ? (
                  <p className="text-center text-gray-400 text-sm">Loading…</p>
                ) : tasks.length > 0 ? tasks.map(task => (
                  <div key={task._id} className="flex justify-between items-start bg-white rounded-lg border border-gray-200 py-2 px-3 hover:shadow-md transition-all">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{task.tname}</p>
                      <p className="text-xs text-gray-400">ID: {task._id}</p>
                    </div>
                    <div className="text-right text-sm text-gray-700">
                      <p>{task.ttime} hrs</p>
                      <p className="text-blue-600 font-medium">{task.tcc} CC</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 text-sm">No completed tasks found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-6 w-[95%] max-w-md relative max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Profile</h2>
            <button type="button" onClick={() => setIsEditing(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-lg">✕</button>

            <div className="flex flex-col items-center gap-4">
              <label htmlFor="dp" className="relative group cursor-pointer">
                <img
                  src={formData.dp ? URL.createObjectURL(formData.dp) : userData.rppic || "https://i.ibb.co/g3pyYnm/png-transparent-avatar-boy-man-avatar-vol-1-icon.png"}
                  alt="Preview"
                  className="w-24 h-24 rounded-full border-2 border-blue-400 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-xs font-medium">Change Photo</span>
                </div>
              </label>
              <input id="dp" type="file" name="dp" accept=".png,.jpg,.jpeg" onChange={handleChange} className="hidden" />

              {[
                { label:"Full Name",  name:"rname"    },
                { label:"Email",      name:"remail"   },
                { label:"Phone",      name:"rphone"   },
                { label:"Password",   name:"password" },
                { label:"Country",    name:"country"  },
              ].map(({ label, name }) => (
                <div key={name} className="w-full">
                  <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
                  <input
                    name={name}
                    type={name === "password" ? "password" : name === "remail" ? "email" : "text"}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}

              <button type="submit"
                className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Euser;