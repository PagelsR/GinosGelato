using System.Collections.Concurrent;
using GinosGelato.Models;

namespace GinosGelato.Services
{
    public class OrderQueueService
    {
        private readonly ConcurrentDictionary<int, OrderQueueEntry> _queue = new();

        /// <summary>
        /// Adds a new order to the preparation queue with status Queued.
        /// </summary>
        public void EnqueueOrder(int orderId)
        {
            var entry = new OrderQueueEntry
            {
                OrderId = orderId,
                QueuedAt = DateTime.UtcNow,
                Status = OrderQueueStatus.Queued
            };
            _queue.TryAdd(orderId, entry);
        }

        /// <summary>
        /// Marks an order as completed and records the completion time.
        /// Returns false if the order was not found in the queue.
        /// </summary>
        public bool CompleteOrder(int orderId)
        {
            if (!_queue.TryGetValue(orderId, out var entry))
                return false;

            entry.CompletedAt = DateTime.UtcNow;
            entry.Status = OrderQueueStatus.Completed;
            return true;
        }

        /// <summary>
        /// Returns the number of orders that are currently pending (Queued or InProgress).
        /// </summary>
        public int GetPendingOrderCount()
        {
            return _queue.Values.Count(e => e.Status != OrderQueueStatus.Completed);
        }

        /// <summary>
        /// Returns the average preparation time in minutes across all completed orders,
        /// or null if there are no completed orders yet.
        /// </summary>
        public double? GetAveragePrepTimeMinutes()
        {
            var completedTimes = _queue.Values
                .Where(e => e.PrepTimeMinutes.HasValue)
                .Select(e => e.PrepTimeMinutes!.Value)
                .ToList();

            if (completedTimes.Count == 0)
                return null;

            return completedTimes.Average();
        }

        /// <summary>
        /// Returns an estimated wait time in minutes for a new order placed right now.
        /// The estimate is: pending orders × average prep time per order.
        /// Falls back to a default of 5 minutes per order when no history is available.
        /// </summary>
        public double GetEstimatedWaitMinutes()
        {
            const double defaultPrepMinutes = 5.0;
            var avgPrepTime = GetAveragePrepTimeMinutes() ?? defaultPrepMinutes;
            var pendingCount = GetPendingOrderCount();
            return pendingCount * avgPrepTime;
        }

        /// <summary>
        /// Returns all queue entries (useful for diagnostics and testing).
        /// </summary>
        public IReadOnlyList<OrderQueueEntry> GetAllEntries()
        {
            return _queue.Values.ToList().AsReadOnly();
        }
    }
}
