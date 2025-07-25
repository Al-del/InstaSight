import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { HttpClient } from '@angular/common/http';

import { Auth, authState } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';

import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-insta-brain',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './insta-brain.component.html',
  styleUrls: ['./insta-brain.component.scss']
})
export class InstaBrainComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authStateSig = toSignal(authState(this.auth), { initialValue: null });
  private http = inject(HttpClient);

  isLoggedIn = computed(() => !!this.authStateSig());
  checking = computed(() => this.authStateSig() === null);

  recording = signal(false);
  progress = signal(0);
  private interval: any;

  private audio = new Audio('https://orangefreesounds.com/wp-content/uploads/2023/05/Audio-cassette-stop-sound-effect.mp3');

  constructor() {
    this.audio.loop = true;
    this.audio.preload = 'auto';
  }

  ngOnInit(): void {
    window.addEventListener('dblclick', this.handleDoubleTap);
  }

  ngOnDestroy(): void {
    window.removeEventListener('dblclick', this.handleDoubleTap);
  }

  handleDoubleTap = () => {
    if (!this.recording()) {
      this.startBaselineRecording();
    }
  };

  async startBaselineRecording() {
    this.recording.set(true);
    this.progress.set(0);

    this.audio.currentTime = 0;
    try {
      await this.audio.play();
    } catch (err) {
      console.error('Autoplay blocked or audio error:', err);
      alert('⚠️ Unable to play audio. Please interact with the page first.');
    }

    const uid = this.authStateSig()?.uid || 'anonymous';

    // ✅ Send request in background and save to Firestore
    lastValueFrom(this.http.post('http://instasight.click/baseline', {
      user: uid,
      timestamp: new Date().toISOString()
    })).then(async (response: any) => {
      console.log('✅ Baseline received:', response.status);

      if (uid !== 'anonymous') {
        const userDocRef = doc(this.firestore, `users/${uid}`);
        await setDoc(userDocRef, { baseline: response }, { merge: true });  // 🔥 merge into user's document
        console.log('✅ Baseline pushed as a field to Firestore');
      }
    }).catch(error => {
      console.error('❌ Error sending or saving baseline:', error);
    });

    const duration = 15;
    let elapsed = 0;

    this.interval = setInterval(() => {
      elapsed++;
      this.progress.set((elapsed / duration) * 100);
      if (elapsed >= duration) {
        this.stopBaselineRecording();
      }
    }, 1000);
  }

  stopBaselineRecording() {
    this.recording.set(false);
    clearInterval(this.interval);

    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.loop = false;

    alert('✅ Baseline recording complete!');
  }
}
