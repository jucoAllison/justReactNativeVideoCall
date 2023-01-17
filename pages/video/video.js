import React, {useContext, useEffect, useRef, useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/core';
import {MainContext} from '../../App';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
import {useNavigation} from '@react-navigation/core';

const Video = () => {
  const navigation = useNavigation();
  const CTX = useContext(MainContext);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [calling, setCalling] = useState(false);
  const [yourConn, setYourConn] = useState(
    //change the config as you need
    new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'stun:stun2.l.google.com:19302',
        },
      ],
    }),
  );

  const rtcConnectionRef = useRef(null);
  const userStreamRef = useRef();
  const hostRef = useRef(false);
  const route = useRoute();

  const roomName = route?.params?.id;

  useEffect(() => {
    if (!yourConn) {
      setYourConn(
        //change the config as you need
        new RTCPeerConnection({
          iceServers: [
            {
              urls: 'stun:stun.l.google.com:19302',
            },
            {
              urls: 'stun:stun1.l.google.com:19302',
            },
            {
              urls: 'stun:stun2.l.google.com:19302',
            },
          ],
        }),
      );

      return;
    } else {
      if (CTX.socketObj) {
        let isFront = false;

        mediaDevices
          .getUserMedia({
            audio: true,
            video: {
              mandatory: {
                minWidth: 500, // Provide your own width, height and frame rate here
                minHeight: 300,
                minFrameRate: 30,
              },
            },
          })
          .then(stream => {
            // Got stream!
            setLocalStream(stream);

            // Push tracks from local stream to peer connection
            stream.getTracks().forEach(track => {
              yourConn.getLocalStreams()[0].addTrack(track);
            });
            // setup stream listening
            yourConn.addStream(stream);

            CTX.socketObj.emit('ready', roomName);
          })
          .catch(error => {
            // Log error
            console.log('useEffect COLOR ERROR HERE!!!!!');
            console.log('useEffect COLOR ERROR HERE!!!!!');
            console.log('useEffect COLOR ERROR HERE!!!!!');
            console.log('useEffect COLOR ERROR HERE!!!!!');
            console.log('useEffect COLOR ERROR HERE!!!!!');
            console.log('useEffect COLOR ERROR HERE!!!!! =====+>>>>>', error);
            console.log('useEffect COLOR ERROR HERE!!!!!');
            console.log('useEffect COLOR ERROR HERE!!!!!');
            console.log('useEffect COLOR ERROR HERE!!!!!');
            console.log('useEffect COLOR ERROR HERE!!!!!');
            console.log('useEffect COLOR ERROR HERE!!!!!');
          });

    
        yourConn.onaddstream = event => {
          console.log('On Add Stream', event);
          setRemoteStream(event.stream);
        };

        // Setup ice handling
        yourConn.onicecandidate = event => {
          if (event.candidate) {
            CTX.socketObj.emit('ice-candidate', event.candidate, roomName);
          }
        };
      }
    }
  }, [yourConn, CTX.socketObj]);

  // useEffect(() => {
  //   const remote = new MediaStream();
  //   setRemoteStream(remote);

  //   // Pull tracks from peer connection, add to remote video stream
  //   yourConn.ontrack = event => {
  //     event.streams[0].getTracks().forEach(track => {
  //       remote.addTrack(track);
  //     });
  //   };

  // }, [remoteStream])

  useEffect(() => {
    if (CTX.socketObj) {
  //     // First we join a room
  //     CTX.socketObj.emit('join', roomName);

  //     CTX.socketObj.on('created', handleRoomCreated);

  //     CTX.socketObj.on('joined', handleRoomJoined);
  //     // If the room didn't exist, the server would emit the room was 'created'

  //     // Whenever the next person joins, the server emits 'ready'
  //     // CTX.socketObj.on('ready', initiateCall);

  //     // Emitted when a peer leaves the room
  //     CTX.socketObj.on('leave', onPeerLeave);

  //     // If the room is full, we show an alert
  //     CTX.socketObj.on('full', () => {
  //       navigation.navigate('Home');
  //     });

  //     // Events that are webRTC speccific
      CTX.socketObj.on('offer', handleReceivedOffer);
      CTX.socketObj.on('answer', handleAnswer);
      CTX.socketObj.on('ice-candidate', handlerNewIceCandidateMsg);
    }

  //   // clear up after
    return () => {
      CTX.socketObj.off('ice-candidate');
  //     CTX.socketObj.off('created');
  //     CTX.socketObj.off('joined');
  //     CTX.socketObj.off('ready');
  //     CTX.socketObj.off('ready');
    };
  }, [CTX.socketObj]);

  const handleRoomJoined = async () => {};

  const handleRoomCreated = async () => {};

  const onCall = () => {
    try {
      setCalling(true);
      yourConn.onicecandidate = async event => {
        if (event.candidate) {
          CTX.socketObj.emit('ice-candidate', event.candidate, roomName);

        }
      };

      yourConn.createOffer().then(offer => {
        yourConn.setLocalDescription(offer).then(() => {
          console.log('Sending Ofer');
          console.log(offer);
          CTX.socketObj.emit('offer', offer, roomName);
          // Send pc.localDescription to peer
        });
      });
    } catch (error) {
      console.log('initiateCall ERROR HERE!!!!!');
      console.log('initiateCall ERROR HERE!!!!!');
      console.log('initiateCall ERROR HERE!!!!!');
      console.log('initiateCall ERROR HERE!!!!!');
      console.log('initiateCall ERROR HERE!!!!!');
      console.log('initiateCall ERROR HERE!!!!! =====+>>>>>', error);
      console.log('initiateCall ERROR HERE!!!!!');
      console.log('initiateCall ERROR HERE!!!!!');
      console.log('initiateCall ERROR HERE!!!!!');
      console.log('initiateCall ERROR HERE!!!!!');
      console.log('initiateCall ERROR HERE!!!!!');
    }
  };

  const initiateCall = async () => {};

  const onPeerLeave = () => {};

  const handleReceivedOffer = async offer => {
    try {
      yourConn.onicecandidate = event => {
        if (event.candidate) {
          CTX.socketObj.emit('ice-candidate', event.candidate, roomName);
        }
      };

      // await yourConn.setRemoteDescription(new RTCSessionDescription(offer));
      
await yourConn.setRemoteDescription(offer);
      const answer = await yourConn.createAnswer();
      await yourConn.setLocalDescription(answer);
      CTX.socketObj.emit('answer', answer, roomName);
    } catch (err) {
      console.log('handleReceivedOffer ERROR HERE!!!!!');
      console.log('handleReceivedOffer ERROR HERE!!!!!');
      console.log('handleReceivedOffer ERROR HERE!!!!!');
      console.log('handleReceivedOffer ERROR HERE!!!!!');
      console.log('handleReceivedOffer ERROR HERE!!!!!');
      console.log('handleReceivedOffer ERROR HERE!!!!! =====+>>>>>', err);
      console.log('handleReceivedOffer ERROR HERE!!!!!');
      console.log('handleReceivedOffer ERROR HERE!!!!!');
      console.log('handleReceivedOffer ERROR HERE!!!!!');
      console.log('handleReceivedOffer ERROR HERE!!!!!');
      console.log('handleReceivedOffer ERROR HERE!!!!!');
    }
  };

  const handleAnswer = answer => {

    yourConn
      .setRemoteDescription(answer)
      .catch(err => console.log(err));


    // yourConn.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handlerNewIceCandidateMsg = async incoming => {
     // We cast the incoming candidate to RTCIceCandidate
     setCalling(false);
     console.log('Candidate ----------------->', incoming);
     const candidate = await new RTCIceCandidate(incoming);
     yourConn
       .addIceCandidate(candidate)
       .catch(e => console.log(e));



  };

  return (
    <View>
      {localStream ? (
        <>
          <RTCView
            streamURL={localStream?.toURL()}
            style={{height: 150, width: 150}}
            objectFit="cover"
            zOrder={20}
            mirror={true}
          />

          <Button
            mode="contained"
            onPress={onCall}
            style={styles.btn}
            title="Call"
            contentStyle={styles.btnContent}>
            <Text>Call</Text>
          </Button>
        </>
      ) : (
        <Text style={{color: 'red'}}>Loading Here</Text>
      )}

      {remoteStream ? (
        <RTCView
          streamURL={remoteStream?.toURL()}
          style={{height: 150, width: 150}}
          objectFit="cover"
          zOrder={20}
          mirror={true}
        />
      ) : (
        <Text style={{color: 'red'}}>Loading Here</Text>
      )}
    </View>
  );
};

export default Video;

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
  },
  inputField: {
    marginBottom: 10,
    flexDirection: 'column',
  },
  videoContainer: {
    flex: 1,
    minHeight: 450,
  },
  videos: {
    width: '100%',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',

    borderRadius: 6,
  },
  localVideos: {
    height: 100,
    marginBottom: 10,
  },
  remoteVideos: {
    height: 400,
  },
  localVideo: {
    backgroundColor: '#f2f2f2',
    height: '100%',
    width: '100%',
  },
  remoteVideo: {
    backgroundColor: '#f2f2f2',
    height: '100%',
    width: '100%',
  },
});
