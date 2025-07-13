import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SharedModule } from '../../shared/shared.module';
import { Subscription } from 'rxjs';
import { UserdataService } from '../../shared/service/userdata.service';
import { VerticalFooterComponent } from '../../shared/components/vertical-footer/vertical-footer.component';

@Component({
  selector: 'app-friends-see-location',
  imports: [SharedModule, VerticalFooterComponent],
  templateUrl: './friends-see-location.component.html',
  styleUrl: './friends-see-location.component.scss'
})
export class FriendsSeeLocationComponent implements OnInit, OnDestroy {
  map!: L.Map;
  currentUserId!: string;
  markers: { [uid: string]: L.Marker } = {};
  email: string = '';
  username: string = '';
  private subscription!: Subscription; // Definite assignment assertion

  constructor(
    private userDataService: UserdataService, 
    private afAuth: AngularFireAuth, 
    private afs: AngularFirestore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then(L => {
        this.afAuth.authState.subscribe(user => {
          if (user) {
            this.currentUserId = user.uid;
  
            // Save reference to L so it's available elsewhere
            (this as any).L = L;
  
            this.initMap();
            this.trackAndSaveLocation();
            this.loadFriendsLocations();
          }
        });
      });
    }
  }
  
  
  initMap(): void {
    const L = (this as any).L;
    this.map = L.map('leaflet-map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }
  trackAndSaveLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        pos => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };

          this.afs.doc(`users/${this.currentUserId}`).set({ location: coords }, { merge: true });

          this.addOrUpdateMarker(this.currentUserId, coords.lat, coords.lng, 'You');
          this.map.setView([coords.lat, coords.lng], 13);
        },
        err => console.error('Location error:', err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }
  }
  async loadFriendsLocations(): Promise<void> {
    const friendsRef = this.afs.collection(`users/${this.currentUserId}/friends`);
    const friendsSnap = await friendsRef.get().toPromise();

    for (const doc of friendsSnap?.docs || []) {
      const friendId = doc.id;
      this.afs.doc(`users/${friendId}`).valueChanges().subscribe((data: any) => {
        if (data?.location) {
          this.addOrUpdateMarker(friendId, data.location.lat, data.location.lng, data.email);
        }
      });
    }
  }
  addOrUpdateMarker(uid: string, lat: number, lng: number, label: string): void {
    const isMe = uid === this.currentUserId;
    const iconColor = isMe ? 'blue' : 'red';
    const iconUrl = `https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@1.0.0/img/marker-icon-${iconColor}.png`;
    const iconUrl2x = `https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@1.0.0/img/marker-icon-2x-${iconColor}.png`;
    const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'; // standard shadow :contentReference[oaicite:1]{index=1}
    const L = (this as any).L;

    const icon = L.icon({
      iconUrl,
      iconRetinaUrl: iconUrl2x,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  
    if (this.markers[uid]) {
      this.markers[uid].setLatLng([lat, lng]);
    } else {
      this.markers[uid] = L.marker([lat, lng], { icon })
        .bindPopup(label)
        .addTo(this.map);
    }
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}