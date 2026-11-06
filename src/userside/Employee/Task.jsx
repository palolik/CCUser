/* eslint-disable react/prop-types */
import CountdownTimer from "./CountdownTimer";
import { useEffect, useState, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import { MdChat, MdClose } from "react-icons/md";
import { TimeLeft, TimeUp } from "../utils/TimeLeft";
import { TiArrowMinimise } from "react-icons/ti";
import Swal from "sweetalert2";
import Echat from "../chat/empchat";
import { AuthContext } from './../Provider/AuthProvider';
import { base_url } from "../../config/config";
import Placeholder from "./Placeholder";
import { Shimmer, ShimmerList } from "../utils/Shimmer";

// Board columns, left to right. Done tasks (feedback given) aren't returned
// by the API, so they drop off the board.
const columns = [
  { status: "pending",    title: "To Do",       dot: "bg-orange-500" },
  { status: "Accepted",   title: "In Progress", dot: "bg-blue-600" },
  { status: "VerifyTask", title: "In Review",   dot: "bg-purple-600" },
  { status: "Completed",  title: "Completed",   dot: "bg-green-600" },
];

// What an employee can do by dragging: accept a task, or submit it for review.
const allowedMoves = {
  pending: "Accepted",
  Accepted: "VerifyTask",
};

const statusPill = {
  pending:    "bg-orange-50 text-orange-700 border-orange-200",
  Accepted:   "bg-blue-50 text-blue-700 border-blue-200",
  VerifyTask: "bg-purple-50 text-purple-700 border-purple-200",
  Completed:  "bg-green-50 text-green-700 border-green-200",
};

const deadlineOf = (task) => new Date(new Date(task.tat).getTime() + Number(task.ttime) * 60 * 60 * 1000);

const Task = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [chatTaskIds, setChatTaskIds] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [expiredTasks, setExpiredTasks] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  // Phones show one column at a time, picked from the status tabs.
  const [mobileStatus, setMobileStatus] = useState(null);

  const employeeId = user?.id || user?._id || user?.userId;

  const fetchTasks = ({ initial = false } = {}) => {
    if (!employeeId) return;
    if (initial) setLoading(true); else setRefreshing(true);

    fetch(`${base_url}/employee/tasks/can-do/${employeeId}`)
      .then(res => res.json())
      .then(data => {
        const list = data.success && Array.isArray(data.tasks) ? data.tasks : [];
        setTasks(list);
      })
      .catch(error => {
        console.error(error);
        Swal.fire("Error", "Failed to load tasks", "error");
      })
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => {
    fetchTasks({ initial: true });
  }, [user]);

  // Unread messages from the admin, per task, for the Chat badges.
  const tasksRef = useRef([]);
  tasksRef.current = tasks;
  const chatTaskIdsRef = useRef([]);
  chatTaskIdsRef.current = chatTaskIds;

  const loadUnreadCounts = async () => {
    const results = await Promise.all(tasksRef.current.map(async (task) => {
      try {
        const r = await fetch(`${base_url}/empchat/${task._id}`);
        if (!r.ok) return [task._id, 0];
        const msgs = await r.json();
        return [task._id, Array.isArray(msgs) ? msgs.filter(m => m.sender === "manager" && !m.read).length : 0];
      } catch {
        return [task._id, 0];
      }
    }));
    // Open chat windows mark their messages read themselves.
    setUnreadCounts(Object.fromEntries(results.map(([id, n]) => [id, chatTaskIdsRef.current.includes(id) ? 0 : n])));
  };

  useEffect(() => {
    if (!tasks.length) return;
    loadUnreadCounts();
    const interval = setInterval(loadUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, [tasks.length]);

  // ── Floating chat windows ─────────────────────────────────
  const openChat = (taskId) => {
    setChatTaskIds(prev => (prev.includes(taskId) ? prev : [...prev, taskId]));
    setMinimizedChats(prev => ({ ...prev, [taskId]: false }));
    setUnreadCounts(prev => ({ ...prev, [taskId]: 0 }));
  };
  const closeChat = (taskId) => setChatTaskIds(prev => prev.filter(id => id !== taskId));
  const toggleChat = (taskId) => setMinimizedChats(prev => ({ ...prev, [taskId]: !prev[taskId] }));

  const isExpired = (task) => expiredTasks.has(task._id) || task.timeranout === true;

  // ── Task actions ──────────────────────────────────────────
  const handleAcceptTask = async (_id) => {
    try {
      const res = await fetch(`${base_url}/accepttask/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taptr: employeeId, apname: user?.rname, apdp: user?.rppic }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not accept task");
      setTasks(prev => prev.map(t => t._id === _id ? { ...t, tstatus: "Accepted", tat: new Date().toISOString() } : t));
      Swal.fire("Accepted!", "Task accepted, the timer has started.", "success");
      fetchTasks();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleTaskComplete = (_id) => {
    Swal.fire({
      title: "Submit for review?",
      text: "The task goes to the admin for verification.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#002141",
      cancelButtonColor: "rgb(255, 71, 71)",
      confirmButtonText: "Request Verification!"
    }).then((result) => {
      if (!result.isConfirmed) return;
      fetch(`${base_url}/comptask/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to complete task");
          return res.json();
        })
        .then(() => {
          setTasks(prev => prev.map(t => t._id === _id ? { ...t, tstatus: "VerifyTask" } : t));
          Swal.fire("Completion Requested!", "Task is enlisted for Verification.", "success");
          fetchTasks();
        })
        .catch(() => Swal.fire("Error!", "Failed to complete task.", "error"));
    });
  };

  const handleFeedback = async (event, _id) => {
    event.preventDefault();
    const tfeedback = event.target.tfeedback.value.trim();

    try {
      const response = await fetch(`${base_url}/taskfeedback/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tfeedback }),
      });
      if (!response.ok) throw new Error();
      Swal.fire("Success", "Feedback given, task closed!", "success");
      fetchTasks();
    } catch (error) {
      console.error("Error updating feedback:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  };

  const handleMoretime = async (_id) => {
    try {
      const response = await fetch(`${base_url}/moretime/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmoretime: true }),
      });
      const data = await response.json();

      if (response.ok && data.modifiedCount > 0) {
        Swal.fire("Success", "Requested more time successfully!", "success");
        setTasks(prev => prev.map(t => t._id === _id ? { ...t, tmoretime: true } : t));
      } else {
        Swal.fire("Info", data.message || "No changes were made.", "info");
      }
    } catch (error) {
      console.error("Error requesting more time:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  };

  const handleExpire = (taskId) => {
    if (expiredTasks.has(taskId)) return;
    setExpiredTasks(prev => new Set(prev).add(taskId));
    fetch(`${base_url}/timeranout/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    }).catch(err => console.error("Failed to mark time ran out:", err));
  };

  // ── Drag & drop ───────────────────────────────────────────
  const draggingTask = tasks.find(t => t._id === draggingId);
  const canDropOn = (status) => draggingTask && allowedMoves[draggingTask.tstatus] === status;

  const handleDragEnd = () => { setDraggingId(null); setDragOverStatus(null); };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const task = tasks.find(t => t._id === (e.dataTransfer.getData("text/plain") || draggingId));
    handleDragEnd();
    if (!task || task.tstatus === status) return;

    if (allowedMoves[task.tstatus] !== status) {
      Swal.fire("Can't move there", "Drag a task from To Do to In Progress to accept it, or from In Progress to In Review to submit it.", "info");
      return;
    }
    if (status === "Accepted") handleAcceptTask(task._id);
    if (status === "VerifyTask") {
      if (isExpired(task)) {
        Swal.fire("Time ran out", "Ask the admin for more time before submitting.", "info");
        return;
      }
      handleTaskComplete(task._id);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 flex-1 w-full min-w-0 lg:pt-2 lg:pl-3" role="status" aria-label="Loading">
        <div className="bg-white rounded-md p-3 flex gap-3 overflow-hidden">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex-1 min-w-[220px] bg-gray-100 rounded-md p-2 space-y-2">
              <Shimmer className="h-3 w-1/2 rounded" />
              <Shimmer className="h-20 w-full rounded" />
            </div>
          ))}
        </div>
        <div className="h-[60vh] bg-white rounded-sm border border-gray-50 p-4">
          <ShimmerList rows={6} />
        </div>
      </div>
    );
  }

  if (tasks.length === 0) return <Placeholder />;

  const openTask = tasks.find(t => t._id === openTaskId);
  // Default tab: the first column with something in it, In Progress first.
  const activeMobileStatus = mobileStatus
    || ["Accepted", "pending", "VerifyTask", "Completed"].find(st => tasks.some(t => t.tstatus === st))
    || "pending";

  return (
    <div className="flex flex-col gap-3 flex-1 w-full min-w-0 lg:pt-2 lg:pl-3">
      {/* Board */}
      <div className="bg-white rounded-md p-3 sm:p-4 flex flex-col min-h-[78vh] lg:min-h-0 lg:h-[85vh]">
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <span className="text-xl font-semibold text-gray-800">My Tasks</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">
              {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
            </span>
            <button
              onClick={() => fetchTasks()}
              className="p-1 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-blue-500"
              title="Refresh tasks"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status tabs (phones) */}
        <div className="md:hidden flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {columns.map(col => {
            const count = tasks.filter(t => t.tstatus === col.status).length;
            const active = activeMobileStatus === col.status;
            return (
              <button
                key={col.status}
                onClick={() => setMobileStatus(col.status)}
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
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.tstatus === col.status);
            const droppable = canDropOn(col.status);
            return (
              <div
                key={col.status}
                onDragOver={e => { e.preventDefault(); if (dragOverStatus !== col.status) setDragOverStatus(col.status); }}
                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverStatus(null); }}
                onDrop={e => handleDrop(e, col.status)}
                className={`flex-1 md:min-w-[220px] ${activeMobileStatus === col.status ? "flex" : "hidden"} md:flex flex-col min-h-0 rounded-md p-2 border-2 transition-colors ${
                  droppable && dragOverStatus === col.status
                    ? "bg-blue-100 border-blue-500"
                    : droppable
                    ? "bg-blue-50 border-dashed border-blue-300"
                    : "bg-gray-100 border-transparent"
                }`}
              >
                <div className="hidden md:flex items-center gap-2 px-1 pb-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{col.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2">{colTasks.length}</span>
                </div>

                <div className="flex flex-col gap-2 flex-1 min-h-[70px] overflow-y-auto pr-0.5" style={{ scrollbarWidth: "thin" }}>
                  {colTasks.map(task => (
                    <div
                      key={task._id}
                      draggable={Boolean(allowedMoves[task.tstatus])}
                      onDragStart={e => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", task._id); setDraggingId(task._id); }}
                      onDragEnd={handleDragEnd}
                      onClick={() => setOpenTaskId(task._id)}
                      className={`bg-white rounded-md p-3 border shadow-sm hover:shadow-md transition ${
                        allowedMoves[task.tstatus] ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                      } ${
                        isExpired(task) ? "border-red-300" : "border-gray-200"
                      } ${draggingId === task._id ? "opacity-40" : ""}`}
                    >
                      <p className="font-semibold text-sm text-gray-800 leading-snug break-words">{task.tname}</p>
                      <div className="flex flex-wrap gap-1 mt-2 text-xs">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-sm">⏱ {task.ttime}h</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-sm">💰 {task.tcc} CC</span>
                        {task.tmoretime && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-sm">Time requested</span>}
                      </div>
                      {task.tstatus === "Accepted" && task.tat && task.tat !== "NA" && (
                        <div className="mt-2 text-xs">
                          {task.timeranout
                            ? <TimeUp />
                            : <TimeLeft targetDate={deadlineOf(task)} totalMs={Number(task.ttime) * 3600000} onExpire={() => handleExpire(task._id)} />}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-gray-400 font-mono">#{task._id?.slice(-6)}</span>
                        <button
                          onClick={e => { e.stopPropagation(); openChat(task._id); }}
                          className="relative flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition"
                        >
                          <MdChat size={13} /> Chat
                          {unreadCounts[task._id] > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[16px] text-center">
                              {unreadCounts[task._id]}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="py-5 text-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-md">
                      {droppable ? "Drop here" : `No tasks in ${col.title}`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task details — opened by clicking a card */}
      {openTask && createPortal(
        <div
          onClick={e => e.target === e.currentTarget && setOpenTaskId(null)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1050] p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusPill[openTask.tstatus] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {columns.find(c => c.status === openTask.tstatus)?.title || openTask.tstatus}
                  </span>
                  <span className="text-xs text-gray-400 font-mono truncate">{openTask._id}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 leading-snug break-words">{openTask.tname}</h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { openChat(openTask._id); setOpenTaskId(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition"
                >
                  <MdChat size={14} /> Chat
                </button>
                <button onClick={() => setOpenTaskId(null)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                  <MdClose size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-wrap gap-1 text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-sm">⏱ {openTask.ttime}h</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-sm">💰 {openTask.tcc} CC</span>
                  {openTask.rdep && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-sm">{openTask.rdep}{openTask.rsubdep ? ` · ${openTask.rsubdep}` : ""}</span>}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-1">Description</p>
                  {openTask.tdesc ? (
                    <div
                      className="prose prose-sm max-w-none break-words text-gray-700 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: openTask.tdesc }}
                    />
                  ) : (
                    <span className="text-gray-400 italic text-sm">No details</span>
                  )}
                </div>

                {openTask.tstatus === "pending" && (
                  <button
                    onClick={() => handleAcceptTask(openTask._id)}
                    className="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                  >
                    Accept Task
                  </button>
                )}

                {openTask.tstatus === "Accepted" && (
                  <div className="space-y-2">
                    {openTask.tat && openTask.tat !== "NA" && (
                      <div className="bg-blue-50 p-2 rounded-lg text-center text-gray-700 font-medium">
                        <CountdownTimer key={openTask._id} targetDate={deadlineOf(openTask)} />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTaskComplete(openTask._id)}
                        disabled={isExpired(openTask)}
                        className={`flex-1 py-2 rounded-lg transition ${
                          isExpired(openTask)
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        Task Completed
                      </button>
                      {openTask.tmoretime ? (
                        <button disabled className="flex-1 text-blue-500 py-2 border-blue-500 border rounded-lg bg-white transition cursor-not-allowed">
                          Time Requested
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMoretime(openTask._id)}
                          className="flex-1 text-blue-500 py-2 border-blue-500 border rounded-lg transition bg-white hover:text-white hover:bg-blue-600"
                        >
                          Request Time
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {openTask.tstatus === "VerifyTask" && (
                  <div className="text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg p-3">
                    Waiting for the admin to verify this task.
                  </div>
                )}

                {openTask.tstatus === "Completed" && (
                  <form key={openTask._id} onSubmit={(event) => handleFeedback(event, openTask._id)} className="space-y-2">
                    <p className="text-sm text-green-700">Approved! Leave feedback to close the task.</p>
                    <textarea
                      className="w-full h-28 p-2 text-sm border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none resize-none"
                      name="tfeedback"
                      placeholder="Write your feedback here..."
                      required
                    />
                    <button type="submit" className="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">
                      Submit Feedback
                    </button>
                  </form>
                )}
            </div>
          </div>
        </div>
      , document.body)}

      {/* Floating chat windows, like the admin panel */}
      <div className="fixed bottom-0 right-2 sm:right-6 z-[60] flex flex-row-reverse items-end gap-2">
        {chatTaskIds.map(taskId => {
          const task = tasks.find(t => t._id === taskId);
          const minimized = minimizedChats[taskId];
          return (
            <div key={taskId} className="flex flex-col rounded-t-xl overflow-hidden shadow-2xl border border-slate-200 bg-white w-[min(380px,calc(100vw-16px))]">
              <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800 cursor-pointer select-none" onClick={() => toggleChat(taskId)}>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold leading-none truncate max-w-[240px]">{task?.tname || "Task chat"}</p>
                  <p className="text-slate-400 text-[10px] mt-1 font-mono">#{taskId.slice(-6)} · Admin</p>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => toggleChat(taskId)} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-600 transition-colors">
                    <TiArrowMinimise size={15} />
                  </button>
                  <button onClick={() => closeChat(taskId)} className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors">
                    <MdClose size={15} />
                  </button>
                </div>
              </div>
              {!minimized && (
                <div style={{ height: 460 }}>
                  <Echat selectedTaskId={taskId} embedded className="h-full w-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Task;
