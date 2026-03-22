/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import CountdownTimer from "./CountdownTimer";
import { useEffect, useState, useContext } from "react";
import { useLoaderData } from "react-router-dom";
import Swal from "sweetalert2";
import Echat from "../chat/empchat";
import { AuthContext } from './../Provider/AuthProvider';
import { base_url } from "../../config/config";
const Task = ({ userSpecialty }) => {
  const { user } = useContext(AuthContext);

  const loaderTasks = useLoaderData();
  const [tasks, setTasks] = useState([]);  
  const [selectedTaskId, setSelectedTaskId] = useState(null); 

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  useEffect(() => {
    fetch(`${base_url}/tasks`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched tasks:", data);

        if (Array.isArray(data)) {
          const filteredTasks = data.filter(task => task.rdep === userSpecialty);
          setTasks(filteredTasks);
        } else {
          Swal.fire("Error", "Failed to load tasks.", "error");
        }
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
        Swal.fire("Error", "An unexpected error occurred", "error");
      });
  }, [userSpecialty]);
// auto-select first task whenever tasks load
useEffect(() => {
  if (tasks.length > 0 && !selectedTaskId) {
    setSelectedTaskId(tasks[0]._id);
  }
}, [tasks]);
  const handleTaskComplete = (_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, mark as completed!"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${base_url}/comptask/${_id}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
        })
          .then(res => res.json())
          .then(() => {
            setTasks(prevTasks =>
              prevTasks.map(task =>
                task._id === _id ? { ...task, tstatus: "Completed" } : task
              )
            );
            Swal.fire("Completed!", "Task has been marked as completed.", "success");
          });
      }
    });
  };

  const handleFeedback = async (event, _id) => {
    event.preventDefault();
    const form = event.target;

    const postData = {
      tfeedback: form.tfeedback.value.trim(),
    };

    try {
      const response = await fetch(`${base_url}/taskfeedback/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (data.modifiedCount > 0) {
        Swal.fire("Success", "Feedback Given!", "success");
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === _id
              ? { ...task, tstatus: "Completed", trating: postData.trating, tfeedback: postData.tfeedback }
              : task
          )
        );
      } else {
        Swal.fire("Success", "Feedback Given!", "success");
      }
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

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === _id ? { ...task, tmoretime: true } : task
          )
        );
      } else {
        Swal.fire("Info", data.message || "No changes were made.", "info");
      }
    } catch (error) {
      console.error("Error requesting more time:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  };

  const handleAcceptTask = (_id, taptr, apname, apdp) => {
    const currentTime = new Date();
    const task = tasks.find(task => task._id === _id);
    if (!task) {
      Swal.fire("Error", "Task not found!", "error");
      return;
    }



    fetch(`${base_url}/accepttask/${_id}`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taptr,
        apname,
        apdp,
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.modifiedCount > 0 || data.matchedCount > 0 || data.acknowledged) {
          Swal.fire("Accepted!", "Task has been accepted.", "success")
            .then(() => {
              setTasks(prevTasks => prevTasks.map(task =>
                task._id === _id ? { ...task, taptr, tstatus: "Accepted" } : task
              ));
            });
        } else {
          Swal.fire("Accepted!", "Task has been accepted.", "success");
        }
      })
      .catch(error => {
        console.error('Error accepting task:', error);
        Swal.fire("Error", "Something went wrong!", "error");
      });
  };

  const handleTaskClick = (taskId) => {
  setSelectedTaskId(taskId); 
};
  return (
    <div >
   {tasks.length === 0 ? (
  <div className="flex flex-col justify-center items-center h-full">
    <div className="w-full  mx-auto px-4 py-8">

     
      <div className="text-center mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-2">Getting started</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No tasks yet</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Follow these steps to get approved and receive your first task.
        </p>
      </div>

     
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            step: 1,
            title: "Complete your profile",
            desc: "Add your name, phone, country, and a profile photo. A complete profile helps us assign the right tasks to you.",
            tag: "Do this first",
            active: true,
            icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="5" r="3.2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 15c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            step: 2,
            title: "Add 7 portfolio items",
            desc: "Go to the Portfolio tab and upload 7 samples relevant to your department. These are reviewed to evaluate your work quality.",
            note: "Based on your department",
            active: false,
            icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 9h8M5 6h5M5 12h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            step: 3,
            title: "Wait for review",
            desc: "Our team will review your portfolio. This usually takes 1–3 business days. No action needed from your side.",
            active: false,
            icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M9 5.5V9l2.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            step: 4,
            title: "Get your first task",
            desc: "Once your portfolio is accepted, you'll receive an email. Your first task will appear on this page automatically.",
            final: true,
            active: false,
            icon: (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 7.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            ),
          },
        ].map(({ step, title, desc, tag, note, active, final, icon }) => (
          <div
            key={step}
            className={`relative rounded-2xl p-4 flex flex-col gap-3 overflow-hidden
              ${active
                ? "bg-white border-[1.5px] border-blue-200 shadow-sm shadow-blue-50"
                : "bg-gray-50/80 border border-gray-100"
              }`}
          >
            {/* watermark number */}
            <span className={`absolute top-2 right-3 text-5xl font-black leading-none select-none
              ${active ? "text-blue-50" : "text-gray-100"}`}>
              {step}
            </span>

            {/* icon + badge row */}
            <div className="flex items-center justify-between relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border
                ${active
                  ? "bg-blue-50 border-blue-200 text-blue-500"
                  : "bg-white border-gray-200 text-gray-400"
                }`}>
                {icon}
              </div>
              {tag && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  {tag}
                </span>
              )}
              {final && (
                <div className="w-7 h-7 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 7l3 3 6-6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>

            {/* text */}
            <div className="relative z-10">
              <p className={`text-sm font-semibold mb-1 ${active ? "text-gray-800" : "text-gray-600"}`}>
                {title}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>

            {/* note pill */}
            {note && (
              <span className="self-start text-[11px] text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1 relative z-10">
                {note}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-5">
        Questions? Reach out to your team lead or check your email for onboarding details.
      </p>

    </div>
  </div>
) :(   


      
<div className="flex flex-col lg:flex-row gap-4 w-full">
  <div className="flex-1 min-w-0">
    <Echat selectedTaskId={selectedTaskId} />
  </div>

      <div className="lg:w-[400px] w-full lg:h-[85vh] bg-white backdrop-blur-lg  p-2 border border-gray-200 rounded-md shadow-lg flex flex-col">
        <div className="text-xl font-semibold text-gray-800 border-b pb-1 mb-4 flex items-center justify-between">
          <span> My Tasks</span>
          <span className="text-sm font-medium text-gray-500">
            {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
          </span>
        </div>
        <div
          className="flex-1 overflow-y-auto space-y-4 pr-1"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#60a5fa #f9feff",
          }}
        >
          {tasks.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-500 italic">
              <p>No tasks available for you right now</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div
                key={task._id || index}
                onClick={() => handleTaskClick(task._id)}
                className={`transition-all duration-300 cursor-pointer rounded-md shadow-md hover:shadow-xl border ${selectedTaskId === task._id
                    ? "border-blue-400 bg-blue-50/70"
                    : "border-gray-100 bg-white"
                  }`}
              >
                <div className="flex flex-row justify-between items-start p-3 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 truncate">
                      ID: {task._id}
                    </p>
                    <p className="font-semibold text-gray-700 truncate">
                      {task.tname}
                    </p>
                  </div>

                </div>
                <div className="flex flex-row items-end gap-1 p-3 text-sm text-gray-600">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-sm ">
                    ⏱ {task.ttime}h
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-sm">
                    💰 {task.tcc} CC
                  </span>
                </div>
                <div className="px-3 py-2 text-gray-700 text-sm leading-relaxed border-b border-gray-50">
                  {task.tdesc ? (
                    <div
                      className="prose max-w-none  overflow-hidden text-ellipsis whitespace-nowrap hover:whitespace-normal  transition-all duration-200  break-words [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: task.tdesc }}
                    />
                  ) : (
                    <span className="text-gray-400 italic">No details</span>
                  )}
                </div>

                <div className="p-3 flex flex-col gap-2">
                  {task.tstatus === "Accepted" && (
                    <div className="space-y-2">
                      <div className="bg-blue-50 p-2 rounded-lg text-center text-gray-700 font-medium">
                        <CountdownTimer
                          targetDate={
                            new Date(new Date(task.tat).getTime() + Number(task.ttime) * 60 * 60 * 1000)
                          }
                        />

                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTaskComplete(task._id)}
                          className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                        >
                          Task Completed
                        </button>

                        {task.tmoretime ? <button
                          disabled
                          className="flex-1 text-blue-500 py-2 border-blue-500 border rounded-lg  bg-white transition cursor-not-allowed">
                          More Time Requested
                        </button> : <button
                          onClick={() =>
                            handleMoretime(task._id)} className="flex-1 text-blue-500 py-2 border-blue-500 border rounded-lg hover:text-white bg-white  hover:bg-blue-600 transition">
                          Request Time
                        </button>}

                      </div>
                    </div>
                  )}

                  {task.tstatus === "Completed" && (
                    <form
                      onSubmit={(event) => handleFeedback(event, task._id)}
                      className="space-y-2"
                    >
                      <textarea
                        className="w-full h-32 p-2 text-sm border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none resize-none"
                        name="tfeedback"
                        placeholder="Write your feedback here..."
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  )}

                  {task.tstatus === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleAcceptTask(
                            task._id,
                            user?.userId,
                            user?.rname,
                            user?.rppic
                          )
                        }
                        className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                      >
                        Accept
                      </button>
                      <button className="flex-1 text-blue-500 py-2 border-blue-500 border rounded-lg bg-white hover:text-white hover:bg-blue-600 transition">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )
          }
        </div>
      </div></div>)}
    </div>
  );

};

export default Task;
