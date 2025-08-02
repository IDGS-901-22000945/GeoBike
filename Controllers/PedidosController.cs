using GeoApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using GeoApi.Data;

namespace GeoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PedidosController> _logger;

        public PedidosController(AppDbContext context, ILogger<PedidosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/pedidos/cliente/{clienteId}
        [HttpGet("cliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<PedidoDto>>> GetPedidosPorCliente(int clienteId)
        {
            try
            {
                var pedidos = await _context.Pedidos
                    .Where(p => p.ClienteId == clienteId)
                    .Include(p => p.Detalles)
                    .ThenInclude(d => d.Producto)
                    .Include(p => p.Detalles)
                    .ThenInclude(d => d.Servicio)
                    .OrderByDescending(p => p.FechaPedido)
                    .Select(p => new PedidoDto
                    {
                        PedidoId = p.PedidoId,
                        FechaPedido = p.FechaPedido,
                        Estado = p.Estado,
                        Total = p.Total,
                        Detalles = p.Detalles.Select(d => new DetallePedidoDto
                        {
                            Nombre = d.Producto != null ? d.Producto.Nombre : d.Servicio.Nombre,
                            Tipo = d.Producto != null ? "Producto" : "Servicio",
                            Cantidad = d.Cantidad,
                            PrecioUnitario = d.PrecioUnitario
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo pedidos del cliente {ClienteId}", clienteId);
                return StatusCode(500, "Error interno al obtener pedidos");
            }
        }

        // GET: api/pedidos/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PedidoDto>> GetPedido(int id)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.Detalles)
                .ThenInclude(d => d.Producto)
                .Include(p => p.Detalles)
                .ThenInclude(d => d.Servicio)
                .FirstOrDefaultAsync(p => p.PedidoId == id);

            if (pedido == null)
            {
                return NotFound();
            }

            return new PedidoDto
            {
                PedidoId = pedido.PedidoId,
                FechaPedido = pedido.FechaPedido,
                Estado = pedido.Estado,
                Total = pedido.Total,
                Detalles = pedido.Detalles.Select(d => new DetallePedidoDto
                {
                    Nombre = d.Producto != null ? d.Producto.Nombre : d.Servicio.Nombre,
                    Tipo = d.Producto != null ? "Producto" : "Servicio",
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario
                }).ToList()
            };
        }

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("pong");
        }


        // POST: api/pedidos
        [HttpPost]
        public async Task<ActionResult<Pedido>> CrearPedido([FromBody] CrearPedidoDto pedidoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Crear el pedido principal
                    var pedido = new Pedido
                    {
                        ClienteId = pedidoDto.ClienteId,
                        FechaPedido = DateTime.UtcNow,
                        Estado = "pendiente",
                        Total = 0,
                        Detalles = new List<DetallePedido>()
                    };

                    _context.Pedidos.Add(pedido);
                    await _context.SaveChangesAsync();

                    decimal totalPedido = 0;

                    // Procesar cada item del pedido
                    foreach (var item in pedidoDto.Items)
                    {
                        decimal precioUnitario = 0;

                        if (item.Tipo == "producto")
                        {
                            var producto = await _context.Productos.FindAsync(item.ItemId);
                            if (producto == null)
                            {
                                await transaction.RollbackAsync();
                                return BadRequest($"Producto con ID {item.ItemId} no encontrado");
                            }
                            precioUnitario = producto.Precio;
                        }
                        else if (item.Tipo == "servicio")
                        {
                            var servicio = await _context.Servicios.FindAsync(item.ItemId);
                            if (servicio == null)
                            {
                                await transaction.RollbackAsync();
                                return BadRequest($"Servicio con ID {item.ItemId} no encontrado");
                            }
                            precioUnitario = servicio.PrecioMensual;
                        }

                        var detalle = new DetallePedido
                        {
                            PedidoId = pedido.PedidoId,
                            ProductoId = item.Tipo == "producto" ? item.ItemId : null,
                            ServicioId = item.Tipo == "servicio" ? item.ItemId : null,
                            Cantidad = item.Cantidad,
                            PrecioUnitario = precioUnitario
                        };

                        totalPedido += precioUnitario * item.Cantidad;
                        pedido.Detalles.Add(detalle);
                    }

                    // Actualizar el total del pedido
                    pedido.Total = totalPedido;
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    return CreatedAtAction(nameof(GetPedido), new { id = pedido.PedidoId }, pedido);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Error creando pedido");
                    return StatusCode(500, "Error interno al crear el pedido");
                }
            });
        }

        // GET: api/pedidos
[HttpGet]
public async Task<ActionResult<IEnumerable<PedidoDto>>> GetTodosPedidos()
{
    try
    {
        var pedidos = await _context.Pedidos
            .Include(p => p.Detalles)
            .ThenInclude(d => d.Producto)
            .Include(p => p.Detalles)
            .ThenInclude(d => d.Servicio)
            .OrderByDescending(p => p.FechaPedido)
            .Select(p => new PedidoDto
            {
                PedidoId = p.PedidoId,
                FechaPedido = p.FechaPedido,
                Estado = p.Estado,
                Total = p.Total,
                Detalles = p.Detalles.Select(d => new DetallePedidoDto
                {
                    Nombre = d.Producto != null ? d.Producto.Nombre : d.Servicio.Nombre,
                    Tipo = d.Producto != null ? "Producto" : "Servicio",
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario
                }).ToList()
            })
            .ToListAsync();

        return Ok(pedidos);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error obteniendo todos los pedidos");
        return StatusCode(500, "Error interno al obtener pedidos");
    }
}


        // PUT: api/pedidos/{id}/estado
    [HttpPut("{id}/estado")]
public IActionResult ActualizarEstado(int id, [FromBody] ActualizarEstadoDto dto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var pedido = _context.Pedidos.Find(id);
    if (pedido == null)
        return NotFound();

    pedido.Estado = dto.Estado;
    _context.SaveChanges();

    return NoContent();
}


        public class PedidoDto
        {
            public int PedidoId { get; set; }
            public DateTime FechaPedido { get; set; }
            public string Estado { get; set; }
            public decimal Total { get; set; }
            public List<DetallePedidoDto> Detalles { get; set; }
        }

        public class DetallePedidoDto
        {
            public string Nombre { get; set; }
            public string Tipo { get; set; }
            public int Cantidad { get; set; }
            public decimal PrecioUnitario { get; set; }
        }

        public class CrearPedidoDto
        {
            [Required]
            public int ClienteId { get; set; }

            [Required]
            [MinLength(1)]
            public List<PedidoItemDto> Items { get; set; }
        }

        public class PedidoItemDto
        {
            [Required]
            public string Tipo { get; set; }

            [Required]
            public int ItemId { get; set; }

            [Required]
            [Range(1, 100)]
            public int Cantidad { get; set; }
        }

        public class ActualizarEstadoDto
        {
            [Required]
            public string Estado { get; set; }
        }
    }
}
