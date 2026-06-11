namespace GinosGelato.Models
{
    public class QueueStatus
    {
        public int PendingOrders { get; set; }
        public int InProgressOrders { get; set; }
        public int EstimatedWaitTimeMinutes { get; set; }
        public double AveragePrepTimeMinutes { get; set; }
        public IEnumerable<QueueEntryDto> Queue { get; set; } = Enumerable.Empty<QueueEntryDto>();
    }

    public class QueueEntryDto
    {
        public int OrderId { get; set; }
        public int IceCreamCount { get; set; }
        public DateTime EnqueuedAt { get; set; }
        public int EstimatedPrepTimeMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
