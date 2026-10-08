using System.ComponentModel.DataAnnotations;

namespace JobTrackerAPI.DTOs
{
    public sealed class JobApplicationDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string JobTitle { get; set; } = string.Empty;

        [MaxLength(120)]
        public string Location { get; set; } = string.Empty;

        public DateOnly DateApplied { get; set; } = DateOnly.FromDateTime(DateTime.Today);

        [Required]
        [RegularExpression("^(Applied|Interview|Offer|Rejected|Withdrawn)$")]
        public string Status { get; set; } = "Applied";
    }

    public sealed class UpdateJobApplicationStatusDto
    {
        [Required]
        [RegularExpression("^(Applied|Interview|Offer|Rejected|Withdrawn)$")]
        public string Status { get; set; } = string.Empty;
    }
}
