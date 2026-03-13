namespace GinosGelato.Models
{
    public enum OrderQueueStatus
    {
        Queued,
        InProgress,
        Completed
    }

    public class OrderQueueEntry
    {
        public int OrderId { get; set; }
        public DateTime QueuedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public OrderQueueStatus Status { get; set; } = OrderQueueStatus.Queued;

        public double? PrepTimeMinutes =>
            CompletedAt.HasValue
                ? (CompletedAt.Value - QueuedAt).TotalMinutes
                : null;
    }
}
