namespace GinosGelato.Models
{
    public enum OrderQueueStatus
    {
        Pending,
        Completed
    }

    public class OrderQueueEntry
    {
        public int OrderId { get; set; }
        public DateTime EnqueuedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public OrderQueueStatus Status { get; set; } = OrderQueueStatus.Pending;

        public double? PreparationTimeMinutes =>
            CompletedAt.HasValue
                ? (CompletedAt.Value - EnqueuedAt).TotalMinutes
                : null;
    }
}
