/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import CountdownTimer from "../Employee/CountdownTimer";
import { useEffect, useState, useContext } from "react";
import { useLoaderData } from "react-router-dom";
import Swal from "sweetalert2";
import Cchat from "../chat/clientchat";
import { AuthContext } from './../Provider/AuthProvider';
import Cfeedback from "../feedback/Cfeedback";
import { GrCheckboxSelected } from "react-icons/gr";
import { GrCheckbox } from "react-icons/gr";
import { base_url } from "../../config/config";
import { useNavigate } from "react-router-dom";
import ProfilePacks from "../packages/profilepacks";

const Cproject = ({ eid }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const loaderTasks = useLoaderData();
  const [projects, setProjects] = useState([]);
  const [fetched, setFetched] = useState(false);

  const getTargetTime = (project) => {
    const startedAt = new Date(project.startedAt);
    if (project.orderType === 'custom') {
      const days = parseFloat(project.deliveryTime) || 0;
      return new Date(startedAt.getTime() + days * 24 * 60 * 60 * 1000);
    }
    return new Date(startedAt.getTime() + project.time * 60 * 60 * 1000);
  };

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
        if (merged.length > 0) {
          const latest = merged.reduce((a, b) =>
            new Date(b.createdAt) > new Date(a.createdAt) ? b : a
          );
          setSelectedProjectId(latest._id);
        }
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

  const handleProjectClick = (id) => {
    setSelectedProjectId(id);
  };

  if (fetched && projects.length === 0) {
    return (
      <div className="w-full">
        <ProfilePacks />
      </div>
    );
  }

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  return (
    <div className="w-full flex  flex-col lg:flex-row gap-0 lg:gap-6 p-3 lg:p-6 lg:min-h-[85vh]">

      <div className="flex-1 ">
        <Cchat selectedProjectId={selectedProjectId} />
      </div>
      <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 flex flex-col rounded-md  border border-gray-100 bg-white  overflow-hidden">

        
        <div className="px-5 py-4 border-b border-gray-100 justify-between flex flex-row text-black ">
          <h2 className=" font-semibold tracking-wide">My Projects</h2>
          <p className=" text-xs mt-0.5">{projects.length} order{projects.length !== 1 ? 's' : ''}</p>
        </div>

       
        <div
          className="flex-1 overflow-y-auto divide-y divide-gray-100"
          style={{ overflowAnchor: "none", maxHeight: "calc(85vh - 68px)" }}
        >
          {projects.map((project) => {
            const isCustom = project.orderType === 'custom';
            const isSelected = selectedProjectId === project._id;

            // Status badge config
            const statusConfig = {
              pending:   { color: "bg-amber-100 text-amber-700",   label: "Pending" },
              approved:  { color: "bg-blue-100 text-blue-700",     label: "Approved" },
              started:   { color: "bg-green-100 text-green-700",   label: "In Progress" },
              completed: { color: "bg-emerald-100 text-emerald-700", label: "Completed" },
              rejected:  { color: "bg-red-100 text-red-600",       label: "Rejected" },
              cancelled: { color: "bg-gray-100 text-gray-500",     label: "Cancelled" },
            };
            const statusBadge = statusConfig[project.status] || { color: "bg-gray-100 text-gray-500", label: project.status };

            return (
              <div
                key={project._id}
                onClick={() => handleProjectClick(project._id)}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : "bg-white border-l-4 border-l-transparent hover:bg-gray-50"
                }`}
              >
               
                <div className="flex items-start justify-between px-4 pt-4 pb-2 gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm truncate max-w-[180px] ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                        {isCustom ? project.packageName : project.projectTitle}
                      </p>
                      {isCustom && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-mono truncate">
                      #{project._id.slice(-10)}
                    </p>
                  </div>
                  {/* Status badge */}
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Custom order pricing row */}
                {isCustom && (project.offeringPrice || project.packagePrice) && (
                  <div className="px-4 pb-2 flex items-center gap-4 text-xs text-gray-500">
                    {project.offeringPrice && (
                      <span>Offer: <strong className="text-gray-700">${project.offeringPrice}</strong></span>
                    )}
                    {project.packagePrice && (
                      <span>Final: <strong className="text-blue-600">${project.packagePrice}</strong></span>
                    )}
                    {project.deliveryTime && (
                      <span>⏱ <strong className="text-gray-700">{project.deliveryTime}d</strong></span>
                    )}
                  </div>
                )}

                {/* Package contents checklist */}
                {project.packageContents && project.packageContents.length > 0 && (
                  <ul className="px-4 pb-2 space-y-1">
                    {project.packageContents.map((content, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs">
                        {content.isDone ? (
                          <GrCheckboxSelected className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        ) : (
                          <GrCheckbox className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={content.isDone ? "text-gray-600 line-through" : "text-gray-400"}>
                          {content.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Status body */}
                <div className="px-4 pb-3">
                  {isCustom ? (
                    <>
                      {project.status === "pending" && (
                        <p className="text-amber-600 text-xs">⏳ Under review — we'll finalize your package shortly.</p>
                      )}
                      {project.status === "approved" && (
                        <p className="text-blue-600 text-xs">✅ Approved — your custom package is ready to start.</p>
                      )}
                      {project.status === "started" && (
                        <CountdownTimer targetDate={getTargetTime(project)} />
                      )}
                      {project.status === "completed" && (
                        <Cfeedback packageId={project.packageId} orderid={project._id} ctype='custom' />
                      )}
                      {project.status === "rejected" && (
                        <p className="text-red-500 text-xs">❌ Request rejected. Please contact support.</p>
                      )}
                      {project.status === "cancelled" && (
                        <p className="text-gray-400 text-xs font-medium">Cancelled</p>
                      )}
                    </>
                  ) : (
                    <>
                      {project.status === "pending" && (
                        <p className="text-gray-500 text-xs">Under review. Takes 10–20 minutes to get started.</p>
                      )}
                      {project.status === "started" && (
                        <CountdownTimer targetDate={getTargetTime(project)} />
                      )}
                      {project.status === "completed" && (
                        <Cfeedback packageId={project.packageId} orderid={project._id} ctype='regular' />
                      )}
                      {project.status === "rejected" && (
                        <p className="text-red-500 text-xs">Rejected due to incomplete attachments.</p>
                      )}
                      {project.status === "cancelled" && (
                        <p className="text-gray-400 text-xs font-medium">Cancelled</p>
                      )}
                    </>
                  )}
                </div>

              
                {isCustom && project.pstatus === "notpaid" && project.packagePrice && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/paymentgateway', {
                          state: {
                            orderId: project._id,
                            orderType: project.orderType,
                            userId: project.requestedBy.userId,
                            orderSummary: {
                              subtotal: parseFloat(project.packagePrice),
                              discount: 0,
                              totalPrice: parseFloat(project.packagePrice),
                            },
                          },
                        });
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150 shadow-sm"
                    >
                      Pay Now — ${project.packagePrice}
                    </button>
                  </div>
                )}

                {!isCustom && project.pstatus === "unpaid" && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/paymentgateway', {
                          state: {
                            orderId: project._id,
                            userId: project.buyerid,
                            orderSummary: {
                              subtotal: parseFloat(project.sellPrice),
                              discount: 0,
                              totalPrice: parseFloat(project.sellPrice),
                            },
                          },
                        });
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150 shadow-sm"
                    >
                      Pay Now — ${project.sellPrice}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Cproject;