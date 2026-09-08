using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ShopDirectBackend.Models
{
    public class ReturnRequest
    {
        [Key]
        [Column("ReturnRequestId")]
        public int ReturnId { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Reason { get; set; } = null!;

        [Column("Status")]
        public string ReturnStatus { get; set; } = "Chờ duyệt";

        public string? AdminNote { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}