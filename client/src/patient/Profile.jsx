import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import back from "../assets/mdi_arrow-back-circle.png";
import lang from "../assets/Vector.png";
import user_profile from "../assets/user.png";

const ProfileCard = () => {
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || user?.role !== "PATIENT") {
      navigate("/"); // Redirect to login if not authenticated as patient
    }
  }, [navigate]);

  const [weight, setWeight] = useState(76);
  const [height, setHeight] = useState(182);
  const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 24.9) return "Healthy";
    if (bmi < 30) return "Overweight";
    return "Obesity";
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Main Content Container */}
      <div className="w-full max-w-4xl min-h-[80%] p-10 rounded-xl flex flex-col items-center justify-center bg-[#00999524] backdrop-blur-sm border border-white/30 shadow-2xl">
        {/* Profile Header */}
        <div className="flex items-center gap-8 mb-12">
          <img src={user_profile} alt="profile" className="w-32 h-32" />
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-[#005553BF]">
              Mr. John Doe
            </h1>
            <p className="text-xl text-[#005553BF]">
              Email: john.doe@gmail.com
            </p>
            <p className="text-xl text-[#005553BF]">Phone: +91 9876542345</p>
          </div>
        </div>

        <button className="mb-8 w-full max-w-xs py-3 px-6 rounded-full bg-[#009f96] text-white text-xl font-bold hover:bg-[#008a82] transition-colors duration-200 shadow-md">
          Edit Profile
        </button>

        {/* Measurements Grid */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mb-12 text-center">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-xl text-[#005553BF] mb-2">Weight</p>
            <p className="text-3xl font-bold text-[#009f96]">{weight} kg</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-xl text-[#005553BF] mb-2">Height</p>
            <p className="text-3xl font-bold text-[#009f96]">{height} cm</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-xl text-[#005553BF] mb-2">Gender</p>
            <p className="text-3xl font-bold text-[#009f96]">♂ Male</p>
          </div>
        </div>

        {/* BMI Section */}
        <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#005553BF]">BMI {bmi}</h2>
            <span className="text-xl text-[#005553BF]">
              {getBmiCategory(bmi)}
            </span>
          </div>
          <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-[#009995] to-[#005553] rounded-full"
              style={{
                width: `${Math.min(
                  Math.max(((bmi - 15) / 30) * 100, 0),
                  100
                )}%`,
                left: "15%",
              }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-[#005553BF] mt-2">
            <span>15</span>
            <span>18.5</span>
            <span>24.9</span>
            <span>30</span>
            <span>45</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
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
};

export default ProfileCard;
