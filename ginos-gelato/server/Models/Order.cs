namespace GinosGelato.Models
{
    public enum OrderStatus
    {
        Pending,
        InProgress,
        Completed,
        Cancelled
    }

    public enum OrderType
    {
        Pickup,
        Delivery
    }

    public class Order
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public List<IceCream> IceCreams { get; set; } = new List<IceCream>();
        public decimal TotalPrice { get; set; }
        public DateTime OrderDate { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public OrderType OrderType { get; set; } = OrderType.Pickup;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}