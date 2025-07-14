import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { VibrationToBraileService } from '../../shared/service/vibration-to-braile.service';
@Component({
  selector: 'app-start-page',
  imports: [
    SharedModule,
    
  ],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent {
  longPressTimeout: any;
  constructor(private router : Router, private vib : VibrationToBraileService) {}

onPressStart() {
  this.longPressTimeout = setTimeout(() => {
    this.onLongPress();
  }, 300); // long press threshold in ms
}

onPressEnd() {
  clearTimeout(this.longPressTimeout);
}

onLongPress() {
  // Your long-press logic here
  console.log('Long press detected!');
  this.vib.vibrateBraille('start'); // Example
}

  getStarted() {
    this.router.navigate(["/login"])
  }

}
