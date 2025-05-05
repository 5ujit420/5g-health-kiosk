import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lang from "../assets/Vector.png";
import user from "../assets/user.png";
import pencil from "../assets/icon-park-outline_write.png";
import phone from "../assets/ic_baseline-phone.png";
import email from "../assets/material-symbols_mail-outline.png";
import pass from "../assets/mdi_password.png";
import back from "../assets/mdi_arrow-back-circle.png";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "https://192.168.37.51:5000";

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.name || !formData.phoneNumber || !formData.password) {
      setError("Name, phone number, and password are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error || "Login failed");
      }

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user || {}));
      navigate("/home");
    } catch (err) {
      setError(err.message);
      console.error("Authentication error:", err);
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
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}

          <div className="relative">
            <div className="relative">
              <img
                src={pencil}
                alt="pencil"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="text"
                name="name"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#009f96] focus:border-transparent bg-blue-50"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <img
                src={phone}
                alt="phone"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="tel"
                name="phoneNumber"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#009f96] focus:border-transparent bg-blue-50"
                placeholder="Phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <img
                src={email}
                alt="email"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="email"
                name="email"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#009f96] focus:border-transparent bg-blue-50"
                placeholder="Email (optional)"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <img
                src={pass}
                alt="pass"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="password"
                name="password"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#009f96] focus:border-transparent bg-blue-50"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                minLength="6"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-full text-3xl shadow-md text-white font-semibold hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer bg-[#009f96] hover:bg-[#008a82] mt-2 ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
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
