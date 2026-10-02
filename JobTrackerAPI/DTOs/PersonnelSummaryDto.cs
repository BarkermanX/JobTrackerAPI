namespace JobTrackerAPI.DTOs
{
    public class PersonnelSummaryDto
    {
        public int PersonnelId { get; set; }

        public string Reference { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
    }
}