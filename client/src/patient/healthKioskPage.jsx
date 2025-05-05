import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lang from "../assets/Vector.png";

export default function HealthKioskPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.role === "DOCTOR") {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="w-full max-w-2xl p-10 rounded-xl flex flex-col items-center bg-[#00999524] backdrop-blur-sm border border-white/30 shadow-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-12 font-sans tracking-tight">
          Welcome to Health Kiosk
        </h1>

        <div className="w-full mb-10 text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-6 font-sans">
            Already a User?
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-4 px-6 rounded-full text-4xl shadow-md text-white font-semibold hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer bg-[#009f96] hover:bg-[#008a82]"
          >
            Log In
          </button>
        </div>

        <div className="w-full mb-10 text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-6 font-sans">
            New to our Services?
          </h2>
          <button
            onClick={() => navigate("/signup")}
            className="w-full py-4 px-6 rounded-full text-4xl shadow-md text-white font-semibold hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer bg-[#009f96] hover:bg-[#008a82]"
          >
            Sign Up
          </button>
        </div>
      </div>

      <button className="fixed bottom-8 right-8 flex items-center gap-2 bg-[#009f96] hover:bg-[#008a82] text-white font-medium py-3 px-6 rounded-full shadow-md transition-colors duration-200 cursor-pointer text-2xl">
        <img src={lang} alt="Language icon" className="h-5 w-5" />
        <span>Change Language</span>
      </button>
    </div>
  );
}
