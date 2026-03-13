using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using GinosGelato.Data;
using GinosGelato.Models;

namespace GinosGelato.Services
{
    public record QueueStats(
        int TotalInQueue,
        int PendingCount,
        int InProgressCount,
        double AveragePrepTimeMinutes,
        double EstimatedWaitMinutes,
        List<ActiveOrderInfo> ActiveOrders
    );

    public record ActiveOrderInfo(
        int OrderId,
        string CustomerName,
        OrderStatus Status,
        OrderType OrderType,
        DateTime OrderDate,
        DateTime? StartedAt,
        double ElapsedMinutes,
        int IceCreamCount
    );

    public record PeakHourData(int Hour, int OrderCount, double AverageWaitMinutes);

    public record DailyMetrics(
        DateOnly Date,
        int TotalOrders,
        int CompletedOrders,
        double AveragePrepTimeMinutes,
        double TotalRevenue
    );

    public class OrderQueueService
    {
        private readonly ApplicationDbContext _context;

        public OrderQueueService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<QueueStats> GetQueueStatsAsync()
        {
            var now = DateTime.UtcNow;

            var activeOrders = await _context.Orders
                .Include(o => o.IceCreams)
                .Where(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.InProgress)
                .OrderBy(o => o.OrderDate)
                .ToListAsync();

            var completedLast24h = await _context.Orders
                .Where(o => o.Status == OrderStatus.Completed
                    && o.CompletedAt != null
                    && o.StartedAt != null
                    && o.OrderDate >= now.AddHours(-24))
                .ToListAsync();

            double avgPrepTime = completedLast24h.Any()
                ? completedLast24h
                    .Select(o => (o.CompletedAt!.Value - o.StartedAt!.Value).TotalMinutes)
                    .Average()
                : 5.0; // Default 5 minutes if no data

            int queueAhead = activeOrders.Count;
            double estimatedWait = queueAhead * avgPrepTime;

            var activeOrderInfos = activeOrders.Select(o =>
            {
                var reference = o.StartedAt ?? o.OrderDate;
                var elapsed = (now - reference).TotalMinutes;
                return new ActiveOrderInfo(
                    o.Id,
                    o.CustomerName,
                    o.Status,
                    o.OrderType,
                    o.OrderDate,
                    o.StartedAt,
                    Math.Round(elapsed, 1),
                    o.IceCreams.Count
                );
            }).ToList();

            return new QueueStats(
                TotalInQueue: queueAhead,
                PendingCount: activeOrders.Count(o => o.Status == OrderStatus.Pending),
                InProgressCount: activeOrders.Count(o => o.Status == OrderStatus.InProgress),
                AveragePrepTimeMinutes: Math.Round(avgPrepTime, 1),
                EstimatedWaitMinutes: Math.Round(estimatedWait, 1),
                ActiveOrders: activeOrderInfos
            );
        }

        public async Task<double> GetAveragePrepTimeAsync(OrderType? orderType = null)
        {
            var cutoff = DateTime.UtcNow.AddHours(-24);

            var query = _context.Orders
                .Where(o => o.Status == OrderStatus.Completed
                    && o.CompletedAt != null
                    && o.StartedAt != null
                    && o.OrderDate >= cutoff);

            if (orderType.HasValue)
                query = query.Where(o => o.OrderType == orderType.Value);

            var orders = await query.ToListAsync();

            if (!orders.Any())
                return 5.0;

            return Math.Round(
                orders.Average(o => (o.CompletedAt!.Value - o.StartedAt!.Value).TotalMinutes),
                1
            );
        }

        public async Task<List<PeakHourData>> GetPeakHoursAsync(int days = 7)
        {
            var cutoff = DateTime.UtcNow.AddDays(-days);

            var orders = await _context.Orders
                .Where(o => o.OrderDate >= cutoff)
                .ToListAsync();

            var peakHours = orders
                .GroupBy(o => o.OrderDate.Hour)
                .Select(g =>
                {
                    var completed = g.Where(o =>
                        o.Status == OrderStatus.Completed &&
                        o.CompletedAt != null &&
                        o.StartedAt != null).ToList();

                    double avgWait = completed.Any()
                        ? completed.Average(o => (o.CompletedAt!.Value - o.OrderDate).TotalMinutes)
                        : 0;

                    return new PeakHourData(g.Key, g.Count(), Math.Round(avgWait, 1));
                })
                .OrderBy(p => p.Hour)
                .ToList();

            // Fill missing hours with zeros
            var result = Enumerable.Range(0, 24)
                .Select(h => peakHours.FirstOrDefault(p => p.Hour == h) ?? new PeakHourData(h, 0, 0))
                .ToList();

            return result;
        }

        public async Task<List<DailyMetrics>> GetHistoricalMetricsAsync(int days = 30)
        {
            var cutoff = DateTime.UtcNow.AddDays(-days).Date;

            var orders = await _context.Orders
                .Include(o => o.IceCreams)
                .Where(o => o.OrderDate >= cutoff)
                .ToListAsync();

            var metrics = orders
                .GroupBy(o => DateOnly.FromDateTime(o.OrderDate))
                .Select(g =>
                {
                    var completed = g.Where(o =>
                        o.Status == OrderStatus.Completed &&
                        o.CompletedAt != null &&
                        o.StartedAt != null).ToList();

                    double avgPrep = completed.Any()
                        ? completed.Average(o => (o.CompletedAt!.Value - o.StartedAt!.Value).TotalMinutes)
                        : 0;

                    return new DailyMetrics(
                        Date: g.Key,
                        TotalOrders: g.Count(),
                        CompletedOrders: completed.Count,
                        AveragePrepTimeMinutes: Math.Round(avgPrep, 1),
                        TotalRevenue: (double)g.Sum(o => o.TotalPrice)
                    );
                })
                .OrderByDescending(m => m.Date)
                .ToList();

            return metrics;
        }

        public async Task<byte[]> ExportToCsvAsync(int days = 30)
        {
            var cutoff = DateTime.UtcNow.AddDays(-days);

            var orders = await _context.Orders
                .Include(o => o.IceCreams)
                .Where(o => o.OrderDate >= cutoff)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("OrderId,CustomerName,OrderDate,Status,OrderType,IceCreamCount,TotalPrice,StartedAt,CompletedAt,PrepTimeMinutes");

            foreach (var order in orders)
            {
                double? prepTime = order.StartedAt.HasValue && order.CompletedAt.HasValue
                    ? Math.Round((order.CompletedAt.Value - order.StartedAt.Value).TotalMinutes, 1)
                    : null;

                sb.AppendLine(string.Join(",",
                    order.Id,
                    $"\"{EscapeCsv(order.CustomerName)}\"",
                    order.OrderDate.ToString("o", CultureInfo.InvariantCulture),
                    order.Status,
                    order.OrderType,
                    order.IceCreams.Count,
                    order.TotalPrice.ToString("F2", CultureInfo.InvariantCulture),
                    order.StartedAt?.ToString("o", CultureInfo.InvariantCulture) ?? "",
                    order.CompletedAt?.ToString("o", CultureInfo.InvariantCulture) ?? "",
                    prepTime?.ToString(CultureInfo.InvariantCulture) ?? ""
                ));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        private static string EscapeCsv(string value)
        {
            return value.Replace("\"", "\"\"")
                        .Replace("\r", " ")
                        .Replace("\n", " ");
        }
    }
}
