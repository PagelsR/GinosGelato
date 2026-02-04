using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GinosGelato.Models;

namespace GinosGelato.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ToppingsController : ControllerBase
    {
        private readonly List<Topping> _toppings = new List<Topping>
        {
            new Topping { Id = 1, Name = "Sprinkles" },
            new Topping { Id = 2, Name = "Chocolate Sauce" },
            new Topping { Id = 3, Name = "Nuts" },
            new Topping { Id = 4, Name = "Whipped Cream" },
            new Topping { Id = 5, Name = "Cherries" }
        };

        [HttpGet]
        public ActionResult<IEnumerable<Topping>> GetToppings()
        {
            return Ok(_toppings);
        }

        [HttpGet("{id}")]
        public ActionResult<Topping> GetTopping(int id)
        {
            var topping = _toppings.FirstOrDefault(t => t.Id == id);
            if (topping == null)
            {
                return NotFound();
            }
            return Ok(topping);
        }

        [HttpPost]
        public ActionResult<Topping> CreateTopping([FromBody] Topping topping)
        {
            topping.Id = _toppings.Max(t => t.Id) + 1;
            _toppings.Add(topping);
            return CreatedAtAction(nameof(GetTopping), new { id = topping.Id }, topping);
        }

        [HttpPut("{id}")]
        public ActionResult UpdateTopping(int id, [FromBody] Topping topping)
        {
            var existingTopping = _toppings.FirstOrDefault(t => t.Id == id);
            if (existingTopping == null)
            {
                return NotFound();
            }
            existingTopping.Name = topping.Name;
            return NoContent();
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteTopping(int id)
        {
            var topping = _toppings.FirstOrDefault(t => t.Id == id);
            if (topping == null)
            {
                return NotFound();
            }
            _toppings.Remove(topping);
            return NoContent();
        }
    }
}