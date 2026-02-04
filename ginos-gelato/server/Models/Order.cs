namespace GinosGelato.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public List<IceCream> IceCreams { get; set; } = new List<IceCream>();
        public decimal TotalPrice { get; set; }
        public DateTime OrderDate { get; set; }
    }
}