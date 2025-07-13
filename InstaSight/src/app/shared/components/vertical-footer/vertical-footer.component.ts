import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserdataService } from '../../service/userdata.service';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-vertical-footer',
  imports: [CommonModule, FormsModule],
  templateUrl: './vertical-footer.component.html',
  styleUrl: './vertical-footer.component.scss'
})
export class VerticalFooterComponent implements OnInit {
  @Input() email: string = '';
  @Input() username: string = '';
  activeRoute: string = '';  // <-- track the current route

  constructor(private userDataService: UserdataService, private router: Router) {}

  ngOnInit() {
    this.userDataService.currentUserData.subscribe(data => {
      this.email = data.email || this.email;
      this.username = data.username || this.username;
    });

    // Get initial route
    this.activeRoute = this.router.url;

    // Update active route on navigation
    this.router.events.subscribe((event: any) => {
      if (event?.url) {
        this.activeRoute = event.url;
      }
    });
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

  goToView(){
    this.userDataService.updateUserData({
      email: this.email,
      username: this.username
    });
    setTimeout(() => this.router.navigate(['/view_loc']), 50);
  }
}
