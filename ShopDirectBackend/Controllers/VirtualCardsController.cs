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
    [Route("api/virtual-cards")]
    public class VirtualCardsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VirtualCardsController(AppDbContext context) => _context = context;

        [HttpGet("mine")]
        [Authorize]
        public async Task<IActionResult> GetMine()
        {
            var userId = GetUserId();
            var card = await _context.VirtualCards.AsNoTracking().FirstOrDefaultAsync(item => item.UserId == userId && item.IsActive);
            if (card == null) return NotFound(new { message = "Tài khoản chưa được admin cấp thẻ ảo." });
            return Ok(ToResponse(card));
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAll()
        {
            var cards = await _context.VirtualCards.Include(item => item.User).OrderByDescending(item => item.CreatedAt).ToListAsync();
            return Ok(cards.Select(card => new
            {
                card.VirtualCardId,
                card.UserId,
                userName = card.User?.FullName ?? "Khách hàng",
                userEmail = card.User?.Email ?? "",
                card.CardholderName,
                maskedNumber = Mask(card.CardNumber),
                card.Expiry,
                card.IsActive,
                card.CreatedAt
            }));
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] CreateVirtualCardRequest request)
        {
            if (request.UserId <= 0 || string.IsNullOrWhiteSpace(request.CardholderName))
                return BadRequest(new { message = "Khách hàng và tên chủ thẻ là bắt buộc." });
            if (!await _context.Users.AnyAsync(user => user.UserId == request.UserId))
                return NotFound(new { message = "Không tìm thấy khách hàng." });

            var existing = await _context.VirtualCards.FirstOrDefaultAsync(card => card.UserId == request.UserId && card.IsActive);
            if (existing != null) return Conflict(new { message = "Khách hàng đã có thẻ ảo đang hoạt động." });

            var card = new VirtualCard
            {
                UserId = request.UserId,
                CardholderName = request.CardholderName.Trim().ToUpperInvariant(),
                CardNumber = GenerateCardNumber(),
                Expiry = DateTime.UtcNow.AddYears(3).ToString("MM/yy")
            };
            _context.VirtualCards.Add(card);
            await _context.SaveChangesAsync();
            return Ok(ToResponse(card));
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(claim ?? throw new UnauthorizedAccessException());
        }

        private static string GenerateCardNumber() => $"SD{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}{Random.Shared.Next(1000, 9999)}";
        private static string Mask(string number) => $"**** **** **** {number[^4..]}";
        private static object ToResponse(VirtualCard card) => new { card.VirtualCardId, card.UserId, card.CardholderName, card.CardNumber, card.Expiry, card.IsActive, card.CreatedAt };
    }

    public class CreateVirtualCardRequest
    {
        public int UserId { get; set; }
        public string CardholderName { get; set; } = string.Empty;
    }
}