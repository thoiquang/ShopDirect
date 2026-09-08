using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShopDirectBackend.Data;
using ShopDirectBackend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ShopDirectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var identifier = request.Email.Trim();
            var normalizedPhone = NormalizePhone(identifier);
            var users = await _context.Users.ToListAsync();
            var user = users.FirstOrDefault(item =>
                item.PasswordHash == request.Password &&
                (string.Equals(item.Email?.Trim(), identifier, StringComparison.OrdinalIgnoreCase) ||
                 NormalizePhone(item.Phone) == normalizedPhone));

            if (user == null)
            {
                return BadRequest(new { message = "Email hoặc mật khẩu không chính xác." });
            }

            var role = user.RoleId == 1 ? "admin" : "user";
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, role)
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: credentials);

            return Ok(new
            {
                userId = user.UserId,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                address = user.Address,
                role,
                token = new JwtSecurityTokenHandler().WriteToken(token)
            });
        }

        private static string NormalizePhone(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
            var digits = new string(phone.Where(char.IsDigit).ToArray());
            if (digits.StartsWith("84") && digits.Length == 11)
                return "0" + digits[2..];
            return digits;
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return Ok(new { userId = user.UserId, fullName = user.FullName, email = user.Email, phone = user.Phone, address = user.Address, role = user.RoleId == 1 ? "admin" : "user" });
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] ProfileUpdateRequest request)
        {
            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { message = "Họ tên và email không được để trống." });

            var emailUsed = await _context.Users.AnyAsync(item => item.Email == request.Email && item.UserId != userId);
            if (emailUsed) return BadRequest(new { message = "Email đã được sử dụng." });

            user.FullName = request.FullName.Trim();
            user.Email = request.Email.Trim();
            user.Phone = request.Phone?.Trim();
            user.Address = request.Address?.Trim();
            await _context.SaveChangesAsync();
            return Ok(new { userId = user.UserId, fullName = user.FullName, email = user.Email, phone = user.Phone, address = user.Address, role = user.RoleId == 1 ? "admin" : "user" });
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(claim ?? throw new UnauthorizedAccessException("User identity is missing."));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Phone))
                return BadRequest(new { message = "Họ tên, email, mật khẩu và số điện thoại là bắt buộc." });

            var normalizedPhone = request.Phone.Trim();
            if (normalizedPhone.Length < 9 || normalizedPhone.Length > 11 || !normalizedPhone.All(char.IsDigit))
                return BadRequest(new { message = "Số điện thoại phải gồm 9 đến 11 chữ số." });

            var exists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (exists)
            {
                return BadRequest(new { message = "Email đã tồn tại." });
            }

            var newUser = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = request.Password,
                Phone = normalizedPhone,
                RoleId = 2
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công." });
        }

        [HttpGet("users")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.UserId,
                    u.FullName,
                    u.Email,
                    role = u.RoleId == 1 ? "admin" : "user"
                })
                .ToListAsync();

            return Ok(users);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }

    public class ProfileUpdateRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
}