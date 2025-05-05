import React, { useMemo, useEffect, useState, useCallback } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun2.l.google.com:19302" }],
      }),
    []
  );

  const createOffer = async () => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      console.log("Created offer:", offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  };

  const createAnswer = async (offer) => {
    try {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      console.log("Created answer:", answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  };

  const setRemoteAnswer = async (ans) => {
    console.log("Before setting remote answer:", peer.signalingState);

    if (peer.signalingState === "have-local-offer") {
      try {
        await peer.setRemoteDescription(ans);
        console.log("Remote answer set successfully!");
      } catch (error) {
        console.error("Failed to set remote answer:", error);
      }
    } else {
      console.warn(
        "Unexpected signaling state while setting remote answer:",
        peer.signalingState
      );
    }
  };

  const sendStream = async (stream) => {
    try {
      const tracks = stream.getTracks();
      for (const track of tracks) {
        peer.addTrack(track, stream);
      }
    } catch (error) {
      console.error("Error sending stream:", error);
    }
  };

  const handleTrackEvent = useCallback((e) => {
    const streams = e.streams;
    setRemoteStream(streams[0]);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);
    return () => {
      peer.removeEventListener("track", handleTrackEvent);
      setRemoteStream(null);
    };
  }, [handleTrackEvent, peer]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        sendStream,
        remoteStream,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};