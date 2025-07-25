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
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth'; // Add this import
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
  currentUserId: string | null = null; // Add this property to store the UID

  private audio?: HTMLAudioElement;
  private warningTimeout?: any;
  private hammer?: any;
  private authSubscription: any; // To store the auth state subscription
    private baseline : number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private webrtcService: WebrtcService,
    private elRef: ElementRef,
    private firestore: Firestore,
    private auth: Auth ,
 //  private speechService : TtsService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.audio = new Audio(
        'https://orangefreesounds.com/wp-content/uploads/2023/05/Audio-cassette-stop-sound-effect.mp3'
      );
    }
  }

  async ngAfterViewInit() {
    if (!this.isBrowser) return;

    // Initialize auth state listener
    this.authSubscription = onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        console.log('User UID:', this.currentUserId);
        
        this.initHammerGestures();
        await this.loadAndLogBaseline(this.currentUserId); // Use the actual UID
        this.checkCameraPermissionsAndStart();
        
        if (this.embeddedMode && this.localVideo?.nativeElement) {
          this.localVideo.nativeElement.style.objectFit = 'cover';
        }
      } else {
        console.log('No user is signed in');
        this.currentUserId = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription(); 
    }

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
    }
  }

  async initializeWebRTC() {
    try {
     await this.webrtcService.init(
  this.localVideo.nativeElement,
  (warning) => this.handleObjectWarning(warning),
  this.baseline,
  (eegWarning) => this.handleConcentrationWarning(eegWarning)
);
      console.log('WebRTC initialized');
    } catch (err) {
      console.error('Failed to initialize WebRTC:', err);
      this.errorMessage = 'Failed to initialize video connection. Please try again.';
    }
  }
  private async loadAndLogBaseline(uid: string | null): Promise<void> {
    if (!uid || uid === 'anonymous') {
      console.log('No user or anonymous - skipping baseline load');
      return;
    }

    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData && 'baseline' in userData) {
          const baselineData = userData['baseline'];
      //    console.log('🔥 Loaded baseline from Firestore:', baselineData.status);
          this.baseline = baselineData.status;
        } else {
          console.log('User document exists but has no baseline field');
        }
      } else {
        console.log('No user document found in Firestore');
      }
    } catch (error) {
      console.error('❌ Error loading baseline from Firestore:', error);
      this.errorMessage = 'Failed to load user data';
    }
  }
  handleConcentrationWarning(data: any) {
  const value = data.value?.toFixed(2);
  const threshold = data.threshold?.toFixed(2);
  const message = `⚠️ Concentration too low! (${value} < ${threshold})`;
  this.showWarning(message);
}
}
