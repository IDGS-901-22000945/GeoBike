import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/public/layout/layout.component';
import { AdminComponent } from './pages/admin/admin.component';

import { HomeComponent } from './pages/public/home/home.component';
import { AboutComponent } from './pages/public/about/about.component';
import { ProductosComponent } from './pages/public/productos/productos.component';
import { LoginComponent } from './pages/public/login/login.component';
import { CarritoComponent } from './pages/public/carrito/carrito.component';

export const routes: Routes = [
  // --- Sección de Administración ---
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Panel de Administración'
  },

  // --- Sección Pública ---
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        title: 'GeoBike Shield'
      },
      {
        path: 'nosotros',
        component: AboutComponent,
        title: 'Nosotros'
      },
      {
        path: 'productos',
        component: ProductosComponent,
        title: 'Productos'
      },
      {
        path: 'login',
        component: LoginComponent,
        title: 'Login'
      },
      {
        path: 'carrito',
        component: CarritoComponent,
        title: 'Carrito'
      }
    ]
  },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];
