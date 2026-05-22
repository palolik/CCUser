import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthProvider";
import { base_url } from "../../config/config";
import { Eye, EyeOff } from "lucide-react";

const Csignin = () => {
  const [remail, setEmail] = useState("");
  const [rpass, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (event) => {
    event.preventDefault();

    const loginData = { remail, rpass };

    try {
      const response = await fetch(`${base_url}/${activeTab}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        await login(data.token);

        const role = data.user.role?.toLowerCase();
        const id = data.user.id;

        if (role === "client") navigate(`/clientprofile/${id}`);
        else if (role === "marketer") navigate(`/marketerprofile/${id}`);
        else if (role === "emp" || role === "employee")
          navigate(`/employeeprofile/${id}`);
        else navigate(`/profile/${id}`);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    setError("");

    if (!remail) {
      setError("Please enter your email first.");
      return;
    }

    try {
      setForgotLoading(true);

      const response = await fetch(`${base_url}/forgot-password/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remail,
          userType: activeTab,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate("/forgot-password-otp", {
          state: {
            remail,
            userType: activeTab,
          },
        });
      } else {
        setError(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-2xl rounded-2xl w-full m-4 sm:w-96 p-8 transition-transform duration-300 hover:scale-[1.02]">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sign In
        </h2>

      <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
  <button
    type="button"
    onClick={() => setActiveTab("client")}
    style={
      activeTab === "client"
        ? {
            background:
              "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)",
          }
        : {}
    }
    className={`w-1/2 py-2 text-center font-medium transition-all duration-200 ${
      activeTab === "client"
        ? "text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    Client
  </button>

  <button
    type="button"
    onClick={() => setActiveTab("employee")}
    style={
      activeTab === "employee"
        ? {
            background:
              "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)",
          }
        : {}
    }
    className={`w-1/2 py-2 text-center font-medium transition-all duration-200 ${
      activeTab === "employee"
        ? "text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    Employee
  </button>
</div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={remail}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={rpass}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="text-sm text-blue-500 hover:underline disabled:opacity-60"
                
              >
                {forgotLoading ? "Sending OTP..." : "Forgot Password?"}
              </button>
            </div>
          </div>

          <button
            type="submit"
             style={{
    background:
      "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)",
  }} 
            className="w-full  text-white font-semibold py-2 rounded-md mt-4 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition-all"
          >
            Sign In
          </button>

          {error && (
            <p className="text-center text-sm text-red-500 mt-2">{error}</p>
          )}
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          {activeTab === "client" ? (
            <a href="/clientsignup" className="text-blue-500 hover:underline">
              Sign up
            </a>
          ) : (
            <a href="/employeesignup" className="text-blue-500 hover:underline">
              Sign up
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Csignin;