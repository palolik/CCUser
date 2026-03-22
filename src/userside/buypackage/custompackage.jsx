import { useState, useContext, useRef } from "react";
import Swal from "sweetalert2";
import { base_url } from "../../config/config";
import { AuthContext } from "../Provider/AuthProvider";
import RichTextEditor from "../utils/PichTextEditor";

const CustomPackageRequest = () => {
  const { user } = useContext(AuthContext);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = (newFiles) => {
    const filtered = Array.from(newFiles).filter(f => !files.some(ex => ex.name === f.name));
    setFiles(prev => [...prev, ...filtered]);
  };
  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };
  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type === "application/pdf") return "📄";
    if (file.type.includes("word")) return "📝";
    if (file.type.includes("zip") || file.type.includes("rar")) return "🗜️";
    return "📎";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const packageName = form.packageName.value.trim();
    const offeringPrice = form.offeringPrice.value.trim();
    const deliveryDeadline = form.deliveryDeadline.value.trim();
    if (!packageName || !offeringPrice || !deliveryDeadline || !description.trim()) {
      return Swal.fire({ title: "Missing Fields", text: "Please fill in all required fields.", icon: "warning" });
    }
    const data = new FormData();
    data.append("projectTitle", packageName);
    data.append("sellPrice", offeringPrice);
    data.append("projectBrief", description);
    data.append("buyerid", user?.userId);
    data.append("buyername", user?.rname);
    data.append("email", user?.email);
    data.append("bdp", user?.rppic);
    data.append("packageName", packageName);
    data.append("offeringPrice", offeringPrice);
    data.append("deliveryDeadline", deliveryDeadline);
    data.append("description", description);
    data.append("status", "pending");
    data.append("requestedBy", JSON.stringify({ userId: user?.userId, name: user?.rname, email: user?.email, pic: user?.rppic }));
    files.forEach(file => data.append("mainPics", file, file.name));
    setIsSubmitting(true);
    try {
      const response = await fetch(`${base_url}/custom-package-requests`, { method: "POST", body: data });
      const result = await response.json();
      if (result.insertedId) {
        Swal.fire({ title: "Request Submitted!", text: "Our team will review and get back to you shortly.", icon: "success" });
        form.reset();
        setDescription("");
        setFiles([]);
      } else throw new Error();
    } catch {
      Swal.fire({ title: "Error!", text: "Something went wrong. Please try again.", icon: "error" });
    } finally { setIsSubmitting(false); }
  };

  const inputCls = `
    w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900
    outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10
    transition-all bg-white placeholder:text-gray-300
  `;
  const labelCls = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";
  const cardCls  = "bg-white border border-gray-200 rounded-2xl p-5";
  const titleCls = "flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 pb-3 border-b border-gray-100";

  return (
    <div className=" bg-white p-6">

      {/* Header */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Tell us what you need</h1>
        <p className="text-sm text-gray-400 font-light">Describe your project and our team will build the perfect package for you.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── 3-col grid: narrow | wide | narrow ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_700px_240px] gap-4 items-center justify-center">

          {/* ── Col 1: Project info ── */}
          <div className={`${cardCls} flex flex-col gap-4 min-h-[500px]`}>
            <div className={titleCls}>
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8h6M5 5.5h6M5 10.5h4"/>
              </svg>
              Project info
            </div>

            <div>
              <label className={labelCls}>Package name <span className="text-red-400 normal-case">*</span></label>
              <input name="packageName" type="text" placeholder="e.g. Social Media Branding Kit" className={inputCls} required />
            </div>

            <div>
              <label className={labelCls}>Offering price <span className="text-red-400 normal-case">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">$</span>
                <input name="offeringPrice" type="number" min="1" placeholder="150"
                  className={inputCls} style={{ paddingLeft: "22px" }} required />
              </div>
            </div>

            <div>
              <label className={labelCls}>Delivery deadline <span className="text-red-400 normal-case">*</span></label>
              <input name="deliveryDeadline" type="date"
                min={new Date().toISOString().split("T")[0]}
                className={inputCls} required />
            </div>

            {/* Tip */}
            <div className="mt-auto bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5">
              <span className="text-sm flex-shrink-0 mt-0.5">💡</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                Our team will review and finalize the category, deliverables, and pricing. You'll be notified once ready.
              </p>
            </div>
          </div>

          {/* ── Col 2: Description (widest) ── */}
          <div className={`${cardCls} flex flex-col min-h-[500px]`}>
            <div className={titleCls}>
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4h12M2 8h9M2 12h6"/>
              </svg>
              Description
              <span className="ml-auto text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                required
              </span>
            </div>
            <div className="flex-1">
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Tell us everything about what you're looking for — goals, target audience, style preferences, deliverables, examples you like..."
              />
            </div>
          </div>

          {/* ── Col 3: Attachments + Submit ── */}
          <div className="flex flex-col gap-4 min-h-[500px] ">

            {/* Attachments */}
            <div className={cardCls}>
              <div className={titleCls}>
                <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 12h10"/>
                </svg>
                Attachments
                <span className="text-xs text-gray-400 font-normal ml-1">optional</span>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all mb-3 ${
                  isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30"
                }`}
              >
                <svg className="w-6 h-6 mx-auto mb-2 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <p className="text-xs text-gray-500">
                  Drop files or <span className="text-blue-500 font-medium">browse</span>
                </p>
                <p className="text-xs text-gray-300 mt-0.5">Images, PDFs, Word, ZIPs</p>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
              </div>

              {/* File list */}
              {files.length > 0 ? (
                <ul className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {files.map((file, i) => (
                    <li key={i} className="flex items-center gap-2 px-2.5 py-2 border border-gray-100 rounded-xl hover:border-red-100 transition-colors">
                      <span className="text-sm flex-shrink-0">{getFileIcon(file)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                      </div>
                      <button type="button" onClick={() => removeFile(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none flex-shrink-0">
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-300 text-center py-1">No files attached yet</p>
              )}
            </div>

            {/* Submit */}
            <div className={cardCls}>
              


              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
                  text-white text-sm font-medium flex items-center justify-center gap-2
                  transition-all hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed"
                style={{ boxShadow: isSubmitting ? "none" : "0 4px 12px rgba(59,130,246,0.25)" }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit request
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 8h12M9 4l5 4-5 4"/>
                    </svg>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-300 text-center mt-2">Reviewed within 1–2 business days</p>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomPackageRequest;