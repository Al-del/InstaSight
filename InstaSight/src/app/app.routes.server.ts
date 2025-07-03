import { RenderMode, ServerRoute } from '@angular/ssr';
import { LoginComponent } from './login/login.component';
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
