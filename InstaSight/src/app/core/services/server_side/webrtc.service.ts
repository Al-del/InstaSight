import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  private socket!: Socket;
  private pc!: RTCPeerConnection;
  private stream!: MediaStream;

  async init(localVideo: HTMLVideoElement): Promise<void> {
    // Connect to Socket.IO server
    this.socket = io('http://localhost:5000');

    // Set up event handlers for signaling messages
    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    this.socket.on('message', async (data: any) => {
      console.log('Received from server:', data);

      if (data.type === 'answer') {
        try {
          await this.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log('Remote description set successfully');
        } catch (err) {
          console.error('Failed to set remote description:', err);
        }
      } else if (data.type === 'ice-candidate') {
        if (data.candidate) {
          try {
            await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
      }
    });

    // Create RTCPeerConnection with STUN server config
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers if needed for NAT traversal
      ],
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    // When new ICE candidates are found, send them to the server
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('message', {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    // Get local media stream and display it in the video element
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      localVideo.srcObject = this.stream;

      // Add local tracks to the peer connection
      this.stream.getTracks().forEach(track => {
        this.pc.addTrack(track, this.stream);
      });

      // Create an offer with proper options
      const offer = await this.pc.createOffer({
        offerToReceiveVideo: false, // We're only sending
        offerToReceiveAudio: false
      });
      
      await this.pc.setLocalDescription(offer);

      // Send the offer to the signaling server
      this.socket.emit('message', {
        type: 'offer',
        offer: offer
      });
    } catch (err) {
      console.error('Error initializing WebRTC:', err);
      throw err;
    }
  }

  destroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.pc) {
      this.pc.close();
    }
  }
}