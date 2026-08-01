import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base_url } from "../../config/config";
import SeoHead from "../../Seohead";

const ForgotPasswordOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const remail = location.state?.remail;
  const userType = location.state?.userType;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!remail || !userType) {
      setError("Email information missing. Please try again.");
      return;
    }

    if (!otp) {
      setError("Please enter OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${base_url}/forgot-password/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remail,
          userType,
          otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate("/reset-password", {
          state: {
            remail,
            userType,
            resetToken: data.resetToken,
          },
        });
      } else {
        setError(data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <SeoHead title="Verify OTP" noIndex />
      <div className="bg-white shadow-2xl rounded-2xl w-full m-4 sm:w-96 p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
          Verify OTP
        </h2>

        <p className="text-center text-sm text-gray-500 mb-6">
          Enter the OTP sent to <br />
          <span className="font-semibold text-blue-500">{remail}</span>
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6 digit OTP"
            maxLength={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-center text-xl tracking-[6px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition-all disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {error && (
            <p className="text-center text-sm text-red-500 mt-2">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordOtp;