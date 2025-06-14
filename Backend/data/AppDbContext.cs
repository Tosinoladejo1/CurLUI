using Microsoft.EntityFrameworkCore;
using ApiIntegrationUtility.Models;

namespace ApiIntegrationUtility.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Integration> Integrations { get; set; }
    public DbSet<RequestItem> RequestItems { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Integration>()
            .HasMany(i => i.Requests)
            .WithOne(r => r.Integration)
            .HasForeignKey(r => r.IntegrationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
