namespace GinosGelato.Models
{
    /// <summary>
    /// A customer order. This is the system-of-record aggregate persisted to Azure SQL.
    /// </summary>
    public class Order
    {
        public int Id { get; set; }

        public string ConfirmationNumber { get; set; } = string.Empty;

        // Customer details
        public string CustomerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // Fulfillment
        public FulfillmentType FulfillmentType { get; set; } = FulfillmentType.Pickup;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? SpecialInstructions { get; set; }

        // Pricing (authoritative values computed by the API)
        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal DeliveryFee { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal Total { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Received;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public List<OrderItem> Items { get; set; } = new();
    }
}