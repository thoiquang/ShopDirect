namespace ShopDirectBackend.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public int  RoleId { get; set; } = 2; // Default role is User
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}