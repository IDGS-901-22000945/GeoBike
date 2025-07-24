using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using GeoApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GeoApi.Data;

namespace GeoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductosController(AppDbContext context)
        {
            _context = context;
        }

        // DTO para respuesta de producto
        public class ProductoDto
        {
            public int ProductoId { get; set; }
            public string Nombre { get; set; }
            public string Descripcion { get; set; }
            public decimal Precio { get; set; }
            public int Stock { get; set; }
            public bool Activo { get; set; }
            public int? ProveedorId { get; set; }
            public string NombreProveedor { get; set; } 
        }

        // GET: api/Productos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> GetProductos()
        {
            return await _context.Productos
                .Include(p => p.Proveedor) 
                .Select(p => new ProductoDto
                {
                    ProductoId = p.ProductoId,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Stock = p.Stock,
                    Activo = p.Activo,
                    ProveedorId = p.ProveedorId,
                    NombreProveedor = p.Proveedor != null ? p.Proveedor.Nombre : null
                })
                .ToListAsync();
        }

        // GET: api/Productos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoDto>> GetProducto(int id)
        {
            var producto = await _context.Productos
                .Include(p => p.Proveedor)
                .FirstOrDefaultAsync(p => p.ProductoId == id);

            if (producto == null)
            {
                return NotFound();
            }

            return new ProductoDto
            {
                ProductoId = producto.ProductoId,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                Activo = producto.Activo,
                ProveedorId = producto.ProveedorId,
                NombreProveedor = producto.Proveedor != null ? producto.Proveedor.Nombre : null
            };
        }

        // POST: api/Productos
        [HttpPost]
        public async Task<ActionResult<ProductoDto>> PostProducto(ProductoCreateDto productoDto)
        {
            var producto = new Producto
            {
                Nombre = productoDto.Nombre,
                Descripcion = productoDto.Descripcion,
                Precio = productoDto.Precio,
                Stock = productoDto.Stock,
                Activo = productoDto.Activo,
                ProveedorId = productoDto.ProveedorId
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProducto", new { id = producto.ProductoId }, 
                new ProductoDto
                {
                    ProductoId = producto.ProductoId,
                    Nombre = producto.Nombre,
                    Descripcion = producto.Descripcion,
                    Precio = producto.Precio,
                    Stock = producto.Stock,
                    Activo = producto.Activo,
                    ProveedorId = producto.ProveedorId
                });
        }

        // PUT: api/Productos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProducto(int id, ProductoUpdateDto productoDto)
        {
            if (id != productoDto.ProductoId)
            {
                return BadRequest();
            }

            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
            {
                return NotFound();
            }

            producto.Nombre = productoDto.Nombre;
            producto.Descripcion = productoDto.Descripcion;
            producto.Precio = productoDto.Precio;
            producto.Stock = productoDto.Stock;
            producto.Activo = productoDto.Activo;
            producto.ProveedorId = productoDto.ProveedorId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Productos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
            {
                return NotFound();
            }

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductoExists(int id)
        {
            return _context.Productos.Any(e => e.ProductoId == id);
        }
    }

    // DTOs para creación y actualización
    public class ProductoCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }

        [StringLength(500)]
        public string Descripcion { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Precio { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public bool Activo { get; set; } = true;
        
        public int? ProveedorId { get; set; }
    }

    public class ProductoUpdateDto
    {
        [Required]
        public int ProductoId { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }

        [StringLength(500)]
        public string Descripcion { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Precio { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public bool Activo { get; set; }
        
        public int? ProveedorId { get; set; }
    }
}