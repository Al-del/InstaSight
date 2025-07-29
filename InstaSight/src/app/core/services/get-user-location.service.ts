import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Location {
  latitude: number;
  longitude: number;
  source: 'gps' | 'ip' | 'unknown';
}

@Injectable({
  providedIn: 'root'
})
export class GetUserLocationService {

  constructor(private http: HttpClient) { }

  async getUserLocation(): Promise<Location> {
    try {
      // Try GPS first
      const position = await this.getPosition();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        source: 'gps'
      };
    } catch (gpsError) {
      try {
        const ipLocation = await firstValueFrom(this.http.get<any>('https://ipapi.co/json/'));
        return {
          latitude: ipLocation.latitude,
          longitude: ipLocation.longitude,
          source: 'ip'
        };
      } catch (ipError) {
        return {
          latitude: 0,
          longitude: 0,
          source: 'unknown'
        };
      }
    }
  }

  private getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by this browser.'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,    
          maximumAge: 0
        });
      }
    });
  }
}
