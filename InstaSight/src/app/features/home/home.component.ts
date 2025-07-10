import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeocodingService } from '../../core/services/geocoding.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone :true,
  imports: [ FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  location: string = '';
  constructor(private geocodingService : GeocodingService, private router : Router) {}

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
}
