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
@Component({
  selector: 'app-navigation-page',
  standalone: true,
  templateUrl: './navigation-page.component.html',
  styleUrls: ['./navigation-page.component.scss'],
  providers: [GetUserLocationService],
  imports : [FriendsComponent]
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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private geoService: GetUserLocationService,
    private http: HttpClient
  ) {
    this.route.queryParams.subscribe(params => {
      this.destinationLat = +params['lat'];
      this.destinationLng = +params['log'];
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      const L = await import('leaflet');

      this.initializeMap(L);
      await this.initializeUserLocation(L);
      this.initializeDestinationMarker(L);
      await this.calculateAndDisplayRoute(L);
      
      this.startWatchingPosition(L);
    }
  }

  ngOnDestroy(): void {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  private initializeMap(L: any): void {
    this.map = L.map('map', {
      center: [39.8282, -98.5795],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  private async initializeUserLocation(L: any): Promise<void> {
    try {
      const userLocation = await this.geoService.getUserLocation();
      this.userLat = userLocation.latitude;
      this.userLng = userLocation.longitude;

      const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      this.userMarker = L.marker([this.userLat, this.userLng], {
        icon: blueIcon
      }).addTo(this.map);

      this.map.setView([this.userLat, this.userLng], 15);
    } catch (error) {
      console.error('Could not get user location:', error);
    }
  }

  private initializeDestinationMarker(L: any): void {
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.destinationMarker = L.marker([this.destinationLat, this.destinationLng], {
      icon: redIcon
    }).addTo(this.map);

    this.destinationMarker.bindPopup("Destination").openPopup();
  }

  private async calculateAndDisplayRoute(L: any): Promise<void> {
    try {
      // Use OSRM API to get the route
      const response: any = await this.http.get(
        `https://router.project-osrm.org/route/v1/driving/${this.userLng},${this.userLat};${this.destinationLng},${this.destinationLat}?overview=full&geometries=geojson`
      ).toPromise();

      if (response.routes && response.routes[0]) {
        const routeCoordinates = response.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        
        if (this.routePolyline) {
          this.routePolyline.setLatLngs(routeCoordinates);
        } else {
          this.routePolyline = L.polyline(routeCoordinates, {
            color: '#3b82f6',
            weight: 5,
            opacity: 0.7,
            lineJoin: 'round'
          }).addTo(this.map);
        }

        // Fit the map to the route bounds
        this.map.fitBounds(this.routePolyline.getBounds(), { padding: [50, 50] });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      // Fallback to straight line if routing fails
      this.updateRoutePolyline(L);
    }
  }

  private startWatchingPosition(L: any): void {
    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        async (position) => {
          this.userLat = position.coords.latitude;
          this.userLng = position.coords.longitude;

          // Update user marker
          if (this.userMarker) {
            this.userMarker.setLatLng([this.userLat, this.userLng]);
          } else {
            const blueIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });
            
            this.userMarker = L.marker([this.userLat, this.userLng], {
              icon: blueIcon
            }).addTo(this.map);
          }

          // Recalculate route when user moves significantly
          await this.calculateAndDisplayRoute(L);
          
          // Keep user in view (with some padding)
          this.map.setView([this.userLat, this.userLng], this.map.getZoom(), {
            animate: true,
            duration: 1
          });
        },
        (error) => {
          console.error('Error watching position:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
        }
      );
    }
  }

  // Fallback method for straight line route
  private updateRoutePolyline(L: any): void {
    const routeCoordinates = [
      [this.userLat, this.userLng],
      [this.destinationLat, this.destinationLng]
    ];

    if (this.routePolyline) {
      this.routePolyline.setLatLngs(routeCoordinates);
    } else {
      this.routePolyline = L.polyline(routeCoordinates, {
        color: 'blue',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(this.map);
    }
  }
}