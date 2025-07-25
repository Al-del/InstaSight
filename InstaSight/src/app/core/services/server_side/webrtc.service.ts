import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  private socket!: Socket;
  private pc!: RTCPeerConnection;
  private stream!: MediaStream;
  private warningCallback: ((warning: any) => void) | null = null;
  private baseline :number | null = null;
  private concentrationCallback: ((data: any) => void) | null = null;

async init(
  localVideo: HTMLVideoElement,
  warningCallback: (warning: any) => void,
  baseline: number,
  concentrationCallback?: (data: any) => void
): Promise<void> {
  this.baseline = baseline;
  this.warningCallback = warningCallback;
  this.concentrationCallback = concentrationCallback || null;

  this.socket = io('https://instasight.click/');

  this.socket.on('connect', () => {
    console.log('Socket.IO connected');
    if (this.baseline !== null) {
      this.socket.emit('baseline_info', { baseline: this.baseline });
    }
  });

  this.socket.on('object_warning', (data: any) => {
  console.log("⚠️ WARNING OBJECT!!", data);
  this.speak("Warning: Go slightly on " + data.safe_dir + "!");
  });

  this.socket.on('concentration_warning', (data: any) => {
    console.warn('⚠️ EEG Concentration Warning received:', data);
    if (this.concentrationCallback) {
      this.concentrationCallback(data);
    }
  });
    this.socket.on('message', async (data: any) => {
      console.log('Received from server:', data);

      if (data.type === 'answer') {
        try {
          await this.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
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

    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('message', {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    localVideo.srcObject = this.stream;

    this.stream.getTracks().forEach(track => {
      this.pc.addTrack(track, this.stream);
    });

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    this.socket.emit('message', {
      type: 'offer',
      offer: offer
    });
  }

  async replaceStream(newStream: MediaStream): Promise<void> {
    if (!this.pc) return;

    this.pc.getSenders().forEach(sender => {
      if (sender.track) {
        this.pc.removeTrack(sender);
      }
    });

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    this.stream = newStream;

    this.stream.getTracks().forEach(track => {
      this.pc.addTrack(track, this.stream);
    });

    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      this.socket.emit('message', {
        type: 'offer',
        offer: offer
      });
      console.log('🔄 WebRTC stream replaced successfully');
    } catch (err) {
      console.error('Error renegotiating WebRTC with new stream:', err);
    }
  }

  destroy(): void {
    this.warningCallback = null;
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
private isSpeakingCooldown = false;

private speak(message: string): void {
  if (this.isSpeakingCooldown) return;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);

  this.isSpeakingCooldown = true;
  setTimeout(() => {
    this.isSpeakingCooldown = false;
  }, 2500); // 500 milliseconds
}
}
