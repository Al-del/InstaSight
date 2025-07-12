import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, Input } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { WebrtcService } from '../../core/services/server_side/webrtc.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class FriendsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('permissionButton', { static: false }) permissionButton!: ElementRef<HTMLButtonElement>;
  @Input() embeddedMode = false;

  // Warning system properties
  warningActive = false;
  warningMessage = '';
  
  // Existing properties
  isBrowser: boolean;
  cameraAccessGranted = false;
  errorMessage: string | null = null;
  isLoading = false;
  private audio?: HTMLAudioElement;
  private warningTimeout?: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private webrtcService: WebrtcService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (isPlatformBrowser(this.platformId)) {
      this.audio = new Audio(
        'https://orangefreesounds.com/wp-content/uploads/2023/05/Audio-cassette-stop-sound-effect.mp3'
      );
    }
  }

  playOnlineSound() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch((err) => console.error('Could not play sound:', err));
    }
  }

  showWarning(message: string) {
    this.warningActive = true;
    this.warningMessage = message;
    this.playOnlineSound();
    
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }
    
    this.warningTimeout = setTimeout(() => {
      this.warningActive = false;
      this.warningMessage = '';
    }, 5000);
  }

  async requestCameraPermission() {
    if (!this.isBrowser) return;

    this.isLoading = true;
    this.errorMessage = null;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoPermission = devices.some(device => device.kind === 'videoinput' && device.label);

      if (!hasVideoPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
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

  handleObjectWarning(warning: any) {
    if (warning.warning === 'TOO_CLOSE') {
      const messages = warning.objects.map((obj: any) => 
        `Object too close! (Depth: ${obj.depth.toFixed(2)})`
      );
      this.showWarning(messages.join('\n'));
    }
  }

  async initializeWebRTC() {
    try {
      await this.webrtcService.init(
        this.localVideo.nativeElement,
        (warning) => this.handleObjectWarning(warning)
      );
      console.log('WebRTC initialized');
      
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

  async ngAfterViewInit() {  // Added async here
    if (this.isBrowser) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.cameraAccessGranted = devices.some(device => device.kind === 'videoinput' && device.label);
        
        if (this.cameraAccessGranted) {
          await this.initializeWebRTC();  // Added await here
        }
      } catch (err) {
        console.error('Error checking camera permissions:', err);
      }
    }

    // Add embedded mode adjustments
    if (this.embeddedMode && this.localVideo?.nativeElement) {
      this.localVideo.nativeElement.style.objectFit = 'cover';
    }
  }

  ngOnDestroy() {
    this.webrtcService.destroy();
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }
    if (this.localVideo?.nativeElement?.srcObject) {
      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }
}