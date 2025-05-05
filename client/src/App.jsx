import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import LandingPage from "./landingPage";
import HealthKioskPage from "./patient/healthKioskPage";
import Login from "./patient/login";
import Signup from "./patient/signup";
import Homepage from "./patient/homePage";
import HeightMeasurement from "./patient/Services/heightMeasurement";
import WeightMeasurement from "./patient/Services/weightMeasurement";
import TemperatureMeasurement from "./patient/Services/tempratureMeasurement";
import OximeterMeasurement from "./patient/Services/oximeter";
import ResultsPage from "./patient/Services/results";
import Profile from "./patient/Profile";
import ConsultationPage from "./patient/Services/consultation";
import DoctorHomepage from "./doctor/home";
import DoctorLogin from "./doctor/doctorLogin";
import DoctorSignup from "./doctor/doctorSignup";
import ConsultationRoom from "./patient/ConsultationRoom";
import { SocketProvider } from "./providers/Socket";
import { PeerProvider } from "./providers/Peer";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {" "}
      {/* Added background color */}
      <Router>
        <SocketProvider>
          <PeerProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/health-kiosk" element={<HealthKioskPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={<Homepage />} />
              <Route path="/height" element={<HeightMeasurement />} />
              <Route path="/weight" element={<WeightMeasurement />} />
              <Route path="/temperature" element={<TemperatureMeasurement />} />
              <Route path="/oximeter" element={<OximeterMeasurement />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/consultation" element={<ConsultationPage />} />
              <Route path="/doc" element={<DoctorHomepage />} />
              <Route path="/doctor-login" element={<DoctorLogin />} />
              <Route path="/doctor-signup" element={<DoctorSignup />} />
              <Route
                path="/consultation/:consultationId"
                element={<ConsultationRoom />}
              />
            </Routes>
          </PeerProvider>
        </SocketProvider>
      </Router>
    </div>
  );
}

export default App;
