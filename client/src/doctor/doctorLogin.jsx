import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "https://192.168.37.51:5000";

  // Check if doctor is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user?.role === "DOCTOR") {
      navigate("/doc"); // Redirect to doctor dashboard
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!loginData.emailOrPhone || !loginData.password) {
        throw new Error("Please fill in all fields");
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: loginData.emailOrPhone.includes("@")
            ? undefined
            : loginData.emailOrPhone,
          email: loginData.emailOrPhone.includes("@")
            ? loginData.emailOrPhone
            : undefined,
          password: loginData.password,
          role: "DOCTOR",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/doc"); // Redirect to doctor dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Doctor Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Email or Phone Number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500"
              value={loginData.emailOrPhone}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the email or phone number you registered with
            </p>
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500"
              value={loginData.password}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 text-white rounded-lg transition ${
              isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer font-medium"
              onClick={() => navigate("/doctor-signup")}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
