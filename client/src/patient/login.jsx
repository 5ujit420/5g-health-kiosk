import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lang from "../assets/Vector.png";
import user from "../assets/user.png";
import miniuser from "../assets/mingcute_user-2-fill.png";
import pass from "../assets/mdi_password.png";
import back from "../assets/mdi_arrow-back-circle.png";

export default function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      navigate("/home");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const isPhoneNumber = /^\d+$/.test(loginData.identifier);
      const isEmail = loginData.identifier.includes("@");

      let loginPayload = { password: loginData.password };
      if (isPhoneNumber) loginPayload.phoneNumber = loginData.identifier;
      else if (isEmail) loginPayload.email = loginData.identifier;
      else loginPayload.username = loginData.identifier;

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="w-full max-w-xl p-12 rounded-xl bg-[#00999524] backdrop-blur-sm border border-white/30 shadow-2xl flex flex-col items-center min-h-[600px] justify-center">
        <img src={user} alt="user" className="w-32 h-32 mb-8" />
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-8 max-w-md mx-auto"
        >
          {error && (
            <div className="text-red-500 text-center mb-4 font-medium">
              {error}
            </div>
          )}
          <div className="relative">
            <img
              src={miniuser}
              alt="miniuser"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
            <input
              type="text"
              name="identifier"
              className="w-full pl-10 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#009f96] focus:border-transparent bg-blue-50"
              placeholder="Enter Username, Ph. Number or Email Id."
              value={loginData.identifier}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="relative">
            <img
              src={pass}
              alt="pass"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
            <input
              type="password"
              name="password"
              className="w-full pl-10 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#009f96] focus:border-transparent bg-blue-50"
              placeholder="Password"
              value={loginData.password}
              onChange={handleInputChange}
              minLength="6"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-full text-3xl shadow-md text-white font-semibold hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer bg-[#009f96] hover:bg-[#008a82] mt-8 ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {isLoading ? "Logging In..." : "Log In"}
          </button>
        </form>
      </div>
      <button
        onClick={() => navigate("/health-kiosk")}
        className="fixed bottom-8 left-8 p-2 rounded-full hover:bg-[#009f96]/20 transition-colors duration-200 cursor-pointer"
      >
        <img src={back} alt="Back" className="w-16 h-16" />
      </button>
      <button className="fixed bottom-8 right-8 bg-[#009f96] hover:bg-[#008a82] text-white font-medium py-3 px-6 rounded-full shadow-md transition-colors duration-200 flex items-center gap-2 text-2xl cursor-pointer">
        <img src={lang} alt="Language" className="w-5 h-5" />
        <span>Change Language</span>
      </button>
    </div>
  );
}
