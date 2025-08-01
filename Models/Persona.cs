using System.ComponentModel.DataAnnotations;
namespace GeoApi.Models
{
    public class Usuario
    {
        public int UsuarioId { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Rol { get; set; } // 'cliente', 'empleado'
        public DateTime FechaCreacion { get; set; }
        public bool Activo { get; set; }

        // Relaciones
        public Cliente Cliente { get; set; }
        public Personal Personal { get; set; }
    }

    public class Cliente
    {
        public int ClienteId { get; set; }
        public int UsuarioId { get; set; }
        public string Nombre { get; set; }
        public string ApellidoPaterno { get; set; }
        public string ApellidoMaterno { get; set; }
        public string DireccionEnvio { get; set; }
        public string Telefono { get; set; }

        public Usuario Usuario { get; set; }
        public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();

    }

    public class Personal
    {
        public int PersonalId { get; set; }
        public int UsuarioId { get; set; }
        public string Nombre { get; set; }
        public string ApellidoPaterno { get; set; }
        public string ApellidoMaterno { get; set; }
        public string Puesto { get; set; }
        public DateTime? FechaContratacion { get; set; }

        public Usuario Usuario { get; set; }
    }

    public class Proveedor
    {
        public int ProveedorId { get; set; }
        public string Nombre { get; set; }
        public string Contacto { get; set; }
        public string Telefono { get; set; }
        public string Email { get; set; }
        public string Direccion { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaRegistro { get; set; }
    }

    public class Producto
    {
        public int ProductoId { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public bool Activo { get; set; }

        // Relación con Proveedor (opcional)
        public int? ProveedorId { get; set; }
        public Proveedor Proveedor { get; set; }
        public string ImagenBase64 { get; set; }

    }

    public class Servicio
    {
        public int ServicioId { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public decimal PrecioMensual { get; set; }
        public bool Activo { get; set; }
    }

    public class Pedido
    {
        public int PedidoId { get; set; }
        public int ClienteId { get; set; }
        public DateTime FechaPedido { get; set; }
        public string Estado { get; set; } // 'pendiente', 'procesando', 'completado', 'cancelado'
        public decimal Total { get; set; }

        public Cliente Cliente { get; set; }
        public ICollection<DetallePedido> Detalles { get; set; } = new List<DetallePedido>(); // Inicializa la colección
    }

    public class DetallePedido
    {
        [Key]
        public int DetallePedidoId { get; set; }  // Mejor nombre para seguir convenciones

        public int PedidoId { get; set; }
        public int? ProductoId { get; set; }
        public int? ServicioId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }

        // Relaciones
        public Pedido Pedido { get; set; }
        public Producto Producto { get; set; }
        public Servicio Servicio { get; set; }
    }

    public class Venta
    {
        public int VentaId { get; set; }
        public DateTime FechaVenta { get; set; }
        public decimal Total { get; set; }
        public string TipoVenta { get; set; } // "producto", "servicio", etc.

        // Relación con el cliente o personal (quien la realizó)
        public int? ClienteId { get; set; }
        public Cliente Cliente { get; set; }

        public int? PersonalId { get; set; }
        public Personal Personal { get; set; }

        public List<DetalleVenta> DetallesVenta { get; set; }
    }
    public class DetalleVenta
    {
        public int DetalleVentaId { get; set; }

        public int VentaId { get; set; }
        public Venta Venta { get; set; }

        public int? ProductoId { get; set; }
        public Producto Producto { get; set; }

        public int? ServicioId { get; set; }
        public Servicio Servicio { get; set; }

        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }


}