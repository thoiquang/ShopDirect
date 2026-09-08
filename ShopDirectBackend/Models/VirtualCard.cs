using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopDirectBackend.Models
{
    public class VirtualCard
    {
        [Key]
        public int VirtualCardId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(80)]
        public string CardholderName { get; set; } = string.Empty;

        [Required]
        [MaxLength(32)]
        public string CardNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(4)]
        public string Expiry { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
