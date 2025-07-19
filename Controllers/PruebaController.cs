using Microsoft.AspNetCore.Mvc;

namespace GeoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PruebaController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { mensaje = "¡Hola desde .NET!" });
        }
    }
}
