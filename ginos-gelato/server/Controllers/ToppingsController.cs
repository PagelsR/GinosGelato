using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GinosGelato.Data;
using GinosGelato.Models;

namespace GinosGelato.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ToppingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ToppingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Topping>>> GetToppings(CancellationToken cancellationToken)
        {
            var toppings = await _context.Toppings.AsNoTracking().OrderBy(t => t.Id).ToListAsync(cancellationToken);
            return Ok(toppings);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Topping>> GetTopping(int id, CancellationToken cancellationToken)
        {
            var topping = await _context.Toppings.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
            if (topping == null)
            {
                return NotFound();
            }
            return Ok(topping);
        }
    }
}