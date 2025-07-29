import { Component } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = "";
  password: string = "";

  constructor(private router: Router, private auth: Auth) {}

  get_into_account() {
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(userCredential => {
        const navigationExtras: NavigationExtras = {
          state: { user: "ok", email: this.email }
        };
        this.router.navigate(['/home'], navigationExtras);
      })
      .catch(error => alert(`Login failed: ${error.message}`));
  }

  sign_in_with_google() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(result => {
        const user = result.user;
        const navigationExtras: NavigationExtras = {
          state: { user: "ok", email: user.email }
        };
        this.router.navigate(['/home'], navigationExtras);
      })
      .catch(error => alert(`Google login failed: ${error.message}`));
  }

  go_to_register() {
    this.router.navigate(["/register"]);
  }
}
