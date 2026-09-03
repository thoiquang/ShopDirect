using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopDirectBackend.Data;
using ShopDirectBackend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ShopDirectBackend.Controllers
{
    [ApiController]
    [Route("api/returns")]
    [Authorize]
    public class ReturnsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReturnsController(AppDbContext context) => _context = context;

        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var userId = GetUserId();
            return Ok(await _context.ReturnRequests.Where(item => item.UserId == userId).OrderByDescending(item => item.CreatedAt).ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReturnRequestInput request)
        {
            if (request.OrderId <= 0 || string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { message = "Đơn hàng và lý do trả hàng là bắt buộc." });

            var userId = GetUserId();
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == request.OrderId && item.UserId == userId);
            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng của bạn." });
            if (order.OrderStatus != "Hoàn tất") return BadRequest(new { message = "Chỉ có thể trả hàng sau khi đơn hoàn tất." });

            var exists = await _context.ReturnRequests.AnyAsync(item => item.OrderId == request.OrderId && item.UserId == userId && item.Status == "Chờ duyệt");
            if (exists) return BadRequest(new { message = "Đơn hàng này đã có yêu cầu trả hàng." });

            var result = new ReturnRequest { OrderId = request.OrderId, UserId = userId, Reason = request.Reason.Trim() };
            _context.ReturnRequests.Add(result);
            await _context.SaveChangesAsync();
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAll() => Ok(await _context.ReturnRequests.OrderByDescending(item => item.CreatedAt).ToListAsync());

        [HttpPut("{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ReturnStatusInput request)
        {
            var item = await _context.ReturnRequests.FindAsync(id);
            if (item == null) return NotFound();
            item.Status = request.Status;
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(claim ?? throw new UnauthorizedAccessException());
        }
    }

    public class ReturnRequestInput
    {
        public int OrderId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ReturnStatusInput
    {
        public string Status { get; set; } = string.Empty;
    }
}
