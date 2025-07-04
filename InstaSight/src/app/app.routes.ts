import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { StartPageComponent } from './features/start-page/start-page.component';
import { RegisterComponent } from './features/auth/register/register.component';
export const routes: Routes = [
    {path : "login", component :LoginComponent },
    {path : "", component : StartPageComponent},
    {path : "register", component : RegisterComponent}
];
