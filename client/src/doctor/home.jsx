import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faCalendarAlt,
  faUserMd,
  faChartLine,
  faBell,
  faSearch,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faUserCircle,
  faStethoscope,
  faHospital,
  faEnvelope,
  faPhone,
  faIdCard,
  faSignOutAlt,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { useSocket } from "../providers/Socket";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const { socket } = useSocket();

  const API_BASE_URL = "https://192.168.37.51:5000";

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user")) || doctor;
    setDoctor(user);

    if (!token || user?.role !== "DOCTOR") {
      navigate("/");
    }
  }, [navigate]);

  console.log(doctor);

  // Fetch consultation requests
  const fetchConsultations = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/consultations/getrequests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch consultations");
      }

      const data = await response.json();
      console.log(data);
      setConsultations(data.consultations);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchConsultations();
  }, []);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchConsultations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const patientData = [
    { name: "Mon", patients: 4 },
    { name: "Tue", patients: 6 },
    { name: "Wed", patients: 8 },
    { name: "Thu", patients: 5 },
    { name: "Fri", patients: 7 },
    { name: "Sat", patients: 3 },
  ];

  const handleAcceptCall = (consultationId) => {
    navigate(`/consultation/${consultationId}`);
    socket.emit("join-room", {
      roomId: consultationId,
      userId: doctor.id,
    });
  };

  const handleRejectCall = async (consultationId) => {
    try {
      const response = await fetch(
        `/api/consultations/${consultationId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject consultation");
      }

      // Update local state
      setConsultations((prev) => prev.filter((c) => c.id !== consultationId));
    } catch (err) {
      console.error("Error rejecting consultation:", err);
    }
  };

  // If not authenticated, don't render anything (will redirect)
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || doctor;
  if (!token || user?.role !== "DOCTOR") {
    return null;
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-screen w-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-8 flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <div className="bg-blue-100 p-2 rounded-full">
            <FontAwesomeIcon
              icon={faUserCircle}
              className="text-blue-600 text-2xl"
            />
          </div>
          <div>
            <p className="font-medium">Dr. {doctor?.name || "User"}</p>
            <p className="text-xs text-gray-500">General Physician</p>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            className={`w-full text-left p-3 rounded-lg flex items-center transition-all ${
              activeTab === "dashboard"
                ? "bg-blue-100 text-blue-600 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-3 w-5" />
            Dashboard
          </button>
          <button
            className={`w-full text-left p-3 rounded-lg flex items-center transition-all ${
              activeTab === "schedule"
                ? "bg-blue-100 text-blue-600 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 w-5" />
            Schedule
          </button>
          <button
            className={`w-full text-left p-3 rounded-lg flex items-center transition-all ${
              activeTab === "patients"
                ? "bg-blue-100 text-blue-600 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("patients")}
          >
            <FontAwesomeIcon icon={faUserMd} className="mr-3 w-5" />
            Patients
          </button>
          <button
            className={`w-full text-left p-3 rounded-lg flex items-center transition-all ${
              activeTab === "consultations"
                ? "bg-blue-100 text-blue-600 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("consultations")}
          >
            <FontAwesomeIcon icon={faVideo} className="mr-3 w-5" />
            Consultations
          </button>
          <button
            className={`w-full text-left p-3 rounded-lg flex items-center transition-all ${
              activeTab === "settings"
                ? "bg-blue-100 text-blue-600 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <FontAwesomeIcon icon={faCog} className="mr-3 w-5" />
            Settings
          </button>
        </nav>

        <div className="mt-auto mb-4">
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg flex items-center text-red-500 hover:bg-red-50 transition-all"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "schedule" && "Appointment Schedule"}
            {activeTab === "patients" && "Patient Management"}
            {activeTab === "consultations" && "Consultations"}
            {activeTab === "settings" && "Settings"}
          </h1>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients, records..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-3 text-gray-400"
              />
            </div>
            <button className="p-2 relative hover:bg-gray-100 rounded-lg transition-all">
              <FontAwesomeIcon icon={faBell} className="text-gray-600" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Total Patients</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {stats?.totalPatients || 0}
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FontAwesomeIcon
                      icon={faUserMd}
                      className="text-blue-600 text-xl"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="text-green-500">
                    +{stats?.newPatientsThisWeek || 0}
                  </span>{" "}
                  this week
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Completed Consultations</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {stats?.completedConsultations || 0}
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-600 text-xl"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="text-green-500">
                    +{stats?.consultationsThisMonth || 0}
                  </span>{" "}
                  this month
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Upcoming Appointments</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {stats?.upcomingAppointments || 0}
                    </h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-purple-600 text-xl"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="text-red-500">
                    {stats?.appointmentsToday || 0}
                  </span>{" "}
                  today
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Pending Requests</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {consultations.length}
                    </h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-yellow-600 text-xl"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Requires your attention
                </p>
              </div>
            </div>

            {/* Charts and Doctor Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Consultation Requests */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Consultation Requests
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {consultations.length} Pending
                  </span>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 p-4 text-center">{error}</div>
                ) : consultations.length === 0 ? (
                  <div className="text-gray-500 p-4 text-center">
                    No pending consultation requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {consultation.patient?.name || "Unknown Patient"}
                            </h4>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <FontAwesomeIcon
                                icon={faClock}
                                className="mr-2"
                              />
                              Requested at:{" "}
                              {formatTime(consultation.requestTime)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Phone:{" "}
                              {consultation.patient?.phoneNumber || "N/A"}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAcceptCall(consultation.id)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                            >
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="mr-2"
                              />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectCall(consultation.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                            >
                              <FontAwesomeIcon
                                icon={faTimesCircle}
                                className="mr-2"
                              />
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Profile Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative mb-3">
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="text-6xl text-blue-500"
                    />
                    <span className="absolute bottom-0 right-0 bg-green-500 rounded-full w-3 h-3 border-2 border-white"></span>
                  </div>
                  <h3 className="text-xl font-bold">Dr. {doctor?.name}</h3>
                  <p className="text-gray-500">General Physician</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="text-gray-400 mr-3 w-5"
                    />
                    <span className="text-gray-700">
                      ID: {doctor?.id || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faStethoscope}
                      className="text-gray-400 mr-3 w-5"
                    />
                    <span className="text-gray-700">MD</span>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faHospital}
                      className="text-gray-400 mr-3 w-5"
                    />
                    <span className="text-gray-700">City General Hospital</span>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-gray-400 mr-3 w-5"
                    />
                    <span className="text-gray-700">{doctor?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="text-gray-400 mr-3 w-5"
                    />
                    <span className="text-gray-700">
                      {doctor?.phoneNumber || "+1 (555) 123-4567"}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-6 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Consultation Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FontAwesomeIcon
                          icon={faUserMd}
                          className="text-blue-600 text-sm"
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          Consultation with John Doe
                        </p>
                        <p className="text-sm text-gray-500">
                          Completed 2 hours ago
                        </p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-center text-blue-600 text-sm font-medium mt-2 hover:text-blue-800 transition-colors">
                    View All Activity
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
