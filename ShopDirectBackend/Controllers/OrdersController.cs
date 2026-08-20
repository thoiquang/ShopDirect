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
                .ToListAsync();
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequest request)
        {
            var order = new Order
            {
                OrderCode = "HD" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()[^6..],
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                CustomerAddress = request.CustomerAddress,
                TotalAmount = request.TotalAmount,
                PaymentMethod = request.PaymentMethod,
                CreatedAt = DateTime.Now
            };

            foreach (var item in request.Items)
            {
                order.OrderDetails.Add(new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                });
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalRevenue = await _context.Orders.SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
            var totalOrders = await _context.Orders.CountAsync();
            var totalProducts = await _context.Products.CountAsync();
            var totalUsers = await _context.Users.CountAsync();

            return Ok(new
            {
                revenue = totalRevenue,
                ordersCount = totalOrders,
                productsCount = totalProducts,
                usersCount = totalUsers
            });
        }
    }

    public class OrderRequest
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public List<OrderItemRequest> Items { get; set; } = new();
    }

    public class OrderItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}