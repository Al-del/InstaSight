import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email: string = "";
  password: string = "";
  fullName: string = "";
  username: string = "";
  confirmPassword: string = "";

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore
  ) {}

  async createAccount() {
    if (this.password !== this.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      // Save additional user info to Firestore
      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
        email: this.email,
        fullName: this.fullName,
        username: this.username,
        createdAt: new Date().toISOString()
      });

      alert('Account created successfully!');
      this.router.navigate(['/dashboard']);
    } catch (error) {
      alert(this.getErrorMessage(error));
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email already in use';
      case 'auth/invalid-email':
        return 'Invalid email';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      default:
        return 'Registration failed. Please try again.';
    }
  }
}