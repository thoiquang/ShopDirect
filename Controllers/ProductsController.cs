using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ShopDirectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/products (Lấy tất cả sản phẩm)
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }

        // GET: api/products/category/dientu (Lấy sản phẩm theo danh mục)
        [HttpGet("category/{categoryCode}")]
        public async Task<IActionResult> GetByCategory(string categoryCode)
        {
            var products = await _context.Products
                .Where(p => p.CategoryCode == categoryCode)
                .ToListAsync();
            return Ok(products);
        }
    }
}