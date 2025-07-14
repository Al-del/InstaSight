import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VibrationToBraileService {
  brailleMap: Record<string, number[]> = {
    a: [1],
    b: [1, 2],
    c: [1, 4],
    d: [1, 4, 5],
    e: [1, 5],
    f: [1, 2, 4],
    g: [1, 2, 4, 5],
    h: [1, 2, 5],
    i: [2, 4],
    j: [2, 4, 5],
    k: [1, 3],
    l: [1, 2, 3],
    m: [1, 3, 4],
    n: [1, 3, 4, 5],
    o: [1, 3, 5],
    p: [1, 2, 3, 4],
    q: [1, 2, 3, 4, 5],
    r: [1, 2, 3, 5],
    s: [2, 3, 4],
    t: [2, 3, 4, 5],
    u: [1, 3, 6],
    v: [1, 2, 3, 6],
    w: [2, 4, 5, 6],
    x: [1, 3, 4, 6],
    y: [1, 3, 4, 5, 6],
    z: [1, 3, 5, 6],
    ' ': [],
  };
  vibrateBraille(text: string) {
    if (!('vibrate' in navigator)) {
      console.warn('Vibration not supported.');
      return;
    }
  
    const unit = 100; // ms per dot
    const gap = 50;   // between dots
    const charGap = 200; // between letters
  
    const pattern: number[] = [];
  
    text = text.toLowerCase();
  
    for (const char of text) {
      const dots = this.brailleMap[char] || [];
      for (let i = 1; i <= 6; i++) {
        if (dots.includes(i)) {
          pattern.push(unit); // vibrate
        } else {
          pattern.push(0); // no vibration
        }
        if (i < 6) pattern.push(gap); // inter-dot gap
      }
      pattern.push(charGap); // pause between characters
    }
  
    navigator.vibrate(pattern);
  }
  
  constructor() { }
}
