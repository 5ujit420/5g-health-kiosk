import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import lang from "../../assets/Vector.png";
import back from "../../assets/mdi_arrow-back-circle.png";

export default function ResultsPage() {
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || user?.role !== "PATIENT") {
      navigate("/"); // Redirect to login if not authenticated as patient
    }
  }, [navigate]);

  const location = useLocation();

  // Sample data - in a real app you would get this from state or API
  const measurements = location.state || {
    height: { cm: 175, feet: "5'9\"" },
    weight: { kg: 68 },
    temperature: { celsius: 36.5, fahrenheit: 97.7 },
    oximeter: { spo2: 98, pulse: 72 },
  };

  const handleNewTest = () => {
    navigate("/height-measurement");
  };

  const handleHome = () => {
    navigate("/home");
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Main Content Container */}
      <div className="w-full max-w-4xl min-h-[80%] p-10 rounded-xl flex flex-col items-center justify-center bg-[#00999524] backdrop-blur-sm border border-white/30 shadow-2xl">
        {/* Completion Header */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#005553BF] font-sans">
            Health Checkup Complete
          </h1>
          <p className="text-xl text-[#005553BF] mt-2">
            Here are your measurement results
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
          {/* Height Result */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-[#005553BF] mb-4">Height</h2>
            <div className="text-4xl font-bold text-[#005553BF] mb-2">
              {measurements.height.cm} cm
            </div>
            <div className="text-2xl text-[#005553BF] mb-6">
              {measurements.height.feet}
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#009995] to-[#005553] rounded-full"
                style={{
                  width: `${((measurements.height.cm - 100) / 100) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between w-full text-sm text-gray-600 mt-2">
              <span>100cm</span>
              <span>200cm</span>
            </div>
          </div>

          {/* Weight Result */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-[#005553BF] mb-4">Weight</h2>
            <div className="text-4xl font-bold text-[#005553BF] mb-6">
              {measurements.weight.kg} kg
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#009995] to-[#005553] rounded-full"
                style={{
                  width: `${((measurements.weight.kg - 40) / 80) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between w-full text-sm text-gray-600 mt-2">
              <span>40kg</span>
              <span>120kg</span>
            </div>
          </div>

          {/* Temperature Result */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-[#005553BF] mb-4">
              Temperature
            </h2>
            <div className="text-4xl font-bold text-[#005553BF] mb-2">
              {measurements.temperature.celsius} °C
            </div>
            <div className="text-2xl text-[#005553BF] mb-6">
              {measurements.temperature.fahrenheit} °F
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#009995] to-[#005553] rounded-full"
                style={{
                  width: `${
                    ((measurements.temperature.celsius - 35) / 4) * 100
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between w-full text-sm text-gray-600 mt-2">
              <span>35°C</span>
              <span>39°C</span>
            </div>
          </div>

          {/* Oximeter Result */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-[#005553BF] mb-4">
              Oximeter
            </h2>
            <div className="flex justify-between mb-6">
              <div>
                <div className="text-xl text-gray-600 mb-1">SpO2</div>
                <div
                  className={`text-3xl font-bold ${
                    measurements.oximeter.spo2 < 95
                      ? "text-red-500"
                      : "text-[#005553BF]"
                  }`}
                >
                  {measurements.oximeter.spo2}%
                </div>
              </div>
              <div>
                <div className="text-xl text-gray-600 mb-1">Pulse</div>
                <div
                  className={`text-3xl font-bold ${
                    measurements.oximeter.pulse < 60 ||
                    measurements.oximeter.pulse > 100
                      ? "text-red-500"
                      : "text-[#005553BF]"
                  }`}
                >
                  {measurements.oximeter.pulse} bpm
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-[#005553BF] mb-1">
                  SpO2 Level
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#009995] to-[#005553] rounded-full"
                    style={{
                      width: `${
                        ((measurements.oximeter.spo2 - 80) / 20) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between w-full text-xs text-gray-600 mt-1">
                  <span>80%</span>
                  <span>100%</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#005553BF] mb-1">
                  Pulse Rate
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#009995] to-[#005553] rounded-full"
                    style={{
                      width: `${
                        ((measurements.oximeter.pulse - 40) / 120) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between w-full text-xs text-gray-600 mt-1">
                  <span>40bpm</span>
                  <span>160bpm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={handleNewTest}
            className="flex-1 px-8 py-3 rounded-full bg-white text-[#005553BF] text-xl font-bold hover:bg-gray-100 transition-colors duration-200 cursor-pointer shadow-md border border-[#00555350]"
          >
            New Test
          </button>
          <button
            onClick={handleHome}
            className="flex-1 px-8 py-3 rounded-full bg-[#005553BF] text-white text-xl font-bold hover:bg-[#009f96] transition-colors duration-200 cursor-pointer shadow-md"
          >
            Return Home
          </button>
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
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
