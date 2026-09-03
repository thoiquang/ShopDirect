namespace ShopDirectBackend.Models
{
    public class ReturnRequest
    {
        public int ReturnRequestId { get; set; }
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Chờ duyệt";
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
