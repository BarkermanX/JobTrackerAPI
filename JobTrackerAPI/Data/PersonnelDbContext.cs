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

            modelBuilder.Entity<JobExpectation>()
                .HasOne(expectation => expectation.User)
                .WithOne(user => user.JobExpectation)
                .HasForeignKey<JobExpectation>(expectation => expectation.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<JobExpectation>()
                .Property(expectation => expectation.Location)
                .HasMaxLength(120);

            modelBuilder.Entity<JobExpectation>()
                .Property(expectation => expectation.WorkArrangement)
                .HasMaxLength(16);

            modelBuilder.Entity<JobExpectation>()
                .Property(expectation => expectation.MinimumSalary)
                .HasPrecision(18, 2);

            modelBuilder.Entity<JobExpectation>()
                .Property(expectation => expectation.MaximumSalary)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PersonalDetails>()
                .HasOne(details => details.User)
                .WithOne(user => user.PersonalDetails)
                .HasForeignKey<PersonalDetails>(details => details.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PersonalDetails>()
                .Property(details => details.FullName)
                .HasMaxLength(120);

            modelBuilder.Entity<PersonalDetails>()
                .Property(details => details.Email)
                .HasMaxLength(254);

            modelBuilder.Entity<PersonalDetails>()
                .Property(details => details.Phone)
                .HasMaxLength(40);

            modelBuilder.Entity<PersonalDetails>()
                .Property(details => details.Location)
                .HasMaxLength(120);

            modelBuilder.Entity<PersonalDetails>()
                .Property(details => details.ProfessionalSummary)
                .HasMaxLength(1000);

            modelBuilder.Entity<JobApplication>()
                .HasOne(application => application.User)
                .WithMany(user => user.JobApplications)
                .HasForeignKey(application => application.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<JobApplication>()
                .Property(application => application.CompanyName)
                .HasMaxLength(120);

            modelBuilder.Entity<JobApplication>()
                .Property(application => application.JobTitle)
                .HasMaxLength(120);

            modelBuilder.Entity<JobApplication>()
                .Property(application => application.Location)
                .HasMaxLength(120);

            modelBuilder.Entity<JobApplication>()
                .Property(application => application.Status)
                .HasMaxLength(24);

            modelBuilder.Entity<JobApplication>()
                .Property(application => application.DateApplied)
                .HasColumnType("date");

            modelBuilder.Entity<SavedJob>()
                .HasOne(savedJob => savedJob.User)
                .WithMany(user => user.SavedJobs)
                .HasForeignKey(savedJob => savedJob.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedJob>()
                .Property(savedJob => savedJob.CompanyName)
                .HasMaxLength(120);

            modelBuilder.Entity<SavedJob>()
                .Property(savedJob => savedJob.JobTitle)
                .HasMaxLength(120);

            modelBuilder.Entity<SavedJob>()
                .Property(savedJob => savedJob.Salary)
                .HasMaxLength(120);

            modelBuilder.Entity<SavedJob>()
                .Property(savedJob => savedJob.JobUrl)
                .HasMaxLength(2048);

            modelBuilder.Entity<SavedJob>()
                .Property(savedJob => savedJob.Location)
                .HasMaxLength(120);

            modelBuilder.Entity<SavedJob>()
                .Property(savedJob => savedJob.ClosingDate)
                .HasColumnType("date");

            modelBuilder.Entity<SavedJob>()
                .Property(savedJob => savedJob.Notes)
                .HasMaxLength(2000);
        }

        public DbSet<Personnel> Personnel { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<JobExpectation> JobExpectations { get; set; }
        public DbSet<PersonalDetails> PersonalDetails { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }
        public DbSet<SavedJob> SavedJobs { get; set; }
    }
}