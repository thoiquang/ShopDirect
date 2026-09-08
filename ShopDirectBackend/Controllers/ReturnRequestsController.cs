using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopDirectBackend.Data;
using ShopDirectBackend.Models;

namespace ShopDirectBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReturnRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReturnRequestsController(AppDbContext context)
        {
            _context = context;
        }

        // Khách hàng gửi yêu cầu trả hàng
        [HttpPost]
        public async Task<IActionResult> CreateReturnRequest([FromBody] ReturnRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Reason))
                return BadRequest(new { message = "Vui lòng nhập lý do trả hàng." });

            _context.ReturnRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Yêu cầu trả hàng đã được gửi và đang chờ duyệt." });
        }

        // Admin: Lấy danh sách tất cả yêu cầu trả hàng
        [HttpGet]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await _context.ReturnRequests
                .Include(r => r.Order)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    r.ReturnId,
                    r.OrderId,
                    OrderCode = r.Order != null ? r.Order.OrderCode : "",
                    CustomerName = r.User != null ? r.User.FullName : "",
                    r.Reason,
                    r.ReturnStatus,
                    r.AdminNote,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        // Admin: Cập nhật trạng thái duyệt/từ chối
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateReturnStatus(int id, [FromBody] UpdateReturnDto dto)
        {
            var request = await _context.ReturnRequests.FindAsync(id);
            if (request == null) return NotFound(new { message = "Không tìm thấy yêu cầu." });

            request.ReturnStatus = dto.Status;
            if (!string.IsNullOrEmpty(dto.AdminNote))
            {
                request.AdminNote = dto.AdminNote;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật trạng thái yêu cầu trả hàng." });
        }
    }

    public class UpdateReturnDto
    {
        public string Status { get; set; } = null!;
        public string? AdminNote { get; set; }
    }
}