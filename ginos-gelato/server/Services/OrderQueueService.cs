using GinosGelato.Models;

namespace GinosGelato.Services
{
    public class OrderQueueService
    {
        private readonly List<OrderQueueEntry> _queue = new();
        private readonly object _lock = new();

        // Default estimated preparation time when no historical data is available (minutes)
        private const double DefaultPreparationTimeMinutes = 5.0;

        // Maximum number of completed entries to retain for average calculation
        private const int MaxCompletedEntries = 100;

        public void EnqueueOrder(int orderId)
        {
            lock (_lock)
            {
                _queue.Add(new OrderQueueEntry
                {
                    OrderId = orderId,
                    EnqueuedAt = DateTime.UtcNow,
                    Status = OrderQueueStatus.Pending
                });
            }
        }

        public bool CompleteOrder(int orderId)
        {
            lock (_lock)
            {
                var entry = _queue.FirstOrDefault(e => e.OrderId == orderId && e.Status == OrderQueueStatus.Pending);
                if (entry == null)
                    return false;

                entry.CompletedAt = DateTime.UtcNow;
                entry.Status = OrderQueueStatus.Completed;

                // Prune oldest completed entries beyond the retention limit
                var completed = _queue.Where(e => e.Status == OrderQueueStatus.Completed).ToList();
                while (completed.Count > MaxCompletedEntries)
                {
                    var oldest = completed[0];
                    _queue.Remove(oldest);
                    completed.RemoveAt(0);
                }

                return true;
            }
        }

        public double GetAveragePreparationTimeMinutes()
        {
            lock (_lock)
            {
                return CalculateAveragePreparationTime();
            }
        }

        public QueueStatusResponse GetQueueStatus()
        {
            lock (_lock)
            {
                var pendingCount = _queue.Count(e => e.Status == OrderQueueStatus.Pending);
                var averagePrep = CalculateAveragePreparationTime();

                return new QueueStatusResponse
                {
                    PendingOrderCount = pendingCount,
                    AveragePreparationTimeMinutes = Math.Round(averagePrep, 1),
                    EstimatedWaitMinutes = Math.Round(pendingCount * averagePrep, 1)
                };
            }
        }

        public IReadOnlyList<OrderQueueEntry> GetAllEntries()
        {
            lock (_lock)
            {
                return _queue.ToList().AsReadOnly();
            }
        }

        // Must be called within a lock
        private double CalculateAveragePreparationTime()
        {
            var completedTimes = _queue
                .Where(e => e.Status == OrderQueueStatus.Completed && e.PreparationTimeMinutes.HasValue)
                .Select(e => e.PreparationTimeMinutes!.Value)
                .ToList();

            return completedTimes.Count > 0
                ? completedTimes.Average()
                : DefaultPreparationTimeMinutes;
        }
    }

    public class QueueStatusResponse
    {
        public int PendingOrderCount { get; set; }
        public double AveragePreparationTimeMinutes { get; set; }
        public double EstimatedWaitMinutes { get; set; }
    }
}
