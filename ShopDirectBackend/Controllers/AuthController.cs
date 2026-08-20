using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopDirectBackend.Data;
using ShopDirectBackend.Models;

namespace ShopDirectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == request.Password);

            if (user == null)
            {
                return BadRequest(new { message = "Email hoặc mật khẩu không chính xác." });
            }

            return Ok(new
            {
                userId = user.UserId,
                fullName = user.FullName,
                email = user.Email,
                role = user.RoleId == 1 ? "admin" : "user"
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
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
                RoleId = 2
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công." });
        }

        [HttpGet("users")]
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
    }
}