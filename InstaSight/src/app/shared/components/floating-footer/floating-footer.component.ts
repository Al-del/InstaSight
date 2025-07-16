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
import { Router, NavigationEnd } from '@angular/router';
import { UserdataService } from '../../service/userdata.service';

@Component({
  selector: 'app-floating-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './floating-footer.component.html',
  styleUrl: './floating-footer.component.scss'
})
export class FloatingFooterComponent implements OnInit, AfterViewInit {
  @Input() email: string = '';
  @Input() username: string = '';
  @Output() collapseStateChanged = new EventEmitter<boolean>();

  activeRoute: string = '';
  isCollapsed: boolean = false;

  constructor(
    private userDataService: UserdataService,
    private router: Router,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Get user data
    this.userDataService.currentUserData.subscribe(data => {
      this.email = data.email || this.email;
      this.username = data.username || this.username;
    });

    // Track route changes
    this.activeRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeRoute = event.urlAfterRedirects;
      }
    });
  }

  ngAfterViewInit() {
    // Optional: Enable swipe/double-tap gestures (mobile UX)
    if (typeof window !== 'undefined' && (window as any).Hammer) {
      const hammer = new (window as any).Hammer(this.elRef.nativeElement);
      hammer.get('tap').set({ taps: 2 });

      hammer.on('doubletap', () => this.goToNavigate());
      hammer.on('swipeup', () => this.isCollapsed = true);
      hammer.on('swipedown', () => this.isCollapsed = false);
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
}
