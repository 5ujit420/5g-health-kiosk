import React, { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";

export default function ConsultationRoom() {
  const { consultationId } = useParams();
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    remoteStream,
  } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [remoteuserId, setRemoteUserId] = useState();
  const [isCallActive, setIsCallActive] = useState(false);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const navigate = useNavigate();

  const healthMeasurements = [
    { name: "Heart Rate", value: "76 bpm" },
    { name: "Blood Pressure", value: "120/80 mmHg" },
    { name: "Temperature", value: "98.6°F" },
  ];

  const handleUserJoined = useCallback(
    async (data) => {
      const { userId } = data;
      console.log("new user joined", userId);
      try {
        const offer = await createOffer();
        socket.emit("call-user", { userId, offer });
        setRemoteUserId(userId);
        setIsCallActive(true);
      } catch (error) {
        console.error("Error creating offer for new user:", error);
      }
    },
    [createOffer, socket]
  );

  const handleIncomngCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("incoming call from ", from, offer);

      if (!offer || offer.type !== "offer") {
        console.warn("Received invalid offer in incoming-call:", offer);
        return;
      }

      if (peer.signalingState !== "stable") {
        console.warn("Skipping incoming call handling. Peer not in stable state:", peer.signalingState);
        return;
      }

      try {
        const ans = await createAnswer(offer);
        socket.emit("call-accepted", { userId: from, ans });
        setRemoteUserId(from);
        setIsCallActive(true);
      } catch (error) {
        console.error("Error handling incoming call:", error);
      }
    },
    [createAnswer, socket, peer]
  );

  const handleCallAccepted = useCallback(
    async ({ ans }) => {
      console.log("📞 Call accepted, answer:", ans);

      if (!ans || ans.type !== "answer") {
        console.warn("Received invalid answer in call-accepted:", ans);
        return;
      }

      if (peer.signalingState === "have-local-offer") {
        try {
          await setRemoteAnswer(ans);
          console.log("Remote answer set successfully");
        } catch (error) {
          console.error("❌ Error setting remote answer:", error);
        }
      } else {
        console.warn("⚠️ Skipping setRemoteAnswer. Current signaling state:", peer.signalingState);
      }
    },
    [peer, setRemoteAnswer]
  );

  const handleEndCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }

    if (peer) {
      peer.close();
    }

    socket.emit("end-call", { to: remoteuserId });

    setIsCallActive(false);
    setRemoteUserId(null);
    setMyStream(null);

    navigate("/consultation");
  };

  useEffect(() => {
    socket.on("user-joined", handleUserJoined);
    socket.on("incoming-call", handleIncomngCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-ended", () => {
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }
      if (peer) {
        peer.close();
      }
      setIsCallActive(false);
      setRemoteUserId(null);
      setMyStream(null);
      navigate("/consultation");
    });

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("incoming-call", handleIncomngCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-ended");
    };
  }, [handleUserJoined, socket, handleIncomngCall, handleCallAccepted, peer, myStream, navigate]);

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      sendStream(stream);
      setMyStream(stream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      if (error.name === "NotAllowedError") {
        alert("Please allow camera and microphone access.");
      } else if (error.name === "NotFoundError") {
        alert("No camera/microphone found.");
      }
    }
  }, [sendStream]);

  const handleNegotiation = useCallback(async () => {
    if (!remoteuserId || peer.signalingState !== "stable") {
      console.warn("Skipping negotiation. Invalid state or no remote user:", {
        remoteuserId,
        signalingState: peer.signalingState,
      });
      return;
    }

    try {
      const offer = await createOffer();
      socket.emit("call-user", { userId: remoteuserId, offer });
    } catch (error) {
      console.error("Error during negotiation:", error);
    }
  }, [peer, remoteuserId, socket, createOffer]);

  useEffect(() => {
    peer.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          userId: remoteuserId,
          candidate: event.candidate,
        });
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peer.addIceCandidate(candidate);
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    return () => {
      socket.off("ice-candidate");
    };
  }, [peer, socket, remoteuserId]);

  useEffect(() => {
    if (!peer) return;
    peer.addEventListener("negotiationneeded", handleNegotiation);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [handleNegotiation, peer]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && myStream) {
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  if (!healthMeasurements) return null;

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto flex flex-col">
        {/* Header Section */}
        <div className="bg-white shadow-lg rounded-xl p-4 mb-4">
          <h1 className="text-2xl font-bold text-center text-[#005553BF] mb-2">
            Consultation #{consultationId}
          </h1>
          <div className="flex justify-center space-x-4">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isCallActive
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {isCallActive ? "Call Active" : "Connecting..."}
            </div>
            {remoteuserId && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Connected with {remoteuserId}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 gap-4 h-full overflow-hidden">
          {/* Patient Info Section */}
          <div className="bg-white shadow-lg rounded-xl p-4 w-1/4">
            <h2 className="text-xl font-semibold mb-4 text-[#005553BF] border-b pb-2">
              Patient Vitals
            </h2>
            <ul className="space-y-2">
              {healthMeasurements.map((hm, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <span className="font-medium text-gray-700">{hm.name}:</span>
                  <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {hm.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Video Section */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white shadow-lg rounded-xl p-4 flex-1 flex flex-col">
              <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden">
                {remoteStream ? (
                  <div className="absolute inset-0">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {remoteuserId && (
                      <div className="absolute bottom-2 left-2 bg-black marathon-bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {remoteuserId}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <p>Waiting for participant to join</p>
                    </div>
                  </div>
                )}

                {/* Local Video Preview */}
                {myStream && (
                  <div className="absolute bottom-4 right-4 w-1/4 h-32 z-10 rounded-lg overflow-hidden shadow-lg">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      You
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Call Controls */}
            <div className="mt-4 bg-white shadow-lg rounded-xl p-4">
              <div className="flex justify-center space-x-6">
                <button
                  onClick={handleEndCall}
                  className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-md transition-all flex items-center justify-center"
                  title="End Call"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                    />
                  </svg>
                </button>

                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-md transition-all flex items-center justify-center"
                  title="Mute"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-md transition-all flex items-center justify-center"
                  title="Camera Off"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}