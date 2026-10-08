namespace JobTrackerAPI.Models
{
    public sealed class InterviewFollowUp
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Type { get; set; } = "Interview";
        public DateTimeOffset ScheduledAt { get; set; }
        public string LocationOrLink { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public User? User { get; set; }
    }
}
