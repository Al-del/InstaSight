import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private apiKey = '9325a41812344779bb83d89124ed47d0'; 

  constructor(private http: HttpClient) {}

  getCoordinates(location: string): Observable<{ lat: number; lng: number }> {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      location
    )}&key=${this.apiKey}`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.results && response.results.length > 0) {
          const { lat, lng } = response.results[0].geometry;
          return { lat, lng };
        } else {
          throw new Error('No results found for this location');
        }
      })
    );
  }
}
