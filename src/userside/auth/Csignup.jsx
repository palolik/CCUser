/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { base_url } from "../../config/config";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaGlobe,
  FaUserShield,
} from "react-icons/fa";

const CSignUp = () => {
  const loaderEmployee = useLoaderData();
  const [employees, setEmployees] = useState(loaderEmployee || []);
  const navigate = useNavigate();

  const countries = [
    "Bangladesh",
    "United States",
    "United Kingdom",
    "Canada",
    "India",
    "Australia",
  ];

  const accountTypes = ["Personal", "Business", "Agency"];

  const handleAddPost = async (event) => {
    event.preventDefault();
    const form = event.target;

    const postData = {
      rppic:
        "https://p1.hiclipart.com/preview/359/957/100/face-icon-user-profile-user-account-avatar-icon-design-head-silhouette-neck-png-clipart.jpg",
      role: "client",
      rname: form.rname.value.trim(),
      remail: form.remail.value.trim(),
      rphone: form.rphone.value.trim(),
      rpass: form.rpass.value.trim(),
      country: form.country.value.trim(),
      atype: form.atype.value.trim(),
    };

    try {
      const response = await fetch(`${base_url}/addclient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      const data = await response.json();

      if (data.insertedId) {
        Swal.fire({
          title: "Success!",
          text: "Your account has been created successfully.",
          icon: "success",
          confirmButtonText: "Go to Sign In",
        }).then(() => {
          navigate("/clientsignin"); 
        });

        setEmployees([...employees, { ...postData, _id: data.insertedId }]);
        form.reset();
      } else {
        Swal.fire("Error", "Could not register client", "error");
      }
    } catch (error) {
      console.error("Error adding client:", error);
      Swal.fire("Error", "An unexpected error occurred", "error");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl w-full sm:w-[420px] p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create an Account
        </h2>

        <form onSubmit={handleAddPost} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="text"
              name="rname"
              placeholder="Full Name"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="email"
              name="remail"
              placeholder="Email Address"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <FaPhoneAlt className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="tel"
              name="rphone"
              placeholder="Phone Number"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="password"
              name="rpass"
              placeholder="Password"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
           <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="password"
              name="rpass"
              placeholder="Password"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Country Dropdown */}
          <div className="relative">
            <FaGlobe className="absolute left-3 top-3 text-gray-400 text-lg" />
            <select
              name="country"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <FaUserShield className="absolute left-3 top-3 text-gray-400 text-lg" />
            <select
              name="atype"
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Select Account Type</option>
              {accountTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-lg mt-4 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 font-medium"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default CSignUp;
