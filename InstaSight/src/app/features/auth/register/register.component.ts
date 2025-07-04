import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  mail :string = ""
  password : string = ""
  constructor(private router : Router, private auth : Auth) {}
  create_account(){
   createUserWithEmailAndPassword(this.auth, this.mail, this.password)
      .then((userCredential) => {
        alert(userCredential.user);
        // Optionally redirect to login or home
      })
      .catch((error) => {
        alert(error);
      });
 }
  go_to_login(){
    this.router.navigate(["/login"])
  }
}
