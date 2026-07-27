namespace GinosGelato.Models
{
    /// <summary>
    /// A single customized gelato line item within an <see cref="Order"/>.
    /// </summary>
    public class OrderItem
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order? Order { get; set; }

        /// <summary>Container type: "cone" or "cup".</summary>
        public string Container { get; set; } = string.Empty;

        /// <summary>Selected flavor names (1-3).</summary>
        public List<string> Flavors { get; set; } = new();

        /// <summary>Selected topping names.</summary>
        public List<string> Toppings { get; set; } = new();

        /// <summary>Authoritative price for this line item, computed by the API.</summary>
        public decimal LinePrice { get; set; }
    }
}
