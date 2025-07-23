import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  Input
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { WebrtcService } from '../../core/services/server_side/webrtc.service';
import { HammerModule } from '@angular/platform-browser';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  imports: [CommonModule, HammerModule],
  standalone: true
})
export class FriendsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('permissionButton', { static: false }) permissionButton!: ElementRef<HTMLButtonElement>;
  @Input() embeddedMode = false;

  warningActive = false;
  warningMessage = '';
  videoDevices: MediaDeviceInfo[] = [];
  currentDeviceIndex = 0;
  currentStream?: MediaStream;

  isBrowser: boolean;
  cameraAccessGranted = false;
  errorMessage: string | null = null;
  isLoading = false;
  private audio?: HTMLAudioElement;
  private warningTimeout?: any;

  private hammer?: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private webrtcService: WebrtcService,
    private elRef: ElementRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.audio = new Audio(
        'https://orangefreesounds.com/wp-content/uploads/2023/05/Audio-cassette-stop-sound-effect.mp3'
      );
    }
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    this.initHammerGestures();

    this.checkCameraPermissionsAndStart();
    
    if (this.embeddedMode && this.localVideo?.nativeElement) {
      this.localVideo.nativeElement.style.objectFit = 'cover';
    }
  }

  ngOnDestroy() {
    this.webrtcService.destroy();

    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }

    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
    }

    if (this.hammer) {
      this.hammer.destroy();
    }
  }

  private initHammerGestures() {
    if (typeof window !== 'undefined' && typeof (window as any).Hammer !== 'undefined') {
      this.hammer = new (window as any).Hammer(this.elRef.nativeElement);

      // Enable double tap gesture
      this.hammer.get('tap').set({ taps: 2 });

      this.hammer.on('doubletap', () => {
        this.switchCamera();
      });
    } else {
      console.warn('HammerJS not available.');
    }
  }

  private async checkCameraPermissionsAndStart() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameraAccessGranted = devices.some(device => device.kind === 'videoinput' && device.label);

      if (this.cameraAccessGranted) {
        await this.enumerateVideoDevices();
        await this.startCamera();
        await this.initializeWebRTC();
      }
    } catch (err) {
      console.error('Error checking camera permissions:', err);
    }
  }

  async requestCameraPermission() {
    if (!this.isBrowser) return;

    this.isLoading = true;
    this.errorMessage = null;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoPermission = devices.some(device => device.kind === 'videoinput' && device.label);

      if (!hasVideoPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.getTracks().forEach(track => track.stop());
      }

      this.cameraAccessGranted = true;
      await this.enumerateVideoDevices();
      await this.startCamera();
      await this.initializeWebRTC();
    } catch (err) {
      console.error('Camera access denied:', err);
      this.errorMessage = 'Camera access was denied. Please allow camera access to continue.';
      this.cameraAccessGranted = false;
    } finally {
      this.isLoading = false;
    }
  }

  async enumerateVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.videoDevices = devices.filter(d => d.kind === 'videoinput');
    console.log(`🎥 Found ${this.videoDevices.length} camera(s):`);
    this.videoDevices.forEach((d, i) =>
      console.log(`[${i}] ${d.label || 'Unnamed'} (${d.deviceId})`)
    );
  }

  async startCamera() {
    if (!this.videoDevices.length) return;

    const deviceId = this.videoDevices[this.currentDeviceIndex]?.deviceId;

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false
      };

      if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop());
      }

      this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.localVideo && this.localVideo.nativeElement) {
        this.localVideo.nativeElement.srcObject = this.currentStream;
      }

      console.log(`🎬 Using camera: ${this.videoDevices[this.currentDeviceIndex]?.label}`);
    } catch (err) {
      console.error('Error accessing camera:', err);
      this.errorMessage = 'Failed to access selected camera.';
    }
  }

  async switchCamera() {
    if (this.videoDevices.length <= 1) return;

    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = undefined;
    }

    this.currentDeviceIndex = (this.currentDeviceIndex + 1) % this.videoDevices.length;

    await this.startCamera();

    if (this.localVideo?.nativeElement && this.cameraAccessGranted && this.currentStream) {
      await this.webrtcService.replaceStream(this.currentStream);
    }
  }

  playOnlineSound() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(err => console.error('Could not play sound:', err));
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
    } catch (err) {
      console.error('Failed to initialize WebRTC:', err);
      this.errorMessage = 'Failed to initialize video connection. Please try again.';
    }
  }
}
