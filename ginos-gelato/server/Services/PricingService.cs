using GinosGelato.Models;

namespace GinosGelato.Services
{
    /// <summary>
    /// The single authoritative source of truth for pricing. The client may display
    /// estimated prices, but the API always recomputes every value before persisting.
    /// </summary>
    public class PricingService
    {
        public const decimal ConePrice = 2.50m;
        public const decimal CupPrice = 3.00m;
        public const decimal PricePerFlavor = 2.00m;
        public const decimal DefaultToppingPrice = 0.50m;
        public const decimal TaxRate = 0.085m;
        public const decimal DeliveryFee = 4.99m;
        public const decimal ShippingFee = 9.99m;

        /// <summary>Returns the base container price for "cone" or "cup".</summary>
        public decimal GetContainerPrice(string container)
        {
            return NormalizeContainer(container) switch
            {
                "cone" => ConePrice,
                "cup" => CupPrice,
                _ => throw new ArgumentException($"Unknown container type: '{container}'.", nameof(container))
            };
        }

        /// <summary>Computes the price of a single line item.</summary>
        public decimal CalculateLinePrice(string container, int flavorCount, IEnumerable<decimal> toppingPrices)
        {
            var price = GetContainerPrice(container)
                + (flavorCount * PricePerFlavor)
                + toppingPrices.Sum();
            return decimal.Round(price, 2);
        }

        /// <summary>Returns the flat fee for a fulfillment type.</summary>
        public (decimal deliveryFee, decimal shippingFee) GetFulfillmentFees(FulfillmentType fulfillmentType)
        {
            return fulfillmentType switch
            {
                FulfillmentType.Delivery => (DeliveryFee, 0m),
                FulfillmentType.Shipping => (0m, ShippingFee),
                _ => (0m, 0m)
            };
        }

        /// <summary>Computes tax on a subtotal.</summary>
        public decimal CalculateTax(decimal subtotal) => decimal.Round(subtotal * TaxRate, 2);

        /// <summary>Aggregates a full order quote from line prices and fulfillment type.</summary>
        public OrderQuote CalculateOrderTotals(IEnumerable<decimal> linePrices, FulfillmentType fulfillmentType)
        {
            var subtotal = decimal.Round(linePrices.Sum(), 2);
            var tax = CalculateTax(subtotal);
            var (deliveryFee, shippingFee) = GetFulfillmentFees(fulfillmentType);
            var total = decimal.Round(subtotal + tax + deliveryFee + shippingFee, 2);
            return new OrderQuote(subtotal, tax, deliveryFee, shippingFee, total);
        }

        internal static string NormalizeContainer(string container) =>
            (container ?? string.Empty).Trim().ToLowerInvariant();
    }

    /// <summary>Immutable pricing summary for an order.</summary>
    public record OrderQuote(
        decimal Subtotal,
        decimal Tax,
        decimal DeliveryFee,
        decimal ShippingFee,
        decimal Total);
}
