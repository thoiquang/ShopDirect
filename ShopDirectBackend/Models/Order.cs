namespace ShopDirectBackend.Models
{
    public class Order
    {
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string OrderStatus { get; set; } = "Đang xử lý";
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public List<OrderDetail> OrderDetails { get; set; } = new();
    }
}