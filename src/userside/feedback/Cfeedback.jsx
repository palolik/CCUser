import { useState, useContext } from "react";
import Swal from "sweetalert2";
import { AuthContext } from "./../Provider/AuthProvider";
import { base_url } from "../../config/config";

const Cfeedback = ({ packageId, orderid, ctype }) => {
  const [rating, setRating] = useState(0);
  const { user } = useContext(AuthContext);

  const handleFeedback = async (event) => {
    event.preventDefault();
    const form = event.target;
    const postData = {
      tfeedback: form.tfeedback.value.trim(),
      rating,
      packageId,
      ctype,       
      orderid,
      cname: user?.rname,
      cdp: user?.rppic,
    };

    try {
      const response = await fetch(`${base_url}/clientfeedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

    if (data.modifiedCount > 0) {
        Swal.fire("Success", "Feedback & Rating Submitted!", "success").then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire("Success", "Feedback Submitted!", "success").then(() => {
          window.location.reload();
        });
      }

      form.reset();
      setRating(0);
    } catch (error) {
      console.error("Error creating feedback:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  };

  return (
    <div className="w-full px-2">
      <div>Please give a feedback</div>
      <form onSubmit={handleFeedback}>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-2xl ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          className="w-full h-48 p-1 border-[1px] border-sky-50 rounded-sm focus:ring-2 focus:ring-blue-200 focus:border-sky-100 focus:outline-none resize-none"
          name="tfeedback"
          placeholder="Provide feedback here..."
          required
        ></textarea>

        <div className="flex flex-row w-full mb-3">
          <button
            type="submit"
            className="btn  w-full text-white hover:bg-blue-700 bg-blue-500 mt-2"
          >
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
};

export default Cfeedback;