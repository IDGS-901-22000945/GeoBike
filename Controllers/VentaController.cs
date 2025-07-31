using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GeoApi.Data;
using GeoApi.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GeoApi.Controllers
{
    [Route("api/ventas")]
[ApiController]
public class VentaController : ControllerBase
{
    private readonly AppDbContext _context;

    public VentaController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/ventas
[HttpPost]
public async Task<ActionResult<Venta>> CrearVenta(Venta venta)
{
    if (venta == null || venta.DetallesVenta == null || venta.DetallesVenta.Count == 0)
    {
        return BadRequest("La venta debe tener al menos un detalle.");
    }

    venta.FechaVenta = DateTime.Now;

    foreach (var detalle in venta.DetallesVenta)
    {
        // Si es un producto
        if (detalle.ProductoId.HasValue)
        {
            var producto = await _context.Productos.FindAsync(detalle.ProductoId.Value);

            if (producto == null)
            {
                return BadRequest($"Producto con ID {detalle.ProductoId} no encontrado.");
            }

            if (producto.Stock < detalle.Cantidad)
            {
                return BadRequest($"No hay suficiente stock para el producto {producto.Nombre}. Disponible: {producto.Stock}, solicitado: {detalle.Cantidad}.");
            }

            // Resta el stock
            producto.Stock -= detalle.Cantidad;

            // Establece el precio unitario desde el producto
            detalle.PrecioUnitario = producto.Precio;
        }
        // Si es un servicio
        else if (detalle.ServicioId.HasValue)
        {
            var servicio = await _context.Servicios.FindAsync(detalle.ServicioId.Value);

            if (servicio == null)
            {
                return BadRequest($"Servicio con ID {detalle.ServicioId} no encontrado.");
            }

            // Establece el precio unitario desde el servicio
            detalle.PrecioUnitario = servicio.PrecioMensual;
        }
        else
        {
            return BadRequest("Cada detalle de venta debe tener un ProductoId o un ServicioId.");
        }
    }

    _context.Ventas.Add(venta);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetVentaById), new { id = venta.VentaId }, venta);
}

    // GET: api/ventas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Venta>>> GetVentas()
    {
        return await _context.Ventas
            .Include(v => v.Cliente)
            .Include(v => v.Personal)
            .Include(v => v.DetallesVenta)
                .ThenInclude(d => d.Producto)
            .Include(v => v.DetallesVenta)
                .ThenInclude(d => d.Servicio)
            .ToListAsync();
    }

    // GET: api/ventas/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Venta>> GetVentaById(int id)
    {
        var venta = await _context.Ventas
            .Include(v => v.Cliente)
            .Include(v => v.Personal)
            .Include(v => v.DetallesVenta)
                .ThenInclude(d => d.Producto)
            .Include(v => v.DetallesVenta)
                .ThenInclude(d => d.Servicio)
            .FirstOrDefaultAsync(v => v.VentaId == id);

        if (venta == null)
        {
            return NotFound();
        }

        return venta;
    }
}

    }
