import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VibrationService {
  vibrate(pattern: number | number[]) {
    if (!navigator.vibrate) {
      console.warn('Vibration API not supported');
      alert('Vibration API not supported');
      return false;
    }
    return navigator.vibrate(pattern);
  }
}
