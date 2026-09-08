using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ShopDirectBackend.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

try
{
    await EnsureVirtualCardsTableAsync(app.Services);
}
catch (Exception exception)
{
    app.Logger.LogWarning(exception, "VirtualCards schema check failed. Run ShopDirectDB.sql if card management is unavailable.");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static async Task EnsureVirtualCardsTableAsync(IServiceProvider services)
{
    await using var scope = services.CreateAsyncScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.ExecuteSqlRawAsync(@"
IF OBJECT_ID(N'dbo.VirtualCards', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[VirtualCards](
        [VirtualCardId] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] int NOT NULL,
        [CardholderName] nvarchar(80) NOT NULL,
        [CardNumber] nvarchar(32) NOT NULL,
        [Expiry] nvarchar(4) NOT NULL,
        [IsActive] bit NOT NULL CONSTRAINT [DF_VirtualCards_IsActive] DEFAULT (1),
        [CreatedAt] datetime NOT NULL CONSTRAINT [DF_VirtualCards_CreatedAt] DEFAULT (getdate()),
        CONSTRAINT [FK_VirtualCards_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]),
        CONSTRAINT [UQ_VirtualCards_CardNumber] UNIQUE ([CardNumber])
    );
END");
}