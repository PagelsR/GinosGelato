namespace GinosGelato.Dtos
{
    /// <summary>Request payload for a single customized gelato line item.</summary>
    public record OrderItemRequest(
        string Container,
        List<string> Flavors,
        List<string> Toppings);

    /// <summary>Request payload for creating an order. Pricing is intentionally omitted;
    /// the API is authoritative for all pricing and validation.</summary>
    public record CreateOrderRequest(
        string CustomerName,
        string Email,
        string Phone,
        string FulfillmentType,
        string? Address,
        string? City,
        string? State,
        string? ZipCode,
        string? SpecialInstructions,
        List<OrderItemRequest> Items);

    /// <summary>Response payload for a single line item.</summary>
    public record OrderItemResponse(
        string Container,
        List<string> Flavors,
        List<string> Toppings,
        decimal LinePrice);

    /// <summary>Response payload returned after an order is created or fetched.</summary>
    public record OrderResponse(
        int Id,
        string ConfirmationNumber,
        string CustomerName,
        string FulfillmentType,
        decimal Subtotal,
        decimal Tax,
        decimal DeliveryFee,
        decimal ShippingFee,
        decimal Total,
        string Status,
        DateTime OrderDate,
        List<OrderItemResponse> Items);
}
