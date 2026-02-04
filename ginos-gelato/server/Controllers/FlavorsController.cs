using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GinosGelato.Models;

namespace GinosGelato.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlavorsController : ControllerBase
    {
        private readonly List<Flavor> _flavors;

        public FlavorsController()
        {
            // Sample data for demonstration purposes
            _flavors = new List<Flavor>
            {
                new Flavor { Id = 1, Name = "Vanilla" },
                new Flavor { Id = 2, Name = "Chocolate" },
                new Flavor { Id = 3, Name = "Strawberry" },
                new Flavor { Id = 4, Name = "Mint" },
                new Flavor { Id = 5, Name = "Cookie Dough" }
            };
        }

        // GET: api/flavors
        [HttpGet]
        public ActionResult<IEnumerable<Flavor>> GetFlavors()
        {
            return Ok(_flavors);
        }

        // GET: api/flavors/{id}
        [HttpGet("{id}")]
        public ActionResult<Flavor> GetFlavor(int id)
        {
            var flavor = _flavors.FirstOrDefault(f => f.Id == id);
            if (flavor == null)
            {
                return NotFound();
            }
            return Ok(flavor);
        }
    }
}