using Microsoft.EntityFrameworkCore;
using GeoApi.Models;

namespace GeoApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Personal> Personal { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Servicio> Servicios { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<DetallePedido> DetallesPedidos { get; set; }
        public DbSet<Venta> Ventas { get; set; }
        public DbSet<DetalleVenta> DetallesVenta { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de Usuario
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasKey(e => e.UsuarioId);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Rol).IsRequired().HasMaxLength(50);
                entity.Property(e => e.FechaCreacion)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Activo).HasDefaultValue(true);

                // Índice único en email
                entity.HasIndex(e => e.Email).IsUnique();
            });

           // Configuración de Cliente
    modelBuilder.Entity<Cliente>(entity =>
    {
        entity.HasKey(e => e.ClienteId);
        entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
        entity.Property(e => e.ApellidoPaterno).IsRequired().HasMaxLength(100);
        entity.Property(e => e.ApellidoMaterno).HasMaxLength(100);
        entity.Property(e => e.DireccionEnvio).HasMaxLength(500);
        entity.Property(e => e.Telefono).HasMaxLength(20);

        // Relación uno a uno con Usuario
        entity.HasOne(c => c.Usuario)
            .WithOne(u => u.Cliente)
            .HasForeignKey<Cliente>(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación uno a muchos con Pedido (añadido)
        entity.HasMany(c => c.Pedidos)
            .WithOne(p => p.Cliente)
            .HasForeignKey(p => p.ClienteId)
            .OnDelete(DeleteBehavior.Cascade);
    });

            // Configuración de Personal
            modelBuilder.Entity<Personal>(entity =>
            {
                entity.HasKey(e => e.PersonalId);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ApellidoPaterno).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ApellidoMaterno).HasMaxLength(100);
                entity.Property(e => e.Puesto).HasMaxLength(100);
                entity.Property(e => e.FechaContratacion).HasColumnType("datetime");

                // Relación uno a uno con Usuario
                entity.HasOne(p => p.Usuario)
                    .WithOne(u => u.Personal)
                    .HasForeignKey<Personal>(p => p.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración de Proveedor
            modelBuilder.Entity<Proveedor>(entity =>
            {
                entity.HasKey(e => e.ProveedorId);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Contacto).HasMaxLength(100);
                entity.Property(e => e.Telefono).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(255);
                entity.Property(e => e.Direccion).HasMaxLength(500);
                entity.Property(e => e.Activo).HasDefaultValue(true);
                entity.Property(e => e.FechaRegistro)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Configuración de Producto
            modelBuilder.Entity<Producto>(entity =>
            {
                entity.HasKey(e => e.ProductoId);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Descripcion).HasColumnType("text");
                entity.Property(e => e.Precio).HasColumnType("decimal(10,2)");
                entity.Property(e => e.Stock).HasDefaultValue(0);
                entity.Property(e => e.Activo).HasDefaultValue(true);

                // Relación con Proveedor
                entity.HasOne(p => p.Proveedor)
                    .WithMany()
                    .HasForeignKey(p => p.ProveedorId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configuración de Servicio
            modelBuilder.Entity<Servicio>(entity =>
            {
                entity.HasKey(e => e.ServicioId);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Descripcion).HasColumnType("text");
                entity.Property(e => e.PrecioMensual).HasColumnType("decimal(10,2)");
                entity.Property(e => e.Activo).HasDefaultValue(true);
            });

            modelBuilder.Entity<Pedido>(entity =>
    {
        entity.HasKey(e => e.PedidoId);
        entity.Property(e => e.FechaPedido)
            .HasColumnType("datetime")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
        entity.Property(e => e.Estado).IsRequired().HasMaxLength(50).HasDefaultValue("pendiente");
        entity.Property(e => e.Total).HasColumnType("decimal(10,2)");

        // Relación con Cliente (actualizada para usar la navegación)
        entity.HasOne(p => p.Cliente)
            .WithMany(c => c.Pedidos)
            .HasForeignKey(p => p.ClienteId)
            .OnDelete(DeleteBehavior.Cascade);
    });

            // Configuración de DetallePedido
            modelBuilder.Entity<DetallePedido>(entity =>
            {
                entity.HasKey(e => e.DetallePedidoId);
                entity.Property(e => e.Cantidad).HasDefaultValue(1);
                entity.Property(e => e.PrecioUnitario).HasColumnType("decimal(10,2)");

                // Relaciones
                entity.HasOne(d => d.Pedido)
                    .WithMany(p => p.Detalles)
                    .HasForeignKey(d => d.PedidoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Producto)
                    .WithMany()
                    .HasForeignKey(d => d.ProductoId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(d => d.Servicio)
                    .WithMany()
                    .HasForeignKey(d => d.ServicioId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

                        // Configuración de Venta
            modelBuilder.Entity<Venta>(entity =>
            {
                entity.HasKey(e => e.VentaId);
                entity.Property(e => e.FechaVenta)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Total)
                    .HasColumnType("decimal(10,2)")
                    .IsRequired();
                entity.Property(e => e.TipoVenta)
                    .HasMaxLength(50);

                // Relación con Cliente
                entity.HasOne(v => v.Cliente)
                    .WithMany()
                    .HasForeignKey(v => v.ClienteId)
                    .OnDelete(DeleteBehavior.SetNull);

                // Relación con Personal
                entity.HasOne(v => v.Personal)
                    .WithMany()
                    .HasForeignKey(v => v.PersonalId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

                // Configuración de DetalleVenta
                modelBuilder.Entity<DetalleVenta>(entity =>
                {
                    entity.HasKey(e => e.DetalleVentaId);
                    entity.Property(e => e.Cantidad)
                        .HasDefaultValue(1);
                    entity.Property(e => e.PrecioUnitario)
                        .HasColumnType("decimal(10,2)");

                    // Relación con Venta
                    entity.HasOne(d => d.Venta)
                        .WithMany(v => v.DetallesVenta)
                        .HasForeignKey(d => d.VentaId)
                        .OnDelete(DeleteBehavior.Cascade);

                    // Relación con Producto
                    entity.HasOne(d => d.Producto)
                        .WithMany()
                        .HasForeignKey(d => d.ProductoId)
                        .OnDelete(DeleteBehavior.SetNull);

                    // Relación con Servicio
                    entity.HasOne(d => d.Servicio)
                        .WithMany()
                        .HasForeignKey(d => d.ServicioId)
                        .OnDelete(DeleteBehavior.SetNull);
                });

        }
    }
}