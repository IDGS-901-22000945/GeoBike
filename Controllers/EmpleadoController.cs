using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GeoApi.Data;
using GeoApi.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GeoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpleadosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmpleadosController(AppDbContext context)
        {
            _context = context;
        }

        // DTO de respuesta
        public class EmpleadoResponseDto
        {
            public int PersonalId { get; set; }
            public string Nombre { get; set; }
            public string ApellidoPaterno { get; set; }
            public string ApellidoMaterno { get; set; }
            public string Puesto { get; set; }
            public int UsuarioId { get; set; }
            public string Email { get; set; }
            public bool Activo { get; set; }
            public DateTime FechaContratacion { get; set; }
            public DateTime FechaCreacion { get; set; }

            public string Rol { get; set; }

            public string EmpleadoIdFormateado => $"EMP-{PersonalId.ToString().PadLeft(3, '0')}";
            public string NombreCompleto => $"{Nombre} {ApellidoPaterno} {ApellidoMaterno}";
            public string Iniciales => $"{Nombre[0]}{ApellidoPaterno[0]}";
            public string Estado => Activo ? "Activo" : "Inactivo";
            public string FechaRegistroFormateada => FechaCreacion.ToString("dd/MM/yyyy");
        }

        // GET: api/empleados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpleadoResponseDto>>> GetEmpleados()
        {
            var empleados = await _context.Personal
                .Include(e => e.Usuario)
                .Select(e => new EmpleadoResponseDto
                {
                    PersonalId = e.PersonalId,
                    Nombre = e.Nombre,
                    ApellidoPaterno = e.ApellidoPaterno,
                    ApellidoMaterno = e.ApellidoMaterno ?? "",
                    Puesto = e.Puesto,
                    UsuarioId = e.UsuarioId,
                    Email = e.Usuario.Email,
                    Activo = e.Usuario.Activo,
                    FechaContratacion = e.FechaContratacion ?? DateTime.Now,
                    FechaCreacion = e.Usuario.FechaCreacion,
                    Rol = e.Usuario.Rol
                })
                .ToListAsync();

            return Ok(empleados);
        }

        // POST: api/empleados/register
        [HttpPost("register")]
        public async Task<IActionResult> RegisterEmpleado([FromBody] EmpleadoRegistroModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (await _context.Usuarios.AnyAsync(u => u.Email == model.Email))
                    return BadRequest(new { error = "El correo electrónico ya está registrado." });

                var usuario = new Usuario
                {
                    Email = model.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
                    Rol = "empleado",
                    FechaCreacion = DateTime.Now,
                    Activo = true
                };

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                var empleado = new Personal
                {
                    UsuarioId = usuario.UsuarioId,
                    Nombre = model.Nombre,
                    ApellidoPaterno = model.ApellidoPaterno,
                    ApellidoMaterno = model.ApellidoMaterno,
                    Puesto = model.Puesto,
                    FechaContratacion = model.FechaContratacion ?? DateTime.Now
                };

                _context.Personal.Add(empleado);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Empleado registrado exitosamente",
                    empleadoId = empleado.PersonalId,
                    email = usuario.Email,
                    nombre = empleado.Nombre,
                    activo = usuario.Activo
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al registrar el empleado", details = ex.Message });
            }
        }

        // GET: api/empleados/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Personal>> GetEmpleado(int id)
        {
            var empleado = await _context.Personal
                .Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.PersonalId == id);

            if (empleado == null)
                return NotFound();

            return Ok(empleado);
        }

        // PATCH: api/empleados/5/toggle-estado
        [HttpPatch("{id}/toggle-estado")]
        public async Task<IActionResult> ToggleEstadoEmpleado(int id)
        {
            try
            {
                var empleado = await _context.Personal
                    .Include(e => e.Usuario)
                    .FirstOrDefaultAsync(e => e.PersonalId == id);

                if (empleado == null)
                    return NotFound(new { message = $"Empleado con ID {id} no encontrado." });

                if (empleado.Usuario == null)
                    return StatusCode(500, new { message = "No se encontró usuario asociado al empleado." });

                empleado.Usuario.Activo = !empleado.Usuario.Activo;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Estado actualizado correctamente",
                    empleadoId = empleado.PersonalId,
                    nuevoEstado = empleado.Usuario.Activo
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar el estado", error = ex.Message });
            }
        }

        // PUT: api/empleados/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmpleado(int id, [FromBody] EmpleadoUpdateModel model)
        {
            if (id != model.PersonalId)
                return BadRequest("ID de empleado no coincide");

            var empleadoExistente = await _context.Personal
                .Include(e => e.Usuario)
                .FirstOrDefaultAsync(e => e.PersonalId == id);

            if (empleadoExistente == null)
                return NotFound("Empleado no encontrado");

            empleadoExistente.Nombre = model.Nombre;
            empleadoExistente.ApellidoPaterno = model.ApellidoPaterno;
            empleadoExistente.ApellidoMaterno = model.ApellidoMaterno;
            empleadoExistente.Puesto = model.Puesto;
            empleadoExistente.FechaContratacion = model.FechaContratacion;

            if (empleadoExistente.Usuario != null)
            {
                if (await _context.Usuarios.AnyAsync(u => u.Email == model.Email && u.UsuarioId != empleadoExistente.UsuarioId))
                {
                    return BadRequest("El correo electrónico ya está en uso por otro usuario");
                }
                empleadoExistente.Usuario.Email = model.Email;
            }

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Error al actualizar: {ex.Message}");
            }
        }

        // GET: api/empleados/search?q=lopez
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<EmpleadoResponseDto>>> SearchEmpleados(string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { error = "El término de búsqueda no puede estar vacío." });

            var empleados = await _context.Personal
                .Include(e => e.Usuario)
                .Where(e => e.Nombre.Contains(q) ||
                            e.ApellidoPaterno.Contains(q) ||
                            e.ApellidoMaterno.Contains(q) ||
                            e.Puesto.Contains(q) ||
                            e.Usuario.Email.Contains(q))
                .Select(e => new EmpleadoResponseDto
                {
                    PersonalId = e.PersonalId,
                    Nombre = e.Nombre,
                    ApellidoPaterno = e.ApellidoPaterno,
                    ApellidoMaterno = e.ApellidoMaterno ?? "",
                    Puesto = e.Puesto,
                    UsuarioId = e.UsuarioId,
                    Email = e.Usuario.Email,
                    Activo = e.Usuario.Activo,
                    FechaContratacion = e.FechaContratacion ?? DateTime.Now,
                    FechaCreacion = e.Usuario.FechaCreacion
                })
                .ToListAsync();

            return Ok(empleados);
        }

        // MODELOS
        public class EmpleadoRegistroModel
        {
            [Required, EmailAddress]
            public string Email { get; set; }

            [Required, MinLength(6)]
            public string Password { get; set; }

            [Required]
            public string Nombre { get; set; }

            [Required]
            public string ApellidoPaterno { get; set; }

            public string ApellidoMaterno { get; set; }

            [Required]
            public string Puesto { get; set; }

            public DateTime? FechaContratacion { get; set; }
        }

        public class EmpleadoUpdateModel
        {
            [Required]
            public int PersonalId { get; set; }

            [Required, EmailAddress]
            public string Email { get; set; }

            [Required, StringLength(100)]
            public string Nombre { get; set; }

            [Required, StringLength(100)]
            public string ApellidoPaterno { get; set; }

            [StringLength(100)]
            public string ApellidoMaterno { get; set; }

            [Required, StringLength(100)]
            public string Puesto { get; set; }

            public DateTime? FechaContratacion { get; set; }
        }
    }
}
