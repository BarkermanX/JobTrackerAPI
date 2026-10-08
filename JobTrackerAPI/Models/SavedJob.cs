namespace JobTrackerAPI.Models
{
    public sealed class SavedJob
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Salary { get; set; } = string.Empty;
        public string JobUrl { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateOnly? ClosingDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public User? User { get; set; }
    }
}
