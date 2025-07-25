import {
  Component,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GetUserLocationService } from '../../core/services/get-user-location.service';
import { HttpClient } from '@angular/common/http';
import { FriendsComponent } from '../friends/friends.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-navigation-page',
  standalone: true,
  templateUrl: './navigation-page.component.html',
  styleUrls: ['./navigation-page.component.scss'],
  providers: [GetUserLocationService],
  imports: [SharedModule, FriendsComponent]
})
export class NavigationPageComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private userMarker: any;
  private destinationMarker: any;
  private routePolyline: any;
  private watchId: number | null = null;

  destinationLat = 0;
  destinationLng = 0;
  userLat = 0;
  userLng = 0;

  private steps: any[] = [];
  private currentStepIndex: number = 0;
  private lastAnnouncedDirection: string | null = null;
  private previousPosition: { lat: number, lng: number, timestamp: number } | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private geoService: GetUserLocationService,
    private http: HttpClient
  ) {
    this.route.queryParams.subscribe(params => {
      this.destinationLat = +params['lat'];
      this.destinationLng = +params['log'];
      console.log('📍 Destination updated to:', this.destinationLat, this.destinationLng);
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      console.log('🏁 ngAfterViewInit started');
      const L = await import('leaflet');
      this.initializeMap(L);
      await this.initializeUserLocation(L);
      this.initializeDestinationMarker(L);
      await this.fetchRouteWithSteps();
      console.log('✅ Steps ready:', this.steps.length);
      this.startWatchingPosition(L);
    }
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      console.log('🛑 watchPosition cleared');
    }
  }

  private initializeMap(L: any): void {
    console.log('🗺️ Initializing map');
    this.map = L.map('map', { center: [39.8282, -98.5795], zoom: 13 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    setTimeout(() => this.map.invalidateSize(), 0);
  }

  private async initializeUserLocation(L: any): Promise<void> {
    try {
      const loc = await this.geoService.getUserLocation();
      this.userLat = loc.latitude;
      this.userLng = loc.longitude;
      console.log('📍 User location:', this.userLat, this.userLng);

      const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      this.userMarker = L.marker([this.userLat, this.userLng], { icon: blueIcon }).addTo(this.map);
      this.map.setView([this.userLat, this.userLng], 15);
    } catch (err) {
      console.error('❌ Could not get user location:', err);
    }
  }

  private initializeDestinationMarker(L: any): void {
    console.log('📌 Placing destination marker');
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    this.destinationMarker = L.marker([this.destinationLat, this.destinationLng], { icon: redIcon })
      .addTo(this.map)
      .bindPopup('Destination')
      .openPopup();
  }

  private async fetchRouteWithSteps(): Promise<void> {
    try {
      console.log('🚦 Fetching route steps');
      const url = `https://router.project-osrm.org/route/v1/foot/${this.userLng},${this.userLat};${this.destinationLng},${this.destinationLat}?overview=full&geometries=geojson&steps=true`;
      console.log('URL:', url);
      const res: any = await this.http.get(url).toPromise();
      console.log('OSRM response:', res);

      if (res.routes?.length) {
        const route = res.routes[0];
        this.steps = route.legs[0].steps;
        console.log('Parsed steps (#):', this.steps.length);

        const L = await import('leaflet');
        const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        this.routePolyline = this.routePolyline
          ? this.routePolyline.setLatLngs(coords)
          : L.polyline(coords, { color: '#3b82f6', weight: 5, opacity: 0.7, lineJoin: 'round' }).addTo(this.map);
      } else {
        console.error('❌ No route found in response');
      }
    } catch (err) {
      console.error('❌ Error fetching route:', err);
    }
  }

  private startWatchingPosition(L: any): void {
    if (!('geolocation' in navigator)) {
      console.error('❌ Geolocation not supported');
      return;
    }

    console.log('🔁 Starting watchPosition');
    this.watchId = navigator.geolocation.watchPosition(
      pos => {
        const now = Date.now();
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log("📍 Position updated: ${lat}, ${lng} @ ${new Date(now).toLocaleTimeString()}");

        let heading = 0;
        if (this.previousPosition && now - this.previousPosition.timestamp < 10000) {
          heading = this.calculateBearing(this.previousPosition.lat, this.previousPosition.lng, lat, lng);
        }
        console.log('  • prevPos:', this.previousPosition, '| heading:', heading);

        this.userLat = lat; this.userLng = lng;
        this.userMarker?.setLatLng([lat, lng]);
        this.previousPosition = { lat, lng, timestamp: now };

        this.checkStepProximityAndAnnounce(heading);
      },
      err => console.error('❌ watchPosition error:', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    console.log('✅ watchPosition ID:', this.watchId);
  }

  private checkStepProximityAndAnnounce(userHeading: number): void {
    if (!this.steps.length) {
      console.warn('⚠️ No steps to follow');
      return;
    }
    if (this.currentStepIndex >= this.steps.length) {
      console.log('✅ All steps completed');
      return;
    }

    const cs = this.steps[this.currentStepIndex];
    console.log("🔁 Evaluating step #${this.currentStepIndex}, cs");

    const [lng, lat] = cs.maneuver.location;
    const dist = this.calculateDistanceMeters(this.userLat, this.userLng, lat, lng);
    console.log('  • Distance to maneuver:', dist);

    if (dist <= 15) {
      const bearingAfter = cs.maneuver.bearing_after;
      const rel = this.getRelativeDirection(userHeading, bearingAfter);
      console.log('  • bearingAfter:', bearingAfter, '| relative direction:', rel);

      if (rel.direction !== this.lastAnnouncedDirection) {
        this.lastAnnouncedDirection = rel.direction;
        console.log(rel.direction);
        let text = '';
        switch (rel.direction) {
          case 'straight': text = 'Continue straight'; break;
          case 'slight-right': text = 'Slight right'; break;
          case 'right': text = 'Turn right'; break;
          case 'sharp-right': text = 'Sharp right'; break;
          case 'slight-left': text = 'Slight left'; break;
          case 'left': text = 'Turn left'; break;
          case 'sharp-left': text = 'Sharp left'; break;
          case 'back': text = 'Turn around'; break;
        }
        if (cs.name) text += ` onto ${cs.name}`;
        console.log('  📣 Using alert():', text);
        alert(text);
      }

      if (dist <= 5) {
        console.log('  ⏭ Advancing to next step');
        this.currentStepIndex++;
        this.lastAnnouncedDirection = null;
      }
    }
  }
private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = this.deg2rad(lat2 - lat1);
  const dLon = this.deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


  private deg2rad(deg: number): number { return deg * Math.PI/180; }
  private rad2deg(rad: number): number { return rad * 180/Math.PI; }

  private calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const φ1 = this.deg2rad(lat1), φ2 = this.deg2rad(lat2), Δλ = this.deg2rad(lon2 - lon1);
    const y = Math.sin(Δλ)*Math.cos(φ2);
    const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    return (this.rad2deg(Math.atan2(y, x)) + 360) % 360;
  }

  private getRelativeDirection(userHeading: number, targetBearing: number): { direction: string; angle: number } {
    userHeading = (userHeading + 360) % 360;
    targetBearing = (targetBearing + 360) % 360;
    let diff = targetBearing - userHeading;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const absDiff = Math.abs(diff);
    if (absDiff <= 20) return { direction: 'straight', angle: diff };
    if (diff > 20 && diff <= 60) return { direction: 'slight-right', angle: diff };
    if (diff > 60 && diff <= 120) return { direction: 'right', angle: diff };
    if (diff > 120 && diff <= 180) return { direction: 'sharp-right', angle: diff };
    if (diff < -20 && diff >= -60) return { direction: 'slight-left', angle: diff };
    if (diff < -60 && diff >= -120) return { direction: 'left', angle: diff };
    if (diff < -120 && diff >= -180) return { direction: 'sharp-left', angle: diff };
    return { direction: 'straight', angle: diff };
  }
}