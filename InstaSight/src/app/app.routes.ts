import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { StartPageComponent } from './features/start-page/start-page.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { NavigationPageComponent } from './features/navigation-page/navigation-page.component';
import { FriendsComponent } from './features/friends/friends.component';
import { FriendsAddAndMessageComponent } from './features/friends-add-and-message/friends-add-and-message.component';
import { FriendsSeeLocationComponent } from './features/friends-see-location/friends-see-location.component';
export const routes: Routes = [
    {path : "login", component :LoginComponent },
    {path : "", component : StartPageComponent},
    {path : "register", component : RegisterComponent},
    {path : "home", component : HomeComponent},
    {path : "navigate", component : NavigationPageComponent},
    {path : "friends", component : FriendsComponent },
    {path : "message", component : FriendsAddAndMessageComponent},
    {path : "view_loc", component : FriendsSeeLocationComponent}
];
