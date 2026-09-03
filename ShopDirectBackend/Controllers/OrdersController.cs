using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopDirectBackend.Data;
using ShopDirectBackend.Models;

namespace ShopDirectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _context.Orders
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.OrderId,
                    o.OrderCode,
                    o.CustomerName,
                    o.CustomerPhone,
                    o.CustomerAddress,
                    o.TotalAmount,
                    o.PaymentMethod,
                    OrderStatus = o.OrderStatus,
                    o.CreatedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequest request)
        {
            var order = new Order
            {
                UserId = request.UserId,
                OrderCode = "HD" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()[^6..],
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                CustomerAddress = request.CustomerAddress,
                TotalAmount = request.TotalAmount,
                PaymentMethod = request.PaymentMethod,
                OrderStatus = "Chờ xử lý",
                CreatedAt = DateTime.Now
            };

            if (request.Items != null)
            {
                foreach (var item in request.Items)
                {
                    order.OrderDetails.Add(new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice
                    });
                }
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] StatusUpdateRequest request)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng!" });

            order.OrderStatus = request.Status;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật trạng thái thành công!", orderStatus = order.OrderStatus });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng!" });

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa đơn hàng thành công" });
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalRevenue = await _context.Orders.SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
            var ordersCount = await _context.Orders.CountAsync();
            var productsCount = await _context.Products.CountAsync();
            var usersCount = await _context.Users.CountAsync();

            return Ok(new
            {
                revenue = totalRevenue,
                ordersCount,
                productsCount,
                usersCount
            });
        }
    }

    public class OrderRequest
    {
        public int? UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public List<OrderItemRequest>? Items { get; set; }
    }

    public class OrderItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}