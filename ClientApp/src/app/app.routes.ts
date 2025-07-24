import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/public/layout/layout.component';
import { HomeComponent } from './pages/public/home/home.component';
import { AboutComponent } from './pages/public/about/about.component';
import { ProductosComponent } from './pages/public/productos/productos.component';
import { LoginComponent } from './pages/public/login/login.component';
import { CarritoComponent } from './pages/public/carrito/carrito.component';
import { RegistroComponent } from './pages/public/registro/registro.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout/admin-layout.component';
import { AdminComponent } from './pages/admin/admin.component';
import { EmpleadosComponent } from './pages/admin/empleados/empleados.component';
import { VentasComponent } from './pages/admin/ventas/ventas.component';
import { AdminProductosComponent } from './pages/admin/admin-productos/admin-productos.component';
import { RegistrosClientesComponent } from './pages/admin/registros-clientes/registros-clientes.component';
import { RegistrosProveedoresComponent } from './pages/admin/proveedores/proveedores.component';

export const routes: Routes = [
  // --- Sección de Administración ---
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        component: AdminComponent,
        title: 'Panel de Administración'
      },
      {
        path: 'empleados',
        component: EmpleadosComponent,
        title: 'Empleados'
      },
      {
        path: 'proveedores',
        component: RegistrosProveedoresComponent,
        title: 'Proveedores'
      },
      {
        path: 'productos',
        component: AdminProductosComponent,
        title: 'Productos'
      },
      {
        path: 'ventas',
        component: VentasComponent,
        title: 'Ventas'
      },
      {
        path: 'registros-clientes',
        component: RegistrosClientesComponent,
        title: 'Clientes'
      }
    ]
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
        path: 'registro',
        component: RegistroComponent,
        title: 'registro'
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
