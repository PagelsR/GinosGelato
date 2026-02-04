namespace GinosGelato.Models
{
    public class IceCream
    {
        public int Id { get; set; }
        public string ContainerType { get; set; } = string.Empty; // Cone or Cup
        public List<string> Flavors { get; set; } = new List<string>(); // Up to three flavors
        public List<string> Toppings { get; set; } = new List<string>(); // Selected toppings
        public decimal Price { get; set; } // Price of the ice cream
    }
}