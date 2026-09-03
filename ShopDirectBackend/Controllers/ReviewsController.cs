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
    [Route("api/products/{productId}/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetReviews(int productId)
        {
            var reviews = await _context.Reviews.Where(review => review.ProductId == productId)
                .OrderByDescending(review => review.CreatedAt).ToListAsync();
            return Ok(reviews);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview(int productId, [FromBody] ReviewRequest request)
        {
            if (request.Rating < 1 || request.Rating > 5 || string.IsNullOrWhiteSpace(request.Comment))
                return BadRequest(new { message = "Đánh giá phải có từ 1 đến 5 sao và nội dung." });

            var review = new Review
            {
                ProductId = productId,
                UserId = GetUserId(),
                Rating = request.Rating,
                Comment = request.Comment.Trim()
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return Ok(review);
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(claim ?? throw new UnauthorizedAccessException());
        }
    }

    public class ReviewRequest
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}
