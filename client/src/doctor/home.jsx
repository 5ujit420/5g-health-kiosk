import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [patients, setPatients] = useState([]);
  const [acceptedconsultations, setAcceptedConsultations1] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  // const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { socket } = useSocket();

  const API_BASE_URL = "http://localhost:5000";

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user")) || doctor;
    setDoctor(user);

    if (!token || user?.role !== "DOCTOR") {
      navigate("/");
    }
  }, [navigate]);

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

  const fetchAcceptedConsultations = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/consultations/getacceptedrequests`,
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
      setAcceptedConsultations1(data.consultations);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getPatients = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/consultations/distinctpatients`,
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
      setPatients(data.patients);
      console.log(data.patients);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchConsultations();
    fetchAcceptedConsultations();
    getPatients();
  }, []);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchConsultations, 5000);
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

  const handleAcceptCall = async (consultationId) => {
    try {
      console.log(consultationId);
      const response = await fetch(`${API_BASE_URL}/api/consultations/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include auth token if required
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ consultationId }),
      });

      const data = await response.json();

      if (data.success) {
        // Proceed to the consultation room
        navigate(`/consultation/${consultationId}`);

        socket.emit("join-room", {
          roomId: consultationId,
          userId: doctor.id,
        });
      } else {
        alert(data.message || "Failed to accept consultation");
      }
    } catch (error) {
      console.error("Error accepting consultation:", error);
      alert("An error occurred while accepting the consultation.");
    }
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
          {/* <button
            className={`w-full text-left p-3 rounded-lg flex items-center transition-all ${
              activeTab === "schedule"
                ? "bg-blue-100 text-blue-600 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 w-5" />
            Schedule
          </button> */}
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
                      {patients.length}
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
                      {acceptedconsultations.length}
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
        {activeTab === "patients" && (
          <>
            {/* Patients Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Patient Records
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 p-4 text-center">{error}</div>
              ) : patients.length === 0 ? (
                <div className="text-gray-500 p-4 text-center">
                  No patients found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patients.map((patient) => {
                    // Ensure acceptedConsultations is an array
                    const patientConsultations = Array.isArray(
                      patient.acceptedConsultations
                    )
                      ? patient.acceptedConsultations
                      : [];

                    return (
                      <div
                        key={patient.id}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        {/* Patient Card Content */}
                        <div className="flex items-start mb-4">
                          <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <FontAwesomeIcon
                              icon={faUserCircle}
                              className="text-blue-600 text-xl"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {patient.name}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              Last active:{" "}
                              {patient.lastActiveAt
                                ? new Date(
                                    patient.lastActiveAt
                                  ).toLocaleDateString()
                                : "Never"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={faIdCard}
                              className="text-gray-400 mr-3 w-4"
                            />
                            <span className="text-gray-700 text-sm">
                              ID: {patient.id.substring(0, 8)}...
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="text-gray-400 mr-3 w-4"
                            />
                            <span className="text-gray-700 text-sm">
                              {patient.email}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={faPhone}
                              className="text-gray-400 mr-3 w-4"
                            />
                            <span className="text-gray-700 text-sm">
                              {patient.phoneNumber}
                            </span>
                          </div>
                          {patient.healthMeasurements?.length > 0 && (
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faChartLine}
                                className="text-gray-400 mr-3 w-4"
                              />
                              <span className="text-gray-700 text-sm">
                                Last recorded:{" "}
                                {new Date(
                                  patient.healthMeasurements[0].measuredAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {patient.healthMeasurements?.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <h4 className="font-medium text-sm mb-2 text-gray-700">
                              Health Metrics
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm">
                                <span className="text-gray-500">Height:</span>{" "}
                                <span className="font-medium">
                                  {patient.healthMeasurements[0].height ||
                                    "N/A"}{" "}
                                  cm
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Weight:</span>{" "}
                                <span className="font-medium">
                                  {patient.healthMeasurements[0].weight ||
                                    "N/A"}{" "}
                                  kg
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">
                                  Heart Rate:
                                </span>{" "}
                                <span className="font-medium">
                                  {patient.healthMeasurements[0].heartRate ||
                                    "N/A"}{" "}
                                  bpm
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">BP:</span>{" "}
                                <span className="font-medium">
                                  {patient.healthMeasurements[0]
                                    .bloodPressure || "N/A"}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Temp:</span>{" "}
                                <span className="font-medium">
                                  {patient.healthMeasurements[0].temperature ||
                                    "N/A"}{" "}
                                  °C
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Oxygen:</span>{" "}
                                <span className="font-medium">
                                  {patient.healthMeasurements[0].oximeter ||
                                    "N/A"}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          {/* <button
                            className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            onClick={() => setShowHistoryModal(true)}
                          >
                            View History ({patientConsultations.length})
                          </button> */}
                        </div>

                        {/* History Modal */}
                        {showHistoryModal && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">
                                  Consultation History for {patient.name}
                                </h3>
                                <button
                                  onClick={() => setShowHistoryModal(false)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <FontAwesomeIcon icon={faTimesCircle} />
                                </button>
                              </div>

                              {patientConsultations.length === 0 ? (
                                <div className="text-gray-500 text-center py-8">
                                  No consultation history found
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {patientConsultations.map((consultation) => (
                                    <div
                                      key={consultation.id}
                                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium">
                                            Consultation on{" "}
                                            {new Date(
                                              consultation.createdAt
                                            ).toLocaleDateString()}
                                          </h4>
                                          <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <FontAwesomeIcon
                                              icon={faClock}
                                              className="mr-2"
                                            />
                                            Requested at:{" "}
                                            {new Date(
                                              consultation.requestTime
                                            ).toLocaleString()}
                                          </div>
                                          {consultation.acceptanceTime && (
                                            <div className="text-sm text-gray-500 mt-1">
                                              Accepted at:{" "}
                                              {new Date(
                                                consultation.acceptanceTime
                                              ).toLocaleString()}
                                            </div>
                                          )}
                                        </div>
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            consultation.status === "ACCEPTED"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-blue-100 text-blue-800"
                                          }`}
                                        >
                                          {consultation.status}
                                        </span>
                                      </div>
                                      {consultation.callDuration && (
                                        <div className="mt-2 text-sm">
                                          <span className="font-medium">
                                            Duration:
                                          </span>{" "}
                                          {Math.floor(
                                            consultation.callDuration / 60
                                          )}
                                          m {consultation.callDuration % 60}s
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
