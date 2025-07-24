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
    [ApiController]
    [Route("api/[controller]")]
    public class ServiciosController : ControllerBase
    {
         private readonly AppDbContext _context;

        public ServiciosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/servicios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Servicio>>> GetServicios()
        {
            return await _context.Servicios.ToListAsync();
        }

        // GET: api/servicios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Servicio>> GetServicio(int id)
        {
            var servicio = await _context.Servicios.FindAsync(id);
            if (servicio == null) return NotFound();
            return servicio;
        }

        // POST: api/servicios
        [HttpPost]
        public async Task<ActionResult<Servicio>> PostServicio(Servicio servicio)
        {
            _context.Servicios.Add(servicio);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetServicio), new { id = servicio.ServicioId }, servicio);
        }

        // PUT: api/servicios/5/toggle-activo
        [HttpPut("{id}/toggle-activo")]
        public async Task<IActionResult> ToggleActivo(int id)
        {
            var servicio = await _context.Servicios.FindAsync(id);
            if (servicio == null) return NotFound();

            servicio.Activo = !servicio.Activo;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}