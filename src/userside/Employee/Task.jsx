/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import CountdownTimer from "./CountdownTimer";
import { useEffect, useState, useContext } from "react";
import { useLoaderData } from "react-router-dom";
import Swal from "sweetalert2";
import Echat from "../chat/empchat";
import { AuthContext } from './../Provider/AuthProvider';
import { base_url } from "../../config/config";
import Placeholder from "./Placeholder";
import LoadingSpinner from "../utils/loaderSpinner";
const Task = () => {
  const { user } = useContext(AuthContext);
const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);  
  const [selectedTaskId, setSelectedTaskId] = useState(null); 
const [expiredTasks, setExpiredTasks] = useState(new Set());



useEffect(() => {
  const employeeId = user?.id || user?._id || user?.userId;

  if (!employeeId) {
    return;
  }

  setLoading(true);

  fetch(`${base_url}/employee/tasks/can-do/${employeeId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);

        if (data.tasks.length > 0) {
          setSelectedTaskId(data.tasks[0]._id);
        }
      } else {
        setTasks([]);
      }
    })
    .catch(error => {
      console.error(error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    })
    .finally(() => {
      setLoading(false);
    });
}, [user]);
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
    confirmButtonColor: "#002141",
    cancelButtonColor: "rgb(255, 71, 71)",
    confirmButtonText: "Request Verification!"
  }).then((result) => {
    if (result.isConfirmed) {
    fetch(`${base_url}/comptask/${_id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
})
  .then(res => {
    if (!res.ok) throw new Error("Failed to complete task");
    return res.json();
  })
  .then(() => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === _id ? { ...task, tstatus: "VerifyTask" } : task
      )
    );
    Swal.fire("Completion Requested!", "Task is enlisted for Verification.", "success")
      .then(() => window.location.reload());
  })
  .catch(() => {
    Swal.fire("Error!", "Failed to complete task.", "error");
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
        Swal.fire("Success", "Feedback Given!", "success").then(() => {
            window.location.reload();
          });
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === _id
              ? { ...task, tstatus: "Completed", trating: postData.trating, tfeedback: postData.tfeedback }
              : task
          )
        );
      } else {
        Swal.fire(
            "Completed!",
            "Task has been marked as completed.",
            "success"
          ).then(() => {
            window.location.reload();
          });
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
          Swal.fire("Accepted!", "Task has been accepted.", "success").then(() => {
            window.location.reload();
          });
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
const handleExpire = (taskId) => {
  setExpiredTasks(prev => new Set(prev).add(taskId));
};


if (loading) {
  return (
    <div className="flex items-center justify-center h-[85vh]">
<LoadingSpinner/>   </div>
  );
}

  return (
    <div >
   {tasks.length === 0 ? (
    <Placeholder/>
) :(   
      
<div className="flex flex-col lg:flex-row gap-2 w-full p-2">
  <div className="flex-1 min-w-0">
    <Echat selectedTaskId={selectedTaskId} />
  </div>

      <div className="lg:w-[400px] w-full lg:h-[85vh] bg-white backdrop-blur-lg  p-2  rounded-md  flex flex-col">
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
                className={`transition-all duration-300 cursor-pointer rounded-md shadow-md hover:shadow-xl border ${
  expiredTasks.has(task._id)
    ? "border-red-300 bg-red-50/60"
    : selectedTaskId === task._id
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
                           onExpire={() => handleExpire(task._id)}
 
/>
                      
                      </div>
                      <div className="flex gap-2">
                                          <button
                      onClick={() => handleTaskComplete(task._id)}
                      disabled={expiredTasks.has(task._id)}
                      className={`flex-1 py-2 rounded-lg transition ${
                        expiredTasks.has(task._id)
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
  Task Completed
</button>

                        {task.tmoretime ? <button
                          disabled
                          className="flex-1 text-blue-500 py-2 border-blue-500 border rounded-lg  bg-white transition cursor-not-allowed">
                          Time Requested
                        </button> : <button
  onClick={() => handleMoretime(task._id)}
  disabled={expiredTasks.has(task._id)}
  className={`flex-1 text-blue-500 py-2 border-blue-500 border rounded-lg transition ${
    expiredTasks.has(task._id)
      ? "opacity-40 cursor-not-allowed"
      : "bg-white hover:text-white hover:bg-blue-600"
  }`}
>
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
    {task.tstatus === "VerifyTask" && (
                   <div>Task is Waiting for verification</div>
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
       </div>
      </div>)}
    </div>
  );

};

export default Task;
