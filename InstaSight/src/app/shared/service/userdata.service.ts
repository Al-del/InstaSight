// userdata.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' }) 
export class UserdataService {
  // BehaviorSubject stores current value and emits to subscribers
  private userData = new BehaviorSubject<{email: string, username: string}>({
    email: '',
    username: ''
  });

  // Expose as observable to prevent external .next() calls
  currentUserData = this.userData.asObservable();

  updateUserData(data: {email: string, username: string}) {
    this.userData.next(data); // Update the stored data
  }
}