using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopDirectBackend.Data;
using ShopDirectBackend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace ShopDirectBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách đánh giá của 1 sản phẩm
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetReviewsByProduct(int productId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    r.ReviewId,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    CustomerName = r.User != null ? r.User.FullName : "Khách hàng"
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // Thêm đánh giá mới
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] Review review)
        {
            if (review == null || review.Rating < 1 || review.Rating > 5)
                return BadRequest(new { message = "Dữ liệu đánh giá không hợp lệ." });

            var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            if (!await _context.Products.AnyAsync(product => product.ProductId == review.ProductId))
                return NotFound(new { message = "Không tìm thấy sản phẩm." });

            review.UserId = userId;

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cảm ơn bạn đã đánh giá sản phẩm!" });
        }
    }
}