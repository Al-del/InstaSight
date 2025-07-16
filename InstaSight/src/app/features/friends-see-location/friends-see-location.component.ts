import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { GeocodingService } from '../../core/services/geocoding.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-friends-see-location',
  templateUrl: './friends-see-location.component.html',
  styleUrls: ['./friends-see-location.component.scss'],
  standalone: true,
  imports: [SharedModule],
})
export class FriendsSeeLocationComponent implements OnInit, OnDestroy {
  map: any;
  marker: any;
  friendsMarkers: { [uid: string]: any } = {};
  locationSubscription: Subscription | undefined;
  myUid: string | null = null;
  myAddressString = 'Constanta, Romania';
  
  // Web URLs for marker icons
  private readonly MY_MARKER_URL = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png';
  private readonly FRIEND_MARKER_URL = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private firestore: Firestore,
    private auth: Auth,
    private geocodingService: GeocodingService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then((L) => {
        this.initMap(L);
        this.watchFriends(L);
        this.getLocationFromAddress(this.myAddressString, L);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }

  private initMap(L: typeof import('leaflet')): void {
    this.map = L.map('map').setView([44.1746, 28.628], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private getLocationFromAddress(address: string, L: typeof import('leaflet')): void {
    this.geocodingService.getCoordinates(address).subscribe(
      ({ lat, lng }) => {
        this.saveMyLocation(lat, lng);
        this.updateMyMarker(lat, lng, L);
      },
      (error) => {
        console.error('Geocoding failed:', error);
      }
    );
  }

  private saveMyLocation(lat: number, lng: number): void {
    const user = this.auth.currentUser;
    if (!user) return;

    this.myUid = user.uid;

    const locationRef = doc(
      collection(this.firestore, 'locations'),
      this.myUid
    );
    setDoc(locationRef, { lat, lng });
  }

  private updateMyMarker(lat: number, lng: number, L: typeof import('leaflet')): void {
    if (!this.map) return;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: this.MY_MARKER_URL,
          iconSize: [32, 32],
          iconAnchor: [16, 32],  // Point of the icon which will correspond to marker's location
          popupAnchor: [0, -32]  // Point from which the popup should open relative to the iconAnchor
        }),
      }).addTo(this.map);
    }

    this.map.setView([lat, lng], 13);
  }

  private watchFriends(L: typeof import('leaflet')): void {
    const user = this.auth.currentUser;
    if (!user) return;

    const friends = ['friend_uid_1', 'friend_uid_2']; // replace with actual logic

    friends.forEach((friendUid) => {
      const friendDocRef = doc(this.firestore, 'locations', friendUid);
      onSnapshot(friendDocRef, (docSnap) => {
        const data = docSnap.data();
        if (data && data['lat'] && data['lng']) {
          this.updateFriendMarker(friendUid, data['lat'], data['lng'], L);
        }
      });
    });
  }

  private updateFriendMarker(uid: string, lat: number, lng: number, L: typeof import('leaflet')): void {
    if (!this.map) return;

    if (this.friendsMarkers[uid]) {
      this.friendsMarkers[uid].setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: this.FRIEND_MARKER_URL,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        }),
      }).addTo(this.map);

      this.friendsMarkers[uid] = marker;
    }
  }
}