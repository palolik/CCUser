import { useEffect, useState } from "react";
import { base_url } from "../../../config/config";
import Swal from "sweetalert2";

const Portfolio = ({ userid }) => {
  const [showModal, setShowModal] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    link: "",
    shortDetails: "",
    metaData: "",
    portfolioType: "",
    image: null,
  });

  const fetchPortfolios = async () => {
    try {
      const res = await fetch(`${base_url}/getmyportfolio?userId=${userid}`);
      const data = await res.json();
      if (Array.isArray(data)) setPortfolios(data);
    } catch (err) {
      console.error("Fetch portfolio error:", err);
    }
  };

  useEffect(() => { fetchPortfolios(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.shortDetails || !form.image) {
      alert("Required fields missing");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("link", form.link);
    formData.append("shortDetails", form.shortDetails);
    formData.append("metaData", form.metaData);
    formData.append("portfolioType", form.portfolioType);
    formData.append("image", form.image);
    formData.append("userId", userid);
    formData.append("status", "pending");

    try {
      const res = await fetch(`${base_url}/portfolio`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm({ title: "", link: "", shortDetails: "", metaData: "", portfolioType: "", image: null });
        fetchPortfolios();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${base_url}/delportfolio/${_id}`, { method: "DELETE" })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              Swal.fire("Deleted!", "Portfolio deleted successfully.", "success");
              setPortfolios((prev) => prev.filter((p) => p._id !== _id));
            }
          })
          .catch((error) => console.error("Error deleting portfolio:", error));
      }
    });
  };

 const StatusBadge = ({ status }) => {
  const normalizedStatus = String(status || "pending").toLowerCase();

  const statusConfig = {
    visible: {
      label: "Visible",
      wrapper:
        "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
    },
    show: {
      label: "Visible",
      wrapper:
        "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
    },
    hidden: {
      label: "Hidden",
      wrapper:
        "bg-slate-50 text-slate-600 border border-slate-200",
      dot: "bg-slate-500",
    },
    archived: {
      label: "Archived",
      wrapper:
        "bg-amber-50 text-amber-700 border border-amber-200",
      dot: "bg-amber-500",
    },
    pending: {
      label: "Pending",
      wrapper:
        "bg-blue-50 text-blue-700 border border-blue-200",
      dot: "bg-blue-500",
    },
    rejected: {
      label: "Rejected",
      wrapper:
        "bg-red-50 text-red-600 border border-red-200",
      dot: "bg-red-500",
    },
  };

  const config = statusConfig[normalizedStatus] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${config.wrapper}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full inline-block ${config.dot}`}
      ></span>
      {config.label}
    </span>
  );
};
  return (
    <div className="space-y-4">

      {/* Portfolio Cards */}
      <div className="max-h-[520px] overflow-y-auto pr-1 space-y-3
        scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {portfolios.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm font-medium">No portfolio items yet</p>
            <p className="text-xs mt-1">Click "Upload Portfolio" to add your first work</p>
          </div>
        )}

        {portfolios.map((item) => (
          <div
            key={item._id}
            className="group flex gap-4 p-4 bg-white border border-gray-100 rounded-xl
              hover:border-blue-100 hover:shadow-md transition-all duration-200"
          >
            
            <div className="flex-shrink-0 relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-24 rounded-lg object-cover border border-gray-100"
              />
              {item.portfolioType && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2
                  bg-gray-800 text-white text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                  {item.portfolioType}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate leading-snug">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={item.status} />
                  {item.status === "hidden" && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
                        transition-all duration-200"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {item.metaData && (
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium tracking-wide">
                  {item.metaData}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {item.shortDetails}
              </p>

              <div className="flex items-center  mt-2.5">
                {item.link && item.status  !== "rejected" && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600
                      hover:text-blue-700 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Project
                  </a>
                )}

                {item.status === "rejected" && item.statusNote && (
                  <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50
                    px-2 py-1 rounded-md border border-red-100">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{item.statusNote}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Button */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white
          text-sm font-medium rounded-xl hover:bg-blue-700 active:scale-95
          transition-all duration-200 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Upload Portfolio
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Upload Portfolio</h2>
                <p className="text-xs text-gray-400 mt-0.5">Add a new project to your portfolio</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Portfolio Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. E-commerce Dashboard"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                    transition-all placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Project Link</label>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                    transition-all placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="shortDetails"
                  value={form.shortDetails}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Briefly describe this project..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                    transition-all placeholder:text-gray-300 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meta Data</label>
                  <input
                    name="metaData"
                    value={form.metaData}
                    onChange={handleChange}
                    placeholder="2025 • Web App"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                      transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    name="portfolioType"
                    value={form.portfolioType}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                      transition-all text-gray-600"
                  >
                    <option value="">Select Type</option>
                    <option value="Web Project">Web Project</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Desktop Application">Desktop Application</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Branding">Branding</option>
                    <option value="Paper Writing">Paper Writing</option>
                    <option value="Prototype">Prototype</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cover Image <span className="text-red-400">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-24
                  border-2 border-dashed border-gray-200 rounded-lg cursor-pointer
                  hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                  <svg className="w-6 h-6 text-gray-300 group-hover:text-blue-400 transition-colors mb-1"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                    {form.image ? form.image.name : "Click to upload image"}
                  </span>
                  <input type="file" onChange={handleFile} className="hidden" accept="image/*" />
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200
                  rounded-lg hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                  hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                  active:scale-95 transition-all shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Uploading...
                  </span>
                ) : "Save Portfolio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;