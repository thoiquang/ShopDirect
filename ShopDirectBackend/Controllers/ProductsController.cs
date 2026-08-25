using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopDirectBackend.Data;
using ShopDirectBackend.Models;

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

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products.Include(p => p.Category).ToListAsync();
            return Ok(products.Select(p => new
            {
                p.ProductId,
                p.ProductName,
                p.CategoryId,
                CategoryCode = p.Category != null ? p.Category.CategoryCode : "",
                CategoryName = p.Category != null ? p.Category.CategoryName : "",
                p.Price,
                p.ImageUrl,
                p.Description
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.ProductId == id);
            if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

            return Ok(new
            {
                product.ProductId,
                product.ProductName,
                product.CategoryId,
                CategoryCode = product.Category != null ? product.Category.CategoryCode : "",
                CategoryName = product.Category != null ? product.Category.CategoryName : "",
                product.Price,
                product.ImageUrl,
                product.Description
            });
        }

        [HttpGet("category/{categoryCode}")]
        public async Task<IActionResult> GetByCategory(string categoryCode)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryCode == categoryCode);
            if (category == null) return Ok(new List<Product>());

            var products = await _context.Products.Where(p => p.CategoryId == category.CategoryId).ToListAsync();
            return Ok(products.Select(p => new
            {
                p.ProductId,
                p.ProductName,
                p.CategoryId,
                CategoryCode = category.CategoryCode,
                CategoryName = category.CategoryName,
                p.Price,
                p.ImageUrl,
                p.Description
            }));
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updated)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

            product.ProductName = updated.ProductName;
            product.CategoryId = updated.CategoryId;
            product.Price = updated.Price;
            product.ImageUrl = updated.ImageUrl;
            product.Description = updated.Description;

            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa sản phẩm thành công" });
        }
    }
}