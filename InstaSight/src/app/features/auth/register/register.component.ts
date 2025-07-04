import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
constructor(private router : Router) {}
go_to_login(){
  this.router.navigate(["/login"])
}
}
