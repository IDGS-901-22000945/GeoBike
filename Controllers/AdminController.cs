using Microsoft.AspNetCore.Mvc;
using GeoApi.Data;
using GeoApi.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace GeoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        public class PersonalResponseDto
        {
            public int PersonalId { get; set; }
            public string Nombre { get; set; }
            public string ApellidoPaterno { get; set; }
            public string ApellidoMaterno { get; set; }
            public string Puesto { get; set; }
            public DateTime? FechaContratacion { get; set; }
            public int UsuarioId { get; set; }
            public string Email { get; set; }
            public bool Activo { get; set; }
            public DateTime FechaCreacion { get; set; }
            
            public string PersonalIdFormateado => $"EMP-{PersonalId.ToString().PadLeft(3, '0')}";
            public string NombreCompleto => $"{Nombre} {ApellidoPaterno} {ApellidoMaterno}";
            public string Iniciales => $"{Nombre[0]}{ApellidoPaterno[0]}";
            public string Estado => Activo ? "Activo" : "Inactivo";
            public string FechaContratacionFormateada => FechaContratacion?.ToString("dd/MM/yyyy") ?? "No especificada";
        }

        [HttpGet("personal")]
        public async Task<ActionResult<IEnumerable<PersonalResponseDto>>> GetPersonal()
        {
            var personal = await _context.Personal
                .Include(p => p.Usuario)
                .Select(p => new PersonalResponseDto
                {
                    PersonalId = p.PersonalId,
                    Nombre = p.Nombre,
                    ApellidoPaterno = p.ApellidoPaterno,
                    ApellidoMaterno = p.ApellidoMaterno ?? "",
                    Puesto = p.Puesto,
                    FechaContratacion = p.FechaContratacion,
                    UsuarioId = p.UsuarioId,
                    Email = p.Usuario.Email,
                    Activo = p.Usuario.Activo,
                    FechaCreacion = p.Usuario.FechaCreacion
                })
                .ToListAsync();

            return Ok(personal);
        }

        [HttpPost("register-empleado")]
        public async Task<IActionResult> RegisterEmpleado([FromBody] PersonalRegistroModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (await _context.Usuarios.AnyAsync(u => u.Email == model.Email))
                {
                    return BadRequest(new { error = "El correo electrónico ya está registrado." });
                }

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

                var personal = new Personal
                {
                    UsuarioId = usuario.UsuarioId,
                    Nombre = model.Nombre,
                    ApellidoPaterno = model.ApellidoPaterno,
                    ApellidoMaterno = model.ApellidoMaterno,
                    Puesto = model.Puesto,
                    FechaContratacion = model.FechaContratacion
                };

                _context.Personal.Add(personal);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Empleado registrado exitosamente",
                    personalId = personal.PersonalId,
                    email = usuario.Email,
                    nombre = personal.Nombre,
                    puesto = personal.Puesto,
                    activo = usuario.Activo
                });
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new { error = "Error al guardar en la base de datos.", details = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Error interno del servidor.", details = ex.Message });
            }
        }

        [HttpGet("personal/{id}")]
        public async Task<ActionResult<PersonalResponseDto>> GetPersonalById(int id)
        {
            var personal = await _context.Personal
                .Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.PersonalId == id);

            if (personal == null)
            {
                return NotFound(new { message = $"Empleado con ID {id} no encontrado." });
            }

            var response = new PersonalResponseDto
            {
                PersonalId = personal.PersonalId,
                Nombre = personal.Nombre,
                ApellidoPaterno = personal.ApellidoPaterno,
                ApellidoMaterno = personal.ApellidoMaterno ?? "",
                Puesto = personal.Puesto,
                FechaContratacion = personal.FechaContratacion,
                UsuarioId = personal.UsuarioId,
                Email = personal.Usuario.Email,
                Activo = personal.Usuario.Activo,
                FechaCreacion = personal.Usuario.FechaCreacion
            };

            return Ok(response);
        }

        [HttpPatch("personal/{id}/toggle-estado")]
        public async Task<IActionResult> ToggleEstadoPersonal(int id)
        {
            try
            {
                var personal = await _context.Personal
                    .Include(p => p.Usuario)
                    .FirstOrDefaultAsync(p => p.PersonalId == id);

                if (personal == null)
                {
                    return NotFound(new { message = $"Empleado con ID {id} no encontrado." });
                }

                if (personal.Usuario == null)
                {
                    return StatusCode(500, new { message = "No se encontró usuario asociado al empleado." });
                }

                personal.Usuario.Activo = !personal.Usuario.Activo;
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = $"Estado actualizado correctamente",
                    personalId = personal.PersonalId,
                    nuevoEstado = personal.Usuario.Activo 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Error al cambiar el estado",
                    error = ex.Message 
                });
            }
        }

        [HttpPut("personal/{id}")]
        public async Task<IActionResult> UpdatePersonal(int id, [FromBody] PersonalUpdateModel model)
        {
            if (id != model.PersonalId)
            {
                return BadRequest("ID de empleado no coincide");
            }

            var personalExistente = await _context.Personal
                .Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.PersonalId == id);

            if (personalExistente == null)
            {
                return NotFound("Empleado no encontrado");
            }

            // Actualizar datos del personal
            personalExistente.Nombre = model.Nombre;
            personalExistente.ApellidoPaterno = model.ApellidoPaterno;
            personalExistente.ApellidoMaterno = model.ApellidoMaterno;
            personalExistente.Puesto = model.Puesto;
            personalExistente.FechaContratacion = model.FechaContratacion;

            // Actualizar email del usuario
            if (personalExistente.Usuario != null)
            {
                if (await _context.Usuarios.AnyAsync(u => u.Email == model.Email && u.UsuarioId != personalExistente.UsuarioId))
                {
                    return BadRequest("El correo electrónico ya está en uso por otro usuario");
                }
                personalExistente.Usuario.Email = model.Email;
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

        [HttpGet("personal/search")]
        public async Task<ActionResult<IEnumerable<PersonalResponseDto>>> SearchPersonal(string q)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return BadRequest(new { error = "El término de búsqueda no puede estar vacío." });
            }

            var personal = await _context.Personal
                .Include(p => p.Usuario)
                .Where(p => p.Nombre.Contains(q) ||
                           p.ApellidoPaterno.Contains(q) ||
                           p.ApellidoMaterno.Contains(q) ||
                           p.Puesto.Contains(q) ||
                           (p.Usuario != null && p.Usuario.Email.Contains(q)))
                .Select(p => new PersonalResponseDto
                {
                    PersonalId = p.PersonalId,
                    Nombre = p.Nombre,
                    ApellidoPaterno = p.ApellidoPaterno,
                    ApellidoMaterno = p.ApellidoMaterno ?? "",
                    Puesto = p.Puesto,
                    FechaContratacion = p.FechaContratacion,
                    UsuarioId = p.UsuarioId,
                    Email = p.Usuario.Email,
                    Activo = p.Usuario.Activo,
                    FechaCreacion = p.Usuario.FechaCreacion
                })
                .ToListAsync();

            return Ok(personal);
        }
    }

    public class PersonalRegistroModel 
    {
        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string Password { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "El apellido paterno es requerido")]
        public string ApellidoPaterno { get; set; }

        public string ApellidoMaterno { get; set; }

        [Required(ErrorMessage = "El puesto es requerido")]
        public string Puesto { get; set; }

        public DateTime? FechaContratacion { get; set; }
    }

    public class PersonalUpdateModel
    {
        [Required]
        public int PersonalId { get; set; }

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "El apellido paterno es requerido")]
        [StringLength(100, ErrorMessage = "El apellido paterno no puede exceder 100 caracteres")]
        public string ApellidoPaterno { get; set; }

        [StringLength(100, ErrorMessage = "El apellido materno no puede exceder 100 caracteres")]
        public string ApellidoMaterno { get; set; }

        [Required(ErrorMessage = "El puesto es requerido")]
        [StringLength(100, ErrorMessage = "El puesto no puede exceder 100 caracteres")]
        public string Puesto { get; set; }

        public DateTime? FechaContratacion { get; set; }
    }
}