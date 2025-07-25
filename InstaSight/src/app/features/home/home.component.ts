import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeocodingService } from '../../core/services/geocoding.service';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { VerticalFooterComponent } from '../../shared/components/vertical-footer/vertical-footer.component';
import { UserdataService } from '../../shared/service/userdata.service';
@Component({
  selector: 'app-home',
  standalone :true,
  imports: [ FormsModule, SharedModule, VerticalFooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  email: string = '';
  username: string = '';
  location: string = '';

  constructor(
    private geocodingService: GeocodingService, 
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as {
      email: string,
      user: string  // Changed to match what you're passing
    } | undefined;
    
    if (state) {
      this.email = state.email;
      this.username = state.user;  // Changed from state.user
    }
    console.log(this.email);
  }
  onStart() {
    if (this.location.trim()) {
      this.geocodingService.getCoordinates(this.location).subscribe({
        next: (coords) => {
          this.router.navigate(["navigate"], {
            queryParams : {lat : coords.lat, log: coords.lng}
          })
        },
        error: (err) => {
          alert('Sorry, could not find that location.');
          console.error(err);
        }
      });
    }
  }
startListening() {
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech recognition not supported in this browser.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    this.location = transcript;

    if (this.location.trim()) {
      this.onStart();
    }
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    alert('Could not recognize speech. Please try again.');
  };

  recognition.start();
}


}
