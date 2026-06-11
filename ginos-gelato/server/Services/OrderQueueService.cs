using System.Collections.Concurrent;
using GinosGelato.Models;

namespace GinosGelato.Services
{
    /// <summary>
    /// Thread-safe in-memory queue service that tracks order preparation times
    /// so customers can see estimated wait times based on current order volume.
    /// </summary>
    public class OrderQueueService
    {
        // Base preparation time per ice cream item (minutes)
        private const int BasePrepTimePerIceCream = 2;

        private readonly ConcurrentDictionary<int, QueueEntry> _queue = new();

        /// <summary>
        /// Enqueues an order and returns the estimated preparation time in minutes.
        /// </summary>
        public int EnqueueOrder(int orderId, int iceCreamCount)
        {
            var estimatedPrepTime = CalculateEstimatedPrepTime(iceCreamCount);

            var entry = new QueueEntry
            {
                OrderId = orderId,
                IceCreamCount = iceCreamCount,
                EnqueuedAt = DateTime.UtcNow,
                EstimatedPrepTimeMinutes = estimatedPrepTime,
                Status = QueueEntryStatus.Pending
            };

            _queue[orderId] = entry;
            return estimatedPrepTime;
        }

        /// <summary>
        /// Marks an order as completed, recording the actual completion time.
        /// Returns false if the order was not found in the queue.
        /// </summary>
        public bool CompleteOrder(int orderId)
        {
            if (!_queue.TryGetValue(orderId, out var entry))
                return false;

            // Lock on the individual entry to keep CompletedAt and Status consistent
            lock (entry)
            {
                entry.CompletedAt = DateTime.UtcNow;
                entry.Status = QueueEntryStatus.Completed;
            }
            return true;
        }

        /// <summary>
        /// Returns the current queue status, including pending/in-progress counts
        /// and cumulative estimated wait time for new arrivals.
        /// </summary>
        public QueueStatus GetQueueStatus()
        {
            var activeEntries = _queue.Values
                .Where(e => e.Status != QueueEntryStatus.Completed)
                .OrderBy(e => e.EnqueuedAt)
                .ToList();

            var pendingCount = activeEntries.Count(e => e.Status == QueueEntryStatus.Pending);
            var inProgressCount = activeEntries.Count(e => e.Status == QueueEntryStatus.InProgress);

            // Estimated wait for a new order = sum of remaining prep times for all active orders.
            // For InProgress orders, subtract elapsed time so we don't overcount.
            var estimatedWait = activeEntries.Sum(e =>
            {
                if (e.Status == QueueEntryStatus.InProgress)
                {
                    var elapsed = (int)(DateTime.UtcNow - e.EnqueuedAt).TotalMinutes;
                    return Math.Max(0, e.EstimatedPrepTimeMinutes - elapsed);
                }
                return e.EstimatedPrepTimeMinutes;
            });

            return new QueueStatus
            {
                PendingOrders = pendingCount,
                InProgressOrders = inProgressCount,
                EstimatedWaitTimeMinutes = estimatedWait,
                AveragePrepTimeMinutes = GetAveragePrepTime(),
                Queue = activeEntries.Select(e => new QueueEntryDto
                {
                    OrderId = e.OrderId,
                    IceCreamCount = e.IceCreamCount,
                    EnqueuedAt = e.EnqueuedAt,
                    EstimatedPrepTimeMinutes = e.EstimatedPrepTimeMinutes,
                    Status = e.Status.ToString()
                })
            };
        }

        /// <summary>
        /// Returns the average actual preparation time (in minutes) for all completed orders.
        /// Falls back to the estimated average when no completed orders exist.
        /// </summary>
        public double GetAveragePrepTime()
        {
            var completedEntries = _queue.Values
                .Where(e => e.Status == QueueEntryStatus.Completed && e.CompletedAt.HasValue)
                .ToList();

            if (!completedEntries.Any())
            {
                // Fall back to the average of estimated times for active (non-completed) orders
                var activeEstimates = _queue.Values
                    .Where(e => e.Status != QueueEntryStatus.Completed)
                    .Select(e => e.EstimatedPrepTimeMinutes)
                    .ToList();
                return activeEstimates.Any()
                    ? Math.Round(activeEstimates.Average(), 1)
                    : BasePrepTimePerIceCream;
            }

            var actualTimes = completedEntries
                .Select(e => (e.CompletedAt!.Value - e.EnqueuedAt).TotalMinutes)
                .ToList();

            return Math.Round(actualTimes.Average(), 1);
        }

        private static int CalculateEstimatedPrepTime(int iceCreamCount)
        {
            // Minimum 1 minute even for 0 ice creams (edge-case guard)
            return Math.Max(1, iceCreamCount * BasePrepTimePerIceCream);
        }
    }
}
