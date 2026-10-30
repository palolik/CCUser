/* eslint-disable react/prop-types */
import CountdownTimer from "../Employee/CountdownTimer";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import Cchat from "../chat/clientchat";
import Cfeedback from "../feedback/Cfeedback";
import { GrCheckboxSelected } from "react-icons/gr";
import { GrCheckbox } from "react-icons/gr";
import { MdChat, MdClose, MdAttachFile, MdAccessTime } from "react-icons/md";
import { TiArrowMinimise } from "react-icons/ti";
import { base_url } from "../../config/config";
import { useNavigate } from "react-router-dom";
import ProfilePacks from "../packages/profilepacks";
import { Shimmer } from "../utils/Shimmer";
import { formatBDT } from "../utils/currency";
import { TimeLeft } from "../utils/TimeLeft";

const statusConfig = {
  pending:   { color: "bg-amber-100 text-amber-700",     label: "Pending" },
  approved:  { color: "bg-blue-100 text-blue-700",       label: "Approved" },
  started:   { color: "bg-green-100 text-green-700",     label: "In Progress" },
  completed: { color: "bg-emerald-100 text-emerald-700", label: "Completed" },
  rejected:  { color: "bg-red-100 text-red-600",         label: "Rejected" },
  cancelled: { color: "bg-gray-100 text-gray-500",       label: "Cancelled" },
};
const statusBadgeOf = (project) => statusConfig[project.status] || { color: "bg-gray-100 text-gray-500", label: project.status };

// Board columns. Clients only watch them; the team moves projects along.
// Approved and Closed only show when something is in them.
const columns = [
  { key: "pending",   title: "Under Review", dot: "bg-amber-500",   statuses: ["pending"] },
  { key: "approved",  title: "Approved",     dot: "bg-blue-500",    statuses: ["approved"], optional: true },
  { key: "started",   title: "In Progress",  dot: "bg-green-600",   statuses: ["started"] },
  { key: "completed", title: "Completed",    dot: "bg-emerald-600", statuses: ["completed"] },
  { key: "closed",    title: "Closed",       dot: "bg-gray-400",    statuses: ["rejected", "cancelled"], optional: true },
];
const columnOf = (project) => columns.find(c => c.statuses.includes(project.status))?.key || "pending";

const titleOf = (project) => (project.orderType === "custom" ? project.packageName : project.projectTitle) || project.packageName || "Project";

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getTargetTime = (project) => {
  const startedAt = new Date(project.startedAt);
  const days = project.orderType === "custom" ? parseFloat(project.deliveryTime) || 0 : Number(project.time) || 0;
  return new Date(startedAt.getTime() + days * 24 * 60 * 60 * 1000);
};

// Price the client still owes, or null when nothing is due.
const amountDue = (project) => {
  if (project.orderType === "custom") return project.pstatus === "notpaid" && project.packagePrice ? parseFloat(project.packagePrice) : null;
  return project.pstatus === "unpaid" ? parseFloat(project.sellPrice) : null;
};

const contentsProgress = (project) => {
  const items = project.packageContents || [];
  const done = items.filter(c => c.isDone).length;
  return { done, total: items.length, percent: items.length ? Math.round((done / items.length) * 100) : 0 };
};

// Only links the browser can open (old orders stored server file paths).
const attachmentLinks = (project) => (project.attachments || []).filter(a => typeof a === "string" && /^https?:\/\//i.test(a));

const statusMessage = (project) => {
  const custom = project.orderType === "custom";
  switch (project.status) {
    case "pending":   return custom ? "⏳ Under review — we'll finalize your package shortly." : "Under review. Takes 10–20 minutes to get started.";
    case "approved":  return "✅ Approved — your custom package is ready to start.";
    case "rejected":  return custom ? "❌ Request rejected. Please contact support." : "Rejected due to incomplete attachments.";
    case "cancelled": return "This order was cancelled.";
    default:          return null;
  }
};

// ── ProjectDetails — the selected project, left side ─────────
const ProjectDetails = ({ project, onChat, onPay, onClose }) => {
  const isCustom = project.orderType === "custom";
  const badge = statusBadgeOf(project);
  const progress = contentsProgress(project);
  const due = amountDue(project);
  const links = attachmentLinks(project);
  const message = statusMessage(project);
  const brief = project.projectBrief || project.description;

  const facts = [
    ["Package",  project.packageName],
    ["Ordered",  formatDate(project.createdAt)],
    ["Started",  project.startedAt ? formatDate(project.startedAt) : "—"],
    ["Delivery", isCustom ? (project.deliveryTime ? `${project.deliveryTime} days` : "—") : (project.time ? `${project.time} days` : "—")],
    ["Price",    isCustom ? formatBDT(project.packagePrice || project.offeringPrice || 0) : formatBDT(project.sellPrice || 0)],
    ["Payment",  project.pstatus === "paid" ? "Paid" : project.paymentStatus || "Not paid"],
  ];

  return (
    <div className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-[720px] max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>{badge.label}</span>
            {isCustom && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Custom</span>}
            <span className="text-[11px] text-gray-400 font-mono">#{project._id.slice(-10)}</span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-gray-800 break-words">{titleOf(project)}</h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onChat(project._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition"
          >
            <MdChat size={15} /> Chat
          </button>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <MdClose size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" style={{ scrollbarWidth: "thin" }}>
        {/* Status */}
        {message && (
          <p className={`text-sm rounded-lg px-3 py-2 ${project.status === "rejected" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"}`}>{message}</p>
        )}
        {project.status === "started" && project.startedAt && (
          <div className="bg-blue-50 rounded-lg p-2 text-center text-gray-700 font-medium">
            <CountdownTimer key={project._id} targetDate={getTargetTime(project)} />
          </div>
        )}
        {project.adminNote && (
          <div className="text-sm bg-blue-50 border border-blue-100 text-blue-800 rounded-lg px-3 py-2">
            <span className="font-semibold">Note from the team: </span>{project.adminNote}
          </div>
        )}

        {/* Pay */}
        {due !== null && (
          <button
            onClick={() => onPay(project)}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150 shadow-sm"
          >
            Pay Now — {formatBDT(due)}
          </button>
        )}

        {/* Facts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
              <p className="text-sm font-semibold text-gray-700 truncate">{value || "—"}</p>
            </div>
          ))}
        </div>

        {/* Deliverables */}
        {progress.total > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Deliverables</p>
              <span className="text-xs font-semibold text-gray-600">{progress.done}/{progress.total} done</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
            <ul className="space-y-1.5">
              {project.packageContents.map((content, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  {content.isDone
                    ? <GrCheckboxSelected className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <GrCheckbox className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  <span className={content.isDone ? "text-gray-500 line-through" : "text-gray-700"}>{content.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Brief */}
        {brief && (
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-1">Project brief</p>
            <div
              className="prose prose-sm max-w-none break-words text-gray-700 bg-gray-50/60 border border-gray-100 rounded-lg px-3 py-2"
              dangerouslySetInnerHTML={{ __html: brief }}
            />
          </div>
        )}

        {/* Attachments */}
        {links.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-1">Attachments</p>
            <div className="flex flex-col gap-1.5">
              {links.map((link) => (
                <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline truncate">
                  <MdAttachFile className="flex-shrink-0" /> {decodeURIComponent(link.split("/").pop())}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {project.status === "completed" && (
          <Cfeedback packageId={project.packageId} orderid={project._id} ctype={isCustom ? "custom" : "regular"} />
        )}
      </div>
    </div>
  );
};

const deliveryDays = (project) => (project.orderType === "custom" ? parseFloat(project.deliveryTime) : Number(project.time)) || 0;

const Cproject = ({ eid }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [openProjectId, setOpenProjectId] = useState(null);
  const [chatIds, setChatIds] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState({});
  // Phones show one column at a time, picked from the status tabs.
  const [mobileColumn, setMobileColumn] = useState(null);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [loading]);

  useEffect(() => {
    fetch(`${base_url}/clientorders/${eid}`)
      .then(res => res.json())
      .then(data => {
        const regularOrders = (data.regularOrders || []).map(p => ({ ...p, orderType: 'regular' }));
        const customOrders = (data.customOrders || []).map(p => ({ ...p, orderType: 'custom' }));
        const merged = [...regularOrders, ...customOrders].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setProjects(merged);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
        Swal.fire("Error", "Failed to load packages.", "error");
      })
      .finally(() => {
        setFetched(true);
        setLoading(false);
      });
  }, [eid]);

  const goToPayment = (project) => {
    const total = amountDue(project);
    navigate('/paymentgateway', {
      state: project.orderType === "custom"
        ? { orderId: project._id, orderType: project.orderType, userId: project.requestedBy?.userId, orderSummary: { subtotal: total, discount: 0, totalPrice: total } }
        : { orderId: project._id, userId: project.buyerid, orderSummary: { subtotal: total, discount: 0, totalPrice: total } },
    });
  };

  // ── Floating chat windows ─────────────────────────────────
  const openChat = (id) => {
    setChatIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    setMinimizedChats(prev => ({ ...prev, [id]: false }));
  };
  const closeChat = (id) => setChatIds(prev => prev.filter(x => x !== id));
  const toggleChat = (id) => setMinimizedChats(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="flex flex-col flex-1 w-full min-w-0 lg:pt-6 lg:pl-6" role="status" aria-label="Loading">
        <div className="bg-white rounded-md p-3 sm:p-4 flex gap-3 overflow-hidden">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex-1 min-w-[220px] bg-gray-100 rounded-md p-2 space-y-2">
              <Shimmer className="h-3 w-1/2 rounded" />
              <Shimmer className="h-24 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fetched && projects.length === 0) {
    return (
      <div className="w-full">
        <ProfilePacks />
      </div>
    );
  }

  const visibleColumns = columns.filter(c => !c.optional || projects.some(p => c.statuses.includes(p.status)));
  const activeMobileColumn = mobileColumn
    || ["started", "pending", "approved", "completed", "closed"].find(key => projects.some(p => columnOf(p) === key))
    || "pending";
  const openProject = projects.find(p => p._id === openProjectId);

  return (
    <div className="flex flex-col flex-1 w-full min-w-0 lg:pt-6 lg:pl-6">
      <div className="bg-white rounded-md p-3 sm:p-4 flex flex-col min-h-[78vh] lg:min-h-0 lg:h-[85vh]">
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <span className="text-xl font-semibold text-gray-800">My Projects</span>
          <span className="text-sm font-medium text-gray-500">{projects.length} order{projects.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Status tabs (phones) */}
        <div className="md:hidden flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {visibleColumns.map(col => {
            const count = projects.filter(p => columnOf(p) === col.key).length;
            const active = activeMobileColumn === col.key;
            return (
              <button
                key={col.key}
                onClick={() => setMobileColumn(col.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  active ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                {col.title}
                <span className={`rounded-full px-1.5 ${active ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 md:overflow-x-auto pb-2 items-stretch flex-1 min-h-0" style={{ scrollbarWidth: "thin" }}>
          {visibleColumns.map(col => {
            const colProjects = projects.filter(p => columnOf(p) === col.key);
            return (
              <div
                key={col.key}
                className={`flex-1 md:min-w-[220px] ${activeMobileColumn === col.key ? "flex" : "hidden"} md:flex flex-col min-h-0 rounded-md p-2 bg-gray-100`}
              >
                <div className="hidden md:flex items-center gap-2 px-1 pb-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{col.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2">{colProjects.length}</span>
                </div>

                <div className="flex flex-col gap-2 flex-1 min-h-[70px] overflow-y-auto pr-0.5" style={{ scrollbarWidth: "thin" }}>
                  {colProjects.map(project => {
                    const isCustom = project.orderType === "custom";
                    const progress = contentsProgress(project);
                    const due = amountDue(project);
                    const days = deliveryDays(project);
                    return (
                      <div
                        key={project._id}
                        onClick={() => setOpenProjectId(project._id)}
                        className="bg-white rounded-md p-3 border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <p className="flex-1 min-w-0 font-semibold text-sm text-gray-800 leading-snug break-words">{titleOf(project)}</p>
                          {isCustom && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">Custom</span>}
                        </div>
                        {col.key === "closed" && (
                          <span className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeOf(project).color}`}>{statusBadgeOf(project).label}</span>
                        )}

                        {/* Time: live countdown once started, otherwise the delivery time */}
                        {project.status === "started" && project.startedAt ? (
                          <div className="mt-2">
                            <TimeLeft targetDate={getTargetTime(project)} totalMs={days * 86400000} expiredLabel="Past delivery date" />
                          </div>
                        ) : days > 0 && col.key !== "completed" && col.key !== "closed" ? (
                          <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <MdAccessTime size={13} /> {days} day{days !== 1 ? "s" : ""} delivery
                          </p>
                        ) : null}

                        {/* Deliverables checklist */}
                        {progress.total > 0 && (
                          <div className="mt-2.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress.percent}%` }} />
                              </div>
                              <span className="text-[11px] text-gray-500">{progress.done}/{progress.total}</span>
                            </div>
                            <ul className="space-y-1">
                              {project.packageContents.map((content, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 text-xs">
                                  {content.isDone
                                    ? <GrCheckboxSelected className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                    : <GrCheckbox className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                                  <span className={content.isDone ? "text-gray-400 line-through" : "text-gray-600"}>{content.name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {due !== null && (
                          <button
                            onClick={(e) => { e.stopPropagation(); goToPayment(project); }}
                            className="mt-2 w-full py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                          >
                            Pay {formatBDT(due)}
                          </button>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-gray-400 font-mono">#{project._id.slice(-6)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); openChat(project._id); }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition"
                          >
                            <MdChat size={13} /> Chat
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {colProjects.length === 0 && (
                    <div className="py-5 text-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-md">
                      No projects in {col.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project details — opened by clicking a card */}
      {openProject && createPortal(
        <div
          onClick={e => e.target === e.currentTarget && setOpenProjectId(null)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1050] p-4"
        >
          <ProjectDetails
            project={openProject}
            onChat={(id) => { openChat(id); setOpenProjectId(null); }}
            onPay={goToPayment}
            onClose={() => setOpenProjectId(null)}
          />
        </div>
      , document.body)}

      {/* Floating chat windows, like the employee profile */}
      <div className="fixed bottom-0 right-2 sm:right-6 z-[60] flex flex-row-reverse items-end gap-2">
        {chatIds.map(id => {
          const project = projects.find(p => p._id === id);
          const minimized = minimizedChats[id];
          return (
            <div key={id} className="flex flex-col rounded-t-xl overflow-hidden shadow-2xl border border-slate-200 bg-white w-[min(380px,calc(100vw-16px))]">
              <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800 cursor-pointer select-none" onClick={() => toggleChat(id)}>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold leading-none truncate max-w-[240px]">{project ? titleOf(project) : "Project chat"}</p>
                  <p className="text-slate-400 text-[10px] mt-1 font-mono">#{id.slice(-6)} · Cloud Company team</p>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => toggleChat(id)} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-600 transition-colors">
                    <TiArrowMinimise size={15} />
                  </button>
                  <button onClick={() => closeChat(id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors">
                    <MdClose size={15} />
                  </button>
                </div>
              </div>
              {!minimized && (
                <div style={{ height: 460 }}>
                  <Cchat selectedProjectId={id} isChatTabActive embedded />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cproject;
