using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GinosGelato.Data;
using GinosGelato.Models;

namespace GinosGelato.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlavorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FlavorsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/flavors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Flavor>>> GetFlavors(CancellationToken cancellationToken)
        {
            var flavors = await _context.Flavors.AsNoTracking().OrderBy(f => f.Id).ToListAsync(cancellationToken);
            return Ok(flavors);
        }

        // GET: api/flavors/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Flavor>> GetFlavor(int id, CancellationToken cancellationToken)
        {
            var flavor = await _context.Flavors.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (flavor == null)
            {
                return NotFound();
            }
            return Ok(flavor);
        }
    }
}