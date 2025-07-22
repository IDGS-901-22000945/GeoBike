using Microsoft.AspNetCore.Mvc;
using GeoApi.Data;
using GeoApi.Models;
using Microsoft.EntityFrameworkCore;

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

        [HttpPost("register-empleado")]
        public async Task<IActionResult> RegisterEmpleado([FromBody] PersonalRegistroModel model)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == model.Email))
            {
                return BadRequest("El correo electrónico ya está registrado.");
            }

            var usuario = new Usuario
            {
                Email = model.Email,
                PasswordHash = model.PasswordHash,
                Rol = "empleado",
                FechaCreacion = DateTime.Now,
                Activo = true
            };

            var personal = new Personal
            {
                Nombre = model.Nombre,
                ApellidoPaterno = model.ApellidoPaterno,
                ApellidoMaterno = model.ApellidoMaterno,
                Puesto = model.Puesto,
                FechaContratacion = model.FechaContratacion,
                Usuario = usuario
            };

            _context.Usuarios.Add(usuario);
            _context.Personal.Add(personal);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(RegisterEmpleado), new { id = personal.PersonalId }, personal);
        }
    }

    public class PersonalRegistroModel
    {
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Nombre { get; set; }
        public string ApellidoPaterno { get; set; }
        public string ApellidoMaterno { get; set; }
        public string Puesto { get; set; }
        public DateTime? FechaContratacion { get; set; }
    }
}