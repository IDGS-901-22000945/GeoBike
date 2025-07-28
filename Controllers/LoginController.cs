using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GeoApi.Data;
using GeoApi.Models;
using System.Threading.Tasks;

namespace GeoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoginController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Activo);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { mensaje = "Credenciales inválidas" });
            }

            return Ok(new
            {
                usuarioId = user.UsuarioId,
                rol = user.Rol,
                email = user.Email
                // puedes incluir más datos si es necesario
            });
        }

        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }
    }
}
