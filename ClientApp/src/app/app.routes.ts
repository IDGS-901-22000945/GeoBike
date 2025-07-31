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
import { ServiciosComponent } from './pages/admin/servicios/servicios.component';
import { RoleGuard } from './autenticacion/role.guard';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { MisPedidosComponent } from './pages/public/mis-pedidos/mis-pedidos.component';

export const routes: Routes = [
  // --- Sección de Administración ---
  {
  path: 'admin',
    component: AdminLayoutComponent,
    canActivateChild: [RoleGuard],
    data: { roles: ['admin', 'empleado'] },
    children: [
      { path: '', component: DashboardComponent, title: 'Panel de Administración', data: { roles: ['admin', 'empleado'] } },
      { path: 'empleados', component: EmpleadosComponent, title: 'Empleados', data: { roles: ['admin', 'empleado'] } },
      { path: 'proveedores', component: RegistrosProveedoresComponent, title: 'Proveedores', data: { roles: ['admin', 'empleado'] } },
      { path: 'productos', component: AdminProductosComponent, title: 'Productos', data: { roles: ['admin', 'empleado'] } },
      { path: 'ventas', component: VentasComponent, title: 'Ventas', data: { roles: ['admin', 'empleado'] } },
      { path: 'registros-clientes', component: RegistrosClientesComponent, title: 'Clientes', data: { roles: ['admin', 'empleado'] } },
      { path: 'servicios', component: ServiciosComponent, title: 'Servicios', data: { roles: ['admin', 'empleado'] } }
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
      },
      {
          path: 'mis-pedidos',
          component: MisPedidosComponent,
          title: 'Mis Pedidos'
        }
    ]
  },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];
