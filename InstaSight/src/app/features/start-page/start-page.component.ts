import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
@Component({
  selector: 'app-start-page',
  imports: [
    SharedModule
  ],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent {
 constructor(private router : Router) {}
  getStarted() {
    alert('Lets build something awesome! 🎉');
    this.router.navigate(["/login"])
  }

}
