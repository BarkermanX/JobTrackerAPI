namespace JobTrackerAPI.Models
{
    public sealed class JobApplication
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateOnly DateApplied { get; set; }
        public string Status { get; set; } = "Applied";
        public User? User { get; set; }
    }
}
