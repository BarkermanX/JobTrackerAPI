namespace JobTrackerAPI.Models
{
    public sealed class JobExpectation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string JobTitlesJson { get; set; } = "[]";
        public string CompanyPreferencesJson { get; set; } = "[]";
        public string Location { get; set; } = string.Empty;
        public int MaxCommuteMinutes { get; set; }
        public decimal MinimumSalary { get; set; }
        public decimal MaximumSalary { get; set; }
        public bool Remote { get; set; }
        public User? User { get; set; }
    }
}
