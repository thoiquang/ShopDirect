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
                    OrderStatus = o.Status ?? "Chờ xử lý",
                    o.CreatedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] Order orderPayload)
        {
            if (string.IsNullOrWhiteSpace(orderPayload.OrderCode))
            {
                orderPayload.OrderCode = "HD" + DateTime.Now.ToString("yyMMddHHmmss");
            }
            orderPayload.CreatedAt = DateTime.Now;
            orderPayload.Status = "Chờ xử lý";

            _context.Orders.Add(orderPayload);
            await _context.SaveChangesAsync();

            return Ok(orderPayload);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng!" });

            order.Status = status;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật trạng thái thành công!", status = order.Status });
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
}