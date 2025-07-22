using Microsoft.AspNetCore.Mvc;
using GeoApi.Data;
using GeoApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic; // Asegúrate de importar esto para IEnumerable
using System.ComponentModel.DataAnnotations; // Ya lo tienes, pero para recordar

namespace GeoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientesController(AppDbContext context)
        {
            _context = context;
        }


public class ClienteResponseDto
{
    public int ClienteId { get; set; }
    public string Nombre { get; set; }
    public string ApellidoPaterno { get; set; }
    public string ApellidoMaterno { get; set; }
    public string DireccionEnvio { get; set; }
    public string Telefono { get; set; }
    public int UsuarioId { get; set; }
    public string Email { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    
    // Propiedades calculadas para facilitar el frontend
    public string ClienteIdFormateado => $"CL-{ClienteId.ToString().PadLeft(3, '0')}";
    public string NombreCompleto => $"{Nombre} {ApellidoPaterno} {ApellidoMaterno}";
    public string Iniciales => $"{Nombre[0]}{ApellidoPaterno[0]}";
    public string Estado => Activo ? "Activo" : "Inactivo";
    public string FechaRegistroFormateada => FechaCreacion.ToString("dd/MM/yyyy");
}
      [HttpGet]
public async Task<ActionResult<IEnumerable<ClienteResponseDto>>> GetClientes()
{
    var clientes = await _context.Clientes
        .Include(c => c.Usuario)
        .Select(c => new ClienteResponseDto
        {
            ClienteId = c.ClienteId,
            Nombre = c.Nombre,
            ApellidoPaterno = c.ApellidoPaterno,
            ApellidoMaterno = c.ApellidoMaterno ?? "", // Manejo de nulos
            DireccionEnvio = c.DireccionEnvio,
            Telefono = c.Telefono,
            UsuarioId = c.UsuarioId,
            Email = c.Usuario.Email,
            Activo = c.Usuario.Activo,
            FechaCreacion = c.Usuario.FechaCreacion
        })
        .ToListAsync();

    return Ok(clientes);
}


        [HttpPost("register")]
        public async Task<IActionResult> RegisterCliente([FromBody] ClienteRegistroModel model)
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
                    PasswordHash = model.PasswordHash, // En una aplicación real, deberías hashear esta contraseña
                    Rol = "cliente",
                    FechaCreacion = DateTime.Now,
                    Activo = true
                };

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                var cliente = new Cliente
                {
                    UsuarioId = usuario.UsuarioId,
                    Nombre = model.Nombre,
                    ApellidoPaterno = model.ApellidoPaterno,
                    ApellidoMaterno = model.ApellidoMaterno,
                    DireccionEnvio = model.DireccionEnvio,
                    Telefono = model.Telefono,
                    Usuario = usuario // Asigna el objeto Usuario completo para la navegación
                };

                _context.Clientes.Add(cliente);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Cliente registrado exitosamente",
                    clienteId = cliente.ClienteId,
                    email = usuario.Email,
                    nombre = cliente.Nombre,
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


        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> GetCliente(int id)
        {
            var cliente = await _context.Clientes
                                        .Include(c => c.Usuario)
                                        .FirstOrDefaultAsync(c => c.ClienteId == id);

            if (cliente == null)
            {
                return NotFound();
            }

            return Ok(cliente);
        }

       [HttpPatch("{id}/toggle-estado")]
public async Task<IActionResult> ToggleEstadoCliente(int id)
{
    try
    {
        var cliente = await _context.Clientes
            .Include(c => c.Usuario)
            .FirstOrDefaultAsync(c => c.ClienteId == id);

        if (cliente == null)
        {
            return NotFound(new { message = $"Cliente con ID {id} no encontrado." });
        }

        if (cliente.Usuario == null)
        {
            return StatusCode(500, new { message = "No se encontró usuario asociado al cliente." });
        }

        cliente.Usuario.Activo = !cliente.Usuario.Activo;
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = $"Estado actualizado correctamente",
            clienteId = cliente.ClienteId,
            nuevoEstado = cliente.Usuario.Activo 
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
        // PUT: api/Clientes/5 (Actualizar cliente)
        [HttpPut("{id}")]
public async Task<IActionResult> UpdateCliente(int id, [FromBody] ClienteUpdateModel model)
{
    if (id != model.ClienteId)
    {
        return BadRequest("ID de cliente no coincide");
    }

    var clienteExistente = await _context.Clientes
        .Include(c => c.Usuario)
        .FirstOrDefaultAsync(c => c.ClienteId == id);

    if (clienteExistente == null)
    {
        return NotFound("Cliente no encontrado");
    }

    // Actualizar datos del cliente
    clienteExistente.Nombre = model.Nombre;
    clienteExistente.ApellidoPaterno = model.ApellidoPaterno;
    clienteExistente.ApellidoMaterno = model.ApellidoMaterno;
    clienteExistente.DireccionEnvio = model.DireccionEnvio;
    clienteExistente.Telefono = model.Telefono;

    // Actualizar email del usuario
    if (clienteExistente.Usuario != null)
    {
        // Verificar si el nuevo email ya existe para otro usuario
        if (await _context.Usuarios.AnyAsync(u => u.Email == model.Email && u.UsuarioId != clienteExistente.UsuarioId))
        {
            return BadRequest("El correo electrónico ya está en uso por otro usuario");
        }
        clienteExistente.Usuario.Email = model.Email;
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

        [HttpGet("search")]
public async Task<ActionResult<IEnumerable<ClienteResponseDto>>> SearchClientes(string q)
{
    if (string.IsNullOrWhiteSpace(q))
    {
        return BadRequest(new { error = "El término de búsqueda no puede estar vacío." });
    }

    var clientes = await _context.Clientes
        .Include(c => c.Usuario)
        .Where(c => c.Nombre.Contains(q) ||
                   c.ApellidoPaterno.Contains(q) ||
                   c.ApellidoMaterno.Contains(q) ||
                   c.Telefono.Contains(q) ||
                   (c.Usuario != null && c.Usuario.Email.Contains(q)))
        .Select(c => new ClienteResponseDto
        {
            ClienteId = c.ClienteId,
            Nombre = c.Nombre,
            ApellidoPaterno = c.ApellidoPaterno,
            ApellidoMaterno = c.ApellidoMaterno ?? "",
            DireccionEnvio = c.DireccionEnvio,
            Telefono = c.Telefono,
            UsuarioId = c.UsuarioId,
            Email = c.Usuario.Email,
            Activo = c.Usuario.Activo,
            FechaCreacion = c.Usuario.FechaCreacion
        })
        .ToListAsync();

    return Ok(clientes);
}

      
    }


    public class ClienteRegistroModel 
    {
        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string PasswordHash { get; set; } 

        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "El apellido paterno es requerido")]
        [StringLength(100, ErrorMessage = "El apellido paterno no puede exceder 100 caracteres")]
        public string ApellidoPaterno { get; set; }

        [StringLength(100, ErrorMessage = "El apellido materno no puede exceder 100 caracteres")]
        public string ApellidoMaterno { get; set; }

        [Required(ErrorMessage = "La dirección de envío es requerida")]
        [StringLength(500, ErrorMessage = "La dirección no puede exceder 500 caracteres")]
        public string DireccionEnvio { get; set; }

        [Required(ErrorMessage = "El teléfono es requerido")]
        [Phone(ErrorMessage = "El formato del teléfono no es válido")]
        public string Telefono { get; set; }
    }

    public class ClienteUpdateModel // Clase nueva que necesitas definir
    {
        [Required] // Aseguramos que el ID venga en el cuerpo para el PUT
        public int ClienteId { get; set; }

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido")]
        public string Email { get; set; } // Incluye el email para actualizar el usuario

        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "El apellido paterno es requerido")]
        [StringLength(100, ErrorMessage = "El apellido paterno no puede exceder 100 caracteres")]
        public string ApellidoPaterno { get; set; }

        [StringLength(100, ErrorMessage = "El apellido materno no puede exceder 100 caracteres")]
        public string ApellidoMaterno { get; set; }

        [Required(ErrorMessage = "La dirección de envío es requerida")]
        [StringLength(500, ErrorMessage = "La dirección no puede exceder 500 caracteres")]
        public string DireccionEnvio { get; set; }

        [Required(ErrorMessage = "El teléfono es requerido")]
        [Phone(ErrorMessage = "El formato del teléfono no es válido")]
        public string Telefono { get; set; }


    }
}