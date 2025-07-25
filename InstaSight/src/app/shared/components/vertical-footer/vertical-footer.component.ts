import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  Input,
  OnInit,
  ElementRef,
  AfterViewInit,
  Renderer2,
  Output,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { UserdataService } from '../../service/userdata.service';

@Component({
  selector: 'app-vertical-footer',
  imports: [CommonModule, FormsModule],
  templateUrl: './vertical-footer.component.html',
  styleUrl: './vertical-footer.component.scss'
})
export class VerticalFooterComponent implements OnInit, AfterViewInit {
  @Input() email: string = '';
  @Input() username: string = '';
  activeRoute: string = '';
  isCollapsed: boolean = false;
  @Output() collapseStateChanged = new EventEmitter<boolean>();
  constructor(
    private userDataService: UserdataService,
    private router: Router,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.userDataService.currentUserData.subscribe(data => {
      this.email = data.email || this.email;
      this.username = data.username || this.username;
    });

    this.activeRoute = this.router.url;

    this.router.events.subscribe((event: any) => {
      if (event?.url) {
        this.activeRoute = event.url;
      }
    });
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && typeof (window as any).Hammer !== 'undefined') {
      const hammertime = new (window as any).Hammer(this.elRef.nativeElement);
  
      // Enable double tap
      hammertime.get('tap').set({ taps: 2 });
  
      // Handle double tap
      hammertime.on('doubletap', () => {
        this.goToNavigate(); // navigate to /home
      });
  
      // Optional: Handle swipe gestures
      hammertime.on('swipeleft', () => {
        this.isCollapsed = true;
      });
  
      hammertime.on('swiperight', () => {
        this.isCollapsed = false;
      });
    } else {
      console.warn('HammerJS not available.');
    }
  }
  

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseStateChanged.emit(this.isCollapsed);
  }

  goToNavigate() {
    this.router.navigate(['/home'], {
      state: { email: this.email, user: this.username }
    });
  }

  goToFriends() {
    this.userDataService.updateUserData({
      email: this.email,
      username: this.username
    });
    setTimeout(() => this.router.navigate(['/message']), 50);
  }

  goToView() {
    this.userDataService.updateUserData({
      email: this.email,
      username: this.username
    });
    setTimeout(() => this.router.navigate(['/view_loc']), 50);
  }
  goToBrain(){
    this.userDataService.updateUserData({
      email: this.email,
      username: this.username
    });
    setTimeout(() => this.router.navigate(['/brain']), 50);
  }
}