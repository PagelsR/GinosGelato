namespace GinosGelato.Models
{
    public class QueueStatusResponse
    {
        public int PendingOrderCount { get; set; }
        public double EstimatedWaitMinutes { get; set; }
        public double? AveragePrepTimeMinutes { get; set; }
    }

    public class AveragePrepTimeResponse
    {
        public double AveragePrepTimeMinutes { get; set; }
    }
}
