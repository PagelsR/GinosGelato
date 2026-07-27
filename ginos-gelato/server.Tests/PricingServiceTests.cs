using GinosGelato.Models;
using GinosGelato.Services;
using Xunit;

namespace GinosGelato.Tests
{
    public class PricingServiceTests
    {
        private readonly PricingService _pricing = new();

        [Theory]
        [InlineData("cone", 2.50)]
        [InlineData("cup", 3.00)]
        [InlineData("CONE", 2.50)]
        [InlineData(" Cup ", 3.00)]
        public void GetContainerPrice_ReturnsExpectedPrice(string container, decimal expected)
        {
            Assert.Equal(expected, _pricing.GetContainerPrice(container));
        }

        [Fact]
        public void GetContainerPrice_UnknownContainer_Throws()
        {
            Assert.Throws<ArgumentException>(() => _pricing.GetContainerPrice("bowl"));
        }

        [Fact]
        public void CalculateLinePrice_ConeWithFlavorsAndToppings_IsSumOfParts()
        {
            // cone 2.50 + 2 flavors * 2.00 + toppings (0.50 + 0.75)
            var price = _pricing.CalculateLinePrice("cone", 2, new[] { 0.50m, 0.75m });
            Assert.Equal(7.75m, price);
        }

        [Fact]
        public void CalculateLinePrice_CupNoToppings_IsBasePlusFlavors()
        {
            var price = _pricing.CalculateLinePrice("cup", 1, Array.Empty<decimal>());
            Assert.Equal(5.00m, price);
        }

        [Fact]
        public void CalculateTax_RoundsToTwoDecimals()
        {
            Assert.Equal(0.85m, _pricing.CalculateTax(10.00m));
            Assert.Equal(0.66m, _pricing.CalculateTax(7.75m));
        }

        [Fact]
        public void GetFulfillmentFees_Pickup_IsFree()
        {
            var (delivery, shipping) = _pricing.GetFulfillmentFees(FulfillmentType.Pickup);
            Assert.Equal(0m, delivery);
            Assert.Equal(0m, shipping);
        }

        [Fact]
        public void GetFulfillmentFees_Delivery_ChargesDeliveryFee()
        {
            var (delivery, shipping) = _pricing.GetFulfillmentFees(FulfillmentType.Delivery);
            Assert.Equal(PricingService.DeliveryFee, delivery);
            Assert.Equal(0m, shipping);
        }

        [Fact]
        public void GetFulfillmentFees_Shipping_ChargesShippingFee()
        {
            var (delivery, shipping) = _pricing.GetFulfillmentFees(FulfillmentType.Shipping);
            Assert.Equal(0m, delivery);
            Assert.Equal(PricingService.ShippingFee, shipping);
        }

        [Fact]
        public void CalculateOrderTotals_Pickup_ComputesSubtotalTaxAndTotal()
        {
            var totals = _pricing.CalculateOrderTotals(new[] { 7.75m, 5.00m }, FulfillmentType.Pickup);

            Assert.Equal(12.75m, totals.Subtotal);
            Assert.Equal(1.08m, totals.Tax); // round(12.75 * 0.085) = 1.08
            Assert.Equal(0m, totals.DeliveryFee);
            Assert.Equal(0m, totals.ShippingFee);
            Assert.Equal(13.83m, totals.Total);
        }

        [Fact]
        public void CalculateOrderTotals_Delivery_IncludesDeliveryFee()
        {
            var totals = _pricing.CalculateOrderTotals(new[] { 10.00m }, FulfillmentType.Delivery);

            Assert.Equal(10.00m, totals.Subtotal);
            Assert.Equal(0.85m, totals.Tax);
            Assert.Equal(4.99m, totals.DeliveryFee);
            Assert.Equal(15.84m, totals.Total);
        }

        [Fact]
        public void CalculateOrderTotals_Shipping_IncludesShippingFee()
        {
            var totals = _pricing.CalculateOrderTotals(new[] { 10.00m }, FulfillmentType.Shipping);

            Assert.Equal(9.99m, totals.ShippingFee);
            Assert.Equal(20.84m, totals.Total);
        }
    }
}
