namespace GinosGelato.Models
{
    public enum QueueEntryStatus
    {
        Pending,
        InProgress,
        Completed
    }

    public class QueueEntry
    {
        public int OrderId { get; set; }
        public int IceCreamCount { get; set; }
        public DateTime EnqueuedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int EstimatedPrepTimeMinutes { get; set; }
        public QueueEntryStatus Status { get; set; } = QueueEntryStatus.Pending;
    }
}
