namespace JobTrackerAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public JobExpectation? JobExpectation { get; set; }
        public PersonalDetails? PersonalDetails { get; set; }
        public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
        public ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
        public ICollection<InterviewFollowUp> InterviewFollowUps { get; set; } = new List<InterviewFollowUp>();
    }
}