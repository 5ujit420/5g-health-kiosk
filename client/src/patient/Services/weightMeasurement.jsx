import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lang from "../../assets/Vector.png";
import userWeight from "../../assets/weightttttt.png";
import back from "../../assets/mdi_arrow-back-circle.png";

export default function WeightMeasurement() {
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || user?.role !== "PATIENT") {
      navigate("/"); // Redirect to login if not authenticated as patient
    }
  }, [navigate]);

  const [isMeasuring, setIsMeasuring] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [weight, setWeight] = useState(70); // Example value in kg
  const steps = ["Height", "Weight", "Temperature", "Oximeter"];
  const currentStep = 1;

  const handleMeasureClick = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      setIsMeasuring(false);
      setShowResult(true);
      // Generate random weight between 40-120kg for demo
      const randomKg = Math.floor(Math.random() * 80) + 40;
      setWeight(randomKg);
    }, 3000);
  };

  const handleContinue = () => {
    navigate("/temperature");
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Progress Line */}
      <div className="w-full max-w-4xl mb-8 px-4 relative">
        {/* Background progress line */}
        <div className="absolute top-3 left-0 right-0 h-2 bg-gray-300 rounded-full"></div>

        {/* Active progress line with gradient */}
        <div
          className="absolute top-3 left-0 h-2 bg-gradient-to-r from-[#009995] to-[#005553] rounded-full transition-all duration-500"
          style={{
            width: `${
              currentStep === 0
                ? "0%"
                : `${(currentStep / (steps.length - 1)) * 100}%`
            }`,
          }}
        ></div>

        {/* Steps indicators */}
        <div className="relative flex justify-between items-center">
          {steps.map((step, index) => (
            <div
              key={step}
              className="relative flex flex-col items-center z-10"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 
            ${
              index < currentStep
                ? "bg-[#009995] text-white shadow-lg"
                : index === currentStep
                ? "bg-[#005553] text-white scale-110 shadow-md"
                : "bg-gray-300 text-gray-500"
            }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-2 text-sm font-medium transition-all duration-300 
          ${index <= currentStep ? "text-[#005553]" : "text-gray-500"}`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl min-h-[80%] p-10 rounded-xl flex flex-col items-center justify-center bg-[#00999524] backdrop-blur-sm border border-white/30 shadow-2xl">
        {!isMeasuring && !showResult ? (
          <>
            <h1 className="text-4xl font-extrabold text-[#005553BF] mb-12 font-sans">
              Weight Measurement
            </h1>
            <div className="flex">
              <img src={userWeight} alt="Language" />
              <div className="flex flex-col items-center gap-4 w-[50%] justify-center">
                <h2 className="text-2xl font-bold text-center text-[#005553BF]">
                  Stand Exactly above the Weight Measurement Device
                </h2>
                <button
                  onClick={handleMeasureClick}
                  className="h-50 w-50 rounded-full bg-[#005553BF] text-white text-2xl font-bold hover:bg-[#009f96] transition-colors duration-200 cursor-pointer"
                >
                  Click Here To Continue
                </button>
              </div>
            </div>
          </>
        ) : isMeasuring ? (
          <div className="flex flex-col items-center justify-center gap-8">
            <h1 className="text-4xl font-extrabold text-[#005553BF] mb-12 font-sans">
              Weight Measurement
            </h1>
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full border-8 border-[#00555340]"></div>
              <div className="absolute w-3/4 h-3/4 rounded-full border-8 border-transparent border-t-[#005553BF] border-r-[#005553BF] animate-spin"></div>
              <div className="absolute text-xl font-bold text-[#005553BF] animate-pulse">
                Scanning...
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-[#005553BF]">
              Measuring Weight...
              <br />
              Stand Exactly above the Weight Measurement Device
            </h2>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-8 w-full">
            <h1 className="text-4xl font-extrabold text-[#005553BF] mb-4 font-sans">
              Your Weight Measurement
            </h1>

            <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-8 shadow-lg w-full max-w-md">
              <div className="text-6xl font-bold text-[#005553BF] mb-6">
                {weight} kg
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#009995] to-[#005553] rounded-full"
                  style={{ width: `${((weight - 40) / 80) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between w-full text-sm text-gray-600 mt-2">
                <span>40kg</span>
                <span>120kg</span>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="mt-8 px-12 py-4 rounded-full bg-[#005553BF] text-white text-2xl font-bold hover:bg-[#009f96] transition-colors duration-200 cursor-pointer shadow-lg"
            >
              Continue to Temperature Measurement
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/home")}
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
