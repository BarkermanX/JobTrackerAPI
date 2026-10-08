using System.ComponentModel.DataAnnotations;

namespace JobTrackerAPI.DTOs
{
    public sealed class PersonalDetailsDto
    {
        [MaxLength(120)]
        public string FullName { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(254)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(40)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(120)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string ProfessionalSummary { get; set; } = string.Empty;
    }
}
