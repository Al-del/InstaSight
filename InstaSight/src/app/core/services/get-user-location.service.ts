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
      // If GPS fails, fallback to IP geolocation
      try {
        const ipLocation = await firstValueFrom(this.http.get<any>('https://ipapi.co/json/'));
        return {
          latitude: ipLocation.latitude,
          longitude: ipLocation.longitude,
          source: 'ip'
        };
      } catch (ipError) {
        // If all fail, return unknown location 
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
          timeout: 10000,      // 10 seconds timeout
          maximumAge: 0
        });
      }
    });
  }
}
