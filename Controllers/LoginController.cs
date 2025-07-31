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
[HttpPost][HttpPost]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _context.Usuarios
        .FirstOrDefaultAsync(u => u.Email == request.Email && u.Activo);

    if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
    {
        return Unauthorized(new { mensaje = "Credenciales inválidas" });
    }

    int? clienteId = null;
    if (user.Rol == "cliente")
    {
        clienteId = await _context.Clientes
            .Where(c => c.UsuarioId == user.UsuarioId)
            .Select(c => (int?)c.ClienteId)
            .FirstOrDefaultAsync();
    }

    return Ok(new
    {
        usuarioId = user.UsuarioId,
        rol = user.Rol,
        email = user.Email,
        clienteId = clienteId
    });
}


        [HttpGet("usuario/{usuarioId}/cliente")]
public async Task<ActionResult<int>> ObtenerClienteIdPorUsuario(int usuarioId)
{
    var clienteId = await _context.Clientes
        .Where(c => c.UsuarioId == usuarioId)
        .Select(c => c.ClienteId)
        .FirstOrDefaultAsync();

    if (clienteId == 0)
        return NotFound();

    return Ok(clienteId);
}


        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }
    }
}
