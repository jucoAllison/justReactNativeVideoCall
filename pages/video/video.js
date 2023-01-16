import React, {useContext, useEffect, useRef} from 'react';
import {View, Text} from 'react-native';
import {useRoute} from '@react-navigation/core';
import {MainContext} from '../../App';
import {mediaDevices, RTCPeerConnection} from 'react-native-webrtc';

const Video = () => {
  const CTX = useContext(MainContext);
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
        window.location.href = '/';
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

  const handleRoomCreated = async () => {
    try {
      hostRef.current = true;
      const local = await mediaDevices.getUserMedia({
        audio: true,
        video: {width: 500, height: 500},
      });
      userStreamRef.current = local;
      
    } catch (error) {
      console.log("error ===> ", handleRoomCreated);
    }
  };
  const handleRoomJoined = async () => {
    try {
      const local = await mediaDevices.getUserMedia({
        audio: true,
        video: {width: 500, height: 500},
      });
      userStreamRef.current = local;
      
    } catch (error) {
      console.log("error ===> ", handleRoomJoined);
    }
  };



  const initiateCall = () => {};

  const createPeerConnection = () => {
    // We create a RTC Peer Connection
    const connection = new RTCPeerConnection(ICE_SERVERS);

    // We implement our onicecandidate method for when we received a ICE candidate from the STUN server
    connection.onicecandidate = handleICECandidateEvent;

    // We implement our onTrack method for when we receive tracks
    connection.ontrack = handleTrackEvent;
    return connection;
    
  };


  const onPeerLeave = () => {};

  const handleReceivedOffer = () => {};
  const handleAnswer = () => {};
  const handlerNewIceCandidateMsg = () => {};

  return (
    <View>
      <Text style={{color: 'red'}}>Loading Here</Text>
    </View>
  );
};

export default Video;
