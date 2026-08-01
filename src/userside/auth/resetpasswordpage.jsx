import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base_url } from "../../config/config";
import SeoHead from "../../Seohead";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const remail = location.state?.remail;
  const userType = location.state?.userType;
  const resetToken = location.state?.resetToken;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!remail || !userType || !resetToken) {
      setError("Reset session expired. Please request OTP again.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${base_url}/forgot-password/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remail,
          userType,
          resetToken,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Password reset successfully.");
        navigate("/signin");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <SeoHead title="Reset Password" noIndex />
      <div className="bg-white shadow-2xl rounded-2xl w-full m-4 sm:w-96 p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition-all disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          {error && (
            <p className="text-center text-sm text-red-500 mt-2">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;