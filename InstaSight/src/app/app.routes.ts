import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StartPageComponent } from './start-page/start-page.component';
import { RegisterComponent } from './register/register.component';
export const routes: Routes = [
    {path : "login", component :LoginComponent },
    {path : "", component : StartPageComponent},
    {path : "register", component : RegisterComponent}
];
