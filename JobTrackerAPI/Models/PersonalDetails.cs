namespace JobTrackerAPI.Models
{
    public sealed class PersonalDetails
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ProfessionalSummary { get; set; } = string.Empty;
        public User? User { get; set; }
    }
}
