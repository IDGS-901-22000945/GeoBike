using GeoApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GeoApi.Data;
using System.ComponentModel.DataAnnotations; // Ya lo tienes, pero para recordar


namespace GeoApi.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class ProveedoresController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProveedoresController> _logger;

        public ProveedoresController(AppDbContext context, ILogger<ProveedoresController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/proveedores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Proveedor>>> GetProveedores(
            [FromQuery] bool? activos = null,
            [FromQuery] string search = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                IQueryable<Proveedor> query = _context.Proveedores;

                // Filtro por estado
                if (activos.HasValue)
                {
                    query = query.Where(p => p.Activo == activos.Value);
                }

                // Búsqueda por nombre, contacto o email
                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    query = query.Where(p =>
                        p.Nombre.ToLower().Contains(search) ||
                        p.Contacto.ToLower().Contains(search) ||
                        p.Email.ToLower().Contains(search));
                }

                // Paginación
                var totalRecords = await query.CountAsync();
                var proveedores = await query
                    .OrderBy(p => p.Nombre)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Agregar headers de paginación
                Response.Headers.Add("X-Total-Count", totalRecords.ToString());
                Response.Headers.Add("X-Page-Size", pageSize.ToString());
                Response.Headers.Add("X-Current-Page", page.ToString());
                Response.Headers.Add("X-Total-Pages", Math.Ceiling(totalRecords / (double)pageSize).ToString());

                return Ok(proveedores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener proveedores");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // GET: api/proveedores/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Proveedor>> GetProveedor(int id)
        {
            try
            {
                var proveedor = await _context.Proveedores.FindAsync(id);

                if (proveedor == null)
                {
                    return NotFound(new { message = $"Proveedor con ID {id} no encontrado" });
                }

                return Ok(proveedor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener proveedor con ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // POST: api/proveedores
        [HttpPost]
public async Task<ActionResult<Proveedor>> PostProveedor([FromBody] PostProveedor proveedorDto)
{
    // La validación automática ya ocurrió antes de llegar aquí
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    try
    {
        var proveedor = new Proveedor
        {
            Nombre = proveedorDto.Nombre,
            Contacto = proveedorDto.Contacto,
            Telefono = proveedorDto.Telefono,
            Email = proveedorDto.Email,
            Direccion = proveedorDto.Direccion,
            FechaRegistro = DateTime.UtcNow,
            Activo = true
        };

        _context.Proveedores.Add(proveedor);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProveedor), new { id = proveedor.ProveedorId }, proveedor);
    }
    catch (DbUpdateException ex)
    {
        _logger.LogError(ex, "Error al crear proveedor");
        return BadRequest(new { message = "Error al crear el proveedor, verifique los datos" });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error inesperado al crear proveedor");
        return StatusCode(500, "Error interno del servidor");
    }
}

[HttpPut("{id}")]
public async Task<IActionResult> PutProveedor(int id, [FromBody] PutProveedor proveedorDto)
{
    // Validación automática del modelo
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    if (id != proveedorDto.ProveedorId)
    {
        return BadRequest(new { message = "ID del proveedor no coincide" });
    }

    try
    {
        var proveedorExistente = await _context.Proveedores.FindAsync(id);
        if (proveedorExistente == null)
        {
            return NotFound(new { message = $"Proveedor con ID {id} no encontrado" });
        }

        // Actualizar solo los campos permitidos
        proveedorExistente.Nombre = proveedorDto.Nombre;
        proveedorExistente.Contacto = proveedorDto.Contacto;
        proveedorExistente.Telefono = proveedorDto.Telefono;
        proveedorExistente.Email = proveedorDto.Email;
        proveedorExistente.Direccion = proveedorDto.Direccion;
        proveedorExistente.Activo = proveedorDto.Activo;

        await _context.SaveChangesAsync();

        return NoContent();
    }
    catch (DbUpdateConcurrencyException ex)
    {
        _logger.LogError(ex, $"Error de concurrencia al actualizar proveedor {id}");
        if (!ProveedorExists(id))
        {
            return NotFound();
        }
        else
        {
            throw;
        }
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error al actualizar proveedor con ID {id}");
        return StatusCode(500, "Error interno del servidor");
    }
}

        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleProveedorStatus(int id)
        {
            try
            {
                var proveedor = await _context.Proveedores.FindAsync(id);
                if (proveedor == null)
                {
                    return NotFound(new { message = $"Proveedor con ID {id} no encontrado" });
                }

                proveedor.Activo = !proveedor.Activo;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = proveedor.ProveedorId,
                    nuevoEstado = proveedor.Activo ? "Activo" : "Inactivo"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al cambiar estado del proveedor {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // DELETE: api/proveedores/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProveedor(int id)
        {
            try
            {
                var proveedor = await _context.Proveedores.FindAsync(id);
                if (proveedor == null)
                {
                    return NotFound(new { message = $"Proveedor con ID {id} no encontrado" });
                }

                // Verificar si el proveedor tiene productos asociados
                var tieneProductos = await _context.Productos.AnyAsync(p => p.ProveedorId == id);
                if (tieneProductos)
                {
                    return BadRequest(new
                    {
                        message = "No se puede eliminar el proveedor porque tiene productos asociados",
                        action = "Desactive el proveedor en lugar de eliminarlo"
                    });
                }

                _context.Proveedores.Remove(proveedor);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Proveedor {proveedor.Nombre} eliminado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar proveedor con ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        private bool ProveedorExists(int id)
        {
            return _context.Proveedores.Any(e => e.ProveedorId == id);
        }
    }

    public class PostProveedor
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; }

        [StringLength(50, ErrorMessage = "El contacto no puede exceder 50 caracteres")]
        public string Contacto { get; set; }

        [Required(ErrorMessage = "El teléfono es requerido")]
        [StringLength(10, ErrorMessage = "El teléfono debe tener exactamente 10 dígitos")]
        [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "El teléfono debe contener solo números y 10 dígitos")]
        public string Telefono { get; set; }

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido")]
        [StringLength(100, ErrorMessage = "El email no puede exceder 100 caracteres")]
        public string Email { get; set; }

        [StringLength(200, ErrorMessage = "La dirección no puede exceder 200 caracteres")]
        public string Direccion { get; set; }

        public bool Activo { get; set; } = true;
    }
public class PutProveedor
{
    [Required(ErrorMessage = "El ID del proveedor es requerido")]
    public int ProveedorId { get; set; }

    [Required(ErrorMessage = "El nombre es requerido")]
    [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
    public string Nombre { get; set; }

    [StringLength(50, ErrorMessage = "El contacto no puede exceder 50 caracteres")]
    public string Contacto { get; set; }

    [Required(ErrorMessage = "El teléfono es requerido")]
    [StringLength(10, ErrorMessage = "El teléfono debe tener exactamente 10 dígitos")]
    [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "El teléfono debe contener solo números y 10 dígitos")]
    public string Telefono { get; set; }

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El formato del email no es válido")]
    [StringLength(100, ErrorMessage = "El email no puede exceder 100 caracteres")]
    public string Email { get; set; }

    [StringLength(200, ErrorMessage = "La dirección no puede exceder 200 caracteres")]
    public string Direccion { get; set; }

    public bool Activo { get; set; }
}
}