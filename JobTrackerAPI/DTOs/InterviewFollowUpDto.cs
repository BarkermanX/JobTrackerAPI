using System.ComponentModel.DataAnnotations;

namespace JobTrackerAPI.DTOs
{
    public sealed class InterviewFollowUpDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string JobTitle { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(Interview|Follow-up)$")]
        public string Type { get; set; } = "Interview";

        public DateTimeOffset ScheduledAt { get; set; }

        [MaxLength(300)]
        public string LocationOrLink { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Notes { get; set; } = string.Empty;
    }
}
