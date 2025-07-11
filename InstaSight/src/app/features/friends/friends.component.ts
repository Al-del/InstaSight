import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { WebrtcService } from '../../core/services/server_side/webrtc.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  imports: [CommonModule],  // Add this line
  standalone: true         // Add this if using standalone components
})
export class FriendsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('permissionButton', { static: false }) permissionButton!: ElementRef<HTMLButtonElement>;

  isBrowser: boolean;
  cameraAccessGranted = false;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private webrtcService: WebrtcService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async requestCameraPermission() {
    if (!this.isBrowser) return;

    this.isLoading = true;
    this.errorMessage = null;

    try {
      // First check if we already have permission
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoPermission = devices.some(device => device.kind === 'videoinput' && device.label);

      if (!hasVideoPermission) {
        // Request permission by trying to get media
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        // Immediately stop the stream since we just wanted permission
        stream.getTracks().forEach(track => track.stop());
      }

      this.cameraAccessGranted = true;
      this.initializeWebRTC();
    } catch (err) {
      console.error('Camera access denied:', err);
      this.errorMessage = 'Camera access was denied. Please allow camera access to continue.';
      this.cameraAccessGranted = false;
    } finally {
      this.isLoading = false;
    }
  }

  async initializeWebRTC() {
    try {
      await this.webrtcService.init(this.localVideo.nativeElement);
      console.log('WebRTC initialized');
      
      // Now get the stream for display
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      this.localVideo.nativeElement.srcObject = stream;
    } catch (err) {
      console.error('Failed to initialize WebRTC:', err);
      this.errorMessage = 'Failed to initialize video connection. Please try again.';
    }
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      // Check if we already have permission
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.cameraAccessGranted = devices.some(device => device.kind === 'videoinput' && device.label);
        
        if (this.cameraAccessGranted) {
          this.initializeWebRTC();
        }
      } catch (err) {
        console.error('Error checking camera permissions:', err);
      }
    }
  }

  ngOnDestroy() {
    this.webrtcService.destroy();
    if (this.localVideo?.nativeElement?.srcObject) {
      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }
}