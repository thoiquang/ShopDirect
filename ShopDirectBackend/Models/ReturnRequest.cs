using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ShopDirectBackend.Models
{
    public class ReturnRequest
    {
        [Key]
        public int ReturnId { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Reason { get; set; } = null!;

        public string ReturnStatus { get; set; } = "Đang chờ duyệt";

        public string? AdminNote { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}