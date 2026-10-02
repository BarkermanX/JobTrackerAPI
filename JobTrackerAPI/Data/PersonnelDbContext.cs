using Microsoft.EntityFrameworkCore;
using JobTrackerAPI.Models;

namespace JobTrackerAPI.Data
{
    public class PersonnelDbContext : DbContext
    {
        public PersonnelDbContext(DbContextOptions<PersonnelDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Personnel>()
                .HasIndex(p => new { p.Email, p.Reference })
                .IsUnique();
        }

        public DbSet<Personnel> Personnel { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
    }
}