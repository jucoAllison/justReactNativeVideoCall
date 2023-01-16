import React, {useContext, useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useRoute} from '@react-navigation/core';
import {MainContext} from '../../App';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
  RTCIceCandidate,
} from 'react-native-webrtc';
import {useNavigation} from '@react-navigation/core';

const Video = () => {
  const navigation = useNavigation();
  const CTX = useContext(MainContext);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const userVideoRef = useRef();
  const peerVideoRef = useRef();
  const rtcConnectionRef = useRef(null);
  const socketRef = useRef();
  const userStreamRef = useRef();
  const hostRef = useRef(false);
  const route = useRoute();
  const pc = useRef();
  const servers = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  const roomName = route?.params?.id;

  useEffect(() => {
    if (CTX.socketObj) {
      // First we join a room
      CTX.socketObj.emit('join', roomName);

      CTX.socketObj.on('created', handleRoomCreated);

      CTX.socketObj.on('joined', handleRoomJoined);
      // If the room didn't exist, the server would emit the room was 'created'

      // Whenever the next person joins, the server emits 'ready'
      CTX.socketObj.on('ready', initiateCall);

      // Emitted when a peer leaves the room
      CTX.socketObj.on('leave', onPeerLeave);

      // If the room is full, we show an alert
      CTX.socketObj.on('full', () => {
        navigation.navigate('Home');
      });

      // Events that are webRTC speccific
      CTX.socketObj.on('offer', handleReceivedOffer);
      CTX.socketObj.on('answer', handleAnswer);
      CTX.socketObj.on('ice-candidate', handlerNewIceCandidateMsg);
    }

    // clear up after
    return () => {
      CTX.socketObj.off('join');
      CTX.socketObj.off('created');
      CTX.socketObj.off('joined');
      CTX.socketObj.off('ready');
      CTX.socketObj.off('ready');
    };
  }, [CTX.socketObj]);

  const handleRoomJoined = async () => {
    try {
      const local = await mediaDevices.getUserMedia({
        audio: true,
        video: {width: 500, height: 500},
      });
      userStreamRef.current = local;
      setLocalStream(local);
      CTX.socketObj.emit('ready', roomName);
    } catch (error) {
      console.log('error from handleRoomJoined ===> ', handleRoomJoined);
    }
  };

  const handleRoomCreated = async () => {
    try {
      hostRef.current = true;
      const local = await mediaDevices.getUserMedia({
        audio: true,
        video: {width: 500, height: 500},
      });
      userStreamRef.current = local;
      setLocalStream(local);
    } catch (error) {
      console.log('error ===> ', handleRoomCreated);
    }
  };

  const initiateCall = () => {
    if (hostRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[0],
        userStreamRef.current,
      );
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[1],
        userStreamRef.current,
      );
      rtcConnectionRef.current
        .createOffer()
        .then(offer => {
          rtcConnectionRef.current.setLocalDescription(offer);
          CTX.socketObj.emit('offer', offer, roomName);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const ICE_SERVERS = {
    iceServers: [
      {
        urls: 'stun:openrelay.metered.ca:80',
      },
    ],
  };

  const createPeerConnection = () => {
    // We create a RTC Peer Connection
    const connection = new RTCPeerConnection(servers);

    // We implement our onicecandidate method for when we received a ICE candidate from the STUN server
    connection.onicecandidate = handleICECandidateEvent;

    // We implement our onTrack method for when we receive tracks
    connection.ontrack = handleTrackEvent;
    return connection;
  };
  const handleICECandidateEvent = event => {
    if (event.candidate) {
      CTX.socketObj.emit('ice-candidate', event.candidate, roomName);
    }
  };
  const handleTrackEvent = event => {
    // peerVideoRef.current.srcObject = event.streams[0];
    setRemoteStream(event.streams[0]);
  };

  const onPeerLeave = () => {
    // This person is now the creator because they are the only person in the room.
    hostRef.current = true;
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop()); // Stops receiving all track of Peer.
    }

    // Safely closes the existing connection established with the peer who left.
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
  };

  const handleReceivedOffer = offer => {
    if (!hostRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[0],
        userStreamRef.current,
      );
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[1],
        userStreamRef.current,
      );
      rtcConnectionRef.current.setRemoteDescription(offer);

      rtcConnectionRef.current
        .createAnswer()
        .then(answer => {
          rtcConnectionRef.current.setLocalDescription(answer);
          CTX.socketObj.emit('answer', answer, roomName);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const handleAnswer = answer => {
    rtcConnectionRef.current
      .setRemoteDescription(answer)
      .catch(err => console.log(err));
  };

  const handlerNewIceCandidateMsg = incoming => {
    // We cast the incoming candidate to RTCIceCandidate
    const candidate = new RTCIceCandidate(incoming);
    rtcConnectionRef.current
      .addIceCandidate(candidate)
      .catch(e => console.log(e));
  };

  const leaveRoom = () => {
    CTX.socketObj.emit('leave', roomName); // Let's the server know that user has left the room.

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop()); // Stops receiving all track of User.
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop()); // Stops receiving audio track of Peer.
    }

    // Checks if there is peer on the other side and safely closes the existing connection established with the peer.
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
    navigation.navigate('Home');
  };

  return (
    <View>
      {localStream ? (
        <RTCView
          streamURL={localStream?.toURL()}
          style={{height: 150, width: 150}}
          objectFit="cover"
          mirror
        />
      ) : (
        <Text style={{color: 'red'}}>Loading Here</Text>
      )}

      {remoteStream ? (
        <>
          <RTCView
            streamURL={remoteStream?.toURL()}
            style={{height: 150, width: 150}}
            objectFit="cover"
            mirror
          />
          <TouchableOpacity
            onPress={leaveRoom}
            style={{backgroundColor: '#d00'}}>
            <Text style={{color: '#fff'}}>End Call</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={{color: 'red'}}>Loading Here</Text>
      )}
    </View>
  );
};

export default Video;
