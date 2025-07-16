import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  standalone : true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email : string = ""
  password : string = ""
 constructor(private router : Router,private auth : Auth) {}
 get_into_account(){
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(userCredential => {
        const navigationExtras: NavigationExtras = {
          state: {
            user: "ok",
            email: this.email,
          }
        };
        this.router.navigate(['/home'], navigationExtras); 
      })
      
      .catch(error => {
        alert(`Login failed: ${error.message}`);
      });
 }
  go_to_register(){
    this.router.navigate(["/register"]);
  }
}
