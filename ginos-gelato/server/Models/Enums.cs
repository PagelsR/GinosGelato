namespace GinosGelato.Models
{
    /// <summary>
    /// How the customer wants to receive their order.
    /// </summary>
    public enum FulfillmentType
    {
        Pickup = 0,
        Delivery = 1,
        Shipping = 2
    }

    /// <summary>
    /// Lifecycle status of an order.
    /// </summary>
    public enum OrderStatus
    {
        Received = 0,
        InProgress = 1,
        Completed = 2,
        Cancelled = 3
    }
}
