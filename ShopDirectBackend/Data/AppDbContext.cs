using Microsoft.EntityFrameworkCore;
using ShopDirectBackend.Models;

namespace ShopDirectBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReturnRequest> ReturnRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>().Property(product => product.Price).HasPrecision(18, 2);
            modelBuilder.Entity<Order>().Property(order => order.TotalAmount).HasPrecision(18, 2);
            modelBuilder.Entity<OrderDetail>().Property(detail => detail.UnitPrice).HasPrecision(18, 2);
            modelBuilder.Entity<Review>().Property(review => review.Comment).HasMaxLength(1000);
            modelBuilder.Entity<ReturnRequest>().Property(item => item.Reason).HasMaxLength(1000);
            modelBuilder.Entity<ReturnRequest>().Property(item => item.Status).HasMaxLength(50);
        }
    }
}