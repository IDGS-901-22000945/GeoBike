import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/public/layout/layout.component';

export const routes: Routes = [
  // --- Sección Pública ---
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        title: 'GeoBike Shield'
      },
      {
        path: 'nosotros',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
        title: 'Nosotros'
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent),
        title: 'Productos'
      }
    ]
  },

  // --- Ruta comodín (404) ---
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
