import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { MdEmail, MdPhone, MdPublic } from "react-icons/md";
import { RiUserSettingsLine } from "react-icons/ri";
import { FaFileInvoice } from "react-icons/fa";
import Swal from "sweetalert2";
import { base_url } from "../../config/config";
// add to imports
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LoadingSpinner from "../utils/loaderSpinner";

// inside component
const Cuser = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [paidOrders, setPaidOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    rname: "", remail: "", rphone: "", country: "", dp: null,
  });
const navigate = useNavigate();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`${base_url}/clientprofile/${id}`);
        const data = await response.json();
        if (response.ok) {
          setUserData(data);
          setFormData({
            rname: data.rname || "", remail: data.remail || "",
            rphone: data.rphone || "", country: data.country || "", dp: null,
          });
        }
      } catch (error) { console.error("Error:", error); }
    };
    fetchClient();
  }, [id]);

  // Fetch paid orders
  useEffect(() => {
    const fetchPaidOrders = async () => {
      try {
        const res = await fetch(`${base_url}/paidclientorders/${id}`);
        const data = await res.json();
        if (Array.isArray(data)) setPaidOrders(data);
      } catch (err) { console.error("Error fetching paid orders:", err); }
    };
    if (id) fetchPaidOrders();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "dp") setFormData((prev) => ({ ...prev, dp: files[0] }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const form = new FormData();
      form.append("rname", formData.rname);
      form.append("remail", formData.remail);
      form.append("rphone", formData.rphone);
      form.append("country", formData.country);
      if (formData.dp) form.append("dp", formData.dp);

      const res = await fetch(`${base_url}/addclientdp/${id}`, { method: "PUT", body: form });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Success!", "Profile updated successfully!", "success");
        setUserData((prev) => ({
          ...prev, ...formData,
          rppic: formData.dp ? data.dpPath : prev.rppic,
        }));
        setIsEditing(false);
        setFormData((prev) => ({ ...prev, dp: null }));
      } else {
        Swal.fire("Error!", data.message || "Failed to update profile.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Network error. Try again later.", "error");
    }
  };


const generateInvoicePDF = (order) => {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const img = new Image();
  img.src = "/assets/logo.png";
  img.onload = () => {

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageW, pageH, "F");

    // ── Header: logo left, INVOICE right ──
    doc.addImage(img, "PNG", 10, 8, 52, 23);

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("INVOICE", pageW - 12, 20, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`INV-${order._id.slice(-8).toUpperCase()}`, pageW - 12, 27, { align: "right" });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, pageW - 12, 33, { align: "right" });

    // ── Blue accent line under header ──
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 40, pageW, 2, "F");

    // ── Company info row under accent line ──
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("cloudcompany.cc  |  support@cloudcompany.cc", 12, 48);

    // ── Bill To + Order Info boxes ──
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, 54, 85, 38, 3, 3, "F");
    doc.roundedRect(110, 54, 88, 38, 3, 3, "F");

    // Bill To
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("BILL TO", 18, 62);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(order.buyername, 18, 69);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(order.email, 18, 75);

    // Order Info
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("ORDER INFO", 116, 62);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Package:", 116, 69);
    doc.text("Project:", 116, 75);
    doc.text("Status:", 116, 81);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(order.packageName, 135, 69);
    doc.text(order.projectTitle, 135, 75);
    doc.text(order.status.charAt(0).toUpperCase() + order.status.slice(1), 135, 81);

    // Order ID
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Order ID: ${order._id}`, 12, 98);

    // ── Deliverables Table ──
    autoTable(doc, {
      head: [["#", "Deliverable", "Status"]],
      body: order.packageContents?.map((item, i) => [
        i + 1,
        item.name,
        item.isDone ? "Done" : "Pending",
      ]),
      startY: 103,
      theme: "plain",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [30, 41, 59],
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 5,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 32, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const val = data.cell.raw;
          data.cell.styles.textColor =
            val === "Done" ? [5, 150, 105] : [148, 163, 184];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    const y = doc.lastAutoTable.finalY;

    // ── Total box ──
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(pageW - 80, y + 10, 68, 20, 3, 3, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL AMOUNT", pageW - 46, y + 18, { align: "center" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`$${parseFloat(order.sellPrice).toFixed(2)}`, pageW - 46, y + 26, { align: "center" });

    // ── Footer pinned to absolute bottom of page ──
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageH - 20, pageW, 20, "F");

    doc.setFillColor(59, 130, 246);
    doc.rect(0, pageH - 20, pageW, 1.5, "F");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("Thank you for choosing Cloud Company!", pageW / 2, pageH - 11, { align: "center" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      "support@cloudcompany.cc  |  cloudcompany.cc  |  Computer-generated, no signature required.",
      pageW / 2, pageH - 5,
      { align: "center" }
    );

    doc.save(`Invoice-INV-${order._id.slice(-8).toUpperCase()}.pdf`);
  };
};
  if (!userData)
    return (
     <LoadingSpinner/>
    );

  return (
    <div className="px-4 lg:px-0" >
      <div className="w-full lg:w-[400px] lg:mt-6  p-4 max-h-[85vh] border-b border-gray-100  bg-white rounded-md  flex-shrink-0 overflow-hidden transition-all hover:shadow-xl  flex flex-col ">

      
        <div className="flex flex-row items-center gap-4 "   onClick={() => setIsOpen(!isOpen)}>
          <img
            className="lg:w-20 lg:h-20  h-16 w-16 rounded-full border-2 border-blue-400  object-cover"
            src={userData.rppic || "https://i.ibb.co/g3pyYnm/png-transparent-avatar-boy-man-avatar-vol-1-icon.png"}
          />
          <div className="flex flex-col">
            <p className="text-[18px] font-semibold text-gray-800 flex items-center gap-2">
              <RiUserSettingsLine className="text-gray-500" />
              {userData.rname}
            </p>
            <p className="text-sm text-gray-500 font-medium">ID: {id}</p>
          </div>
        </div>

       
        <div className={ ` px-2  ${isOpen ? "block" : "hidden"} md:block`} >
          <div className="flex flex-row items-center justify-between mb-3">
            <p className=" font-semibold tracking-wide m-2">Personal Details</p>
            <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-blue-600 transition-colors duration-200" title="Edit Profile">
              <CiEdit className="text-2xl" />
            </button>
          </div>
          <div className="space-y-3 text-gray-700 text-[15px]">
            {[
              { icon: <RiUserSettingsLine className="text-gray-500" />, label: "Account Type", value: userData.atype },
              { icon: <MdEmail className="text-gray-500" />, label: "Email", value: userData.remail },
              { icon: <MdPhone className="text-gray-500" />, label: "Phone", value: userData.rphone },
              { icon: <MdPublic className="text-gray-500" />, label: "Country", value: userData.country },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex justify-between border-b border-gray-100 pb-2">
                <span className="flex items-center gap-2 text-gray-600">{icon} {label}</span>
                <span className="font-medium text-gray-800 break-all text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

      
        <div className={ ` px-2  ${isOpen ? "block" : "hidden"} md:block`}>
          <p className="text-[17px] font-semibold text-gray-800 mb-3 border-t border-gray-100 pt-3">
            Orders
            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">{paidOrders.length}</span>
          </p>

          {paidOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">No paid orders yet.</p>
          ) : (
<div className="space-y-2 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#bfdbfe transparent' }}>
                {paidOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 hover:border-blue-200 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-700 truncate">{order.projectTitle}</p>
                    <p className="text-[10px] text-gray-400 font-mono truncate">#{order._id.slice(-8)}</p>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">${parseFloat(order.sellPrice).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => generateInvoicePDF(order)}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <FaFileInvoice size={11} />
                    Invoice
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
  

      
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl  p-6 w-[95%] max-w-md relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Profile</h2>
            <button onClick={() => setIsEditing(false)} className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-lg">✕</button>
            <div className="flex flex-col items-center gap-4">
              <label htmlFor="dp" className="relative group cursor-pointer">
                <img
                  src={formData.dp ? URL.createObjectURL(formData.dp) : userData.rppic || "https://i.ibb.co/g3pyYnm/png-transparent-avatar-boy-man-avatar-vol-1-icon.png"}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full border-2 border-blue-400 object-cover  transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-xs font-medium">Change Photo</span>
                </div>
              </label>
              <input id="dp" type="file" name="dp" accept=".png,.jpg,.jpeg" onChange={handleChange} className="hidden" />
              {["rname", "remail", "rphone", "country"].map((field) => (
                <input
                  key={field}
                  type={field === "remail" ? "email" : field === "rphone" ? "tel" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={{ rname: "Full Name", remail: "Email Address", rphone: "Phone Number", country: "Country" }[field]}
                  className="border rounded-lg px-3 w-full py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ))}
              <button onClick={handleSave} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cuser;