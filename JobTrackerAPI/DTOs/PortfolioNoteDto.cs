using System.ComponentModel.DataAnnotations;

namespace JobTrackerAPI.DTOs
{
    public sealed class PortfolioNoteDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(4000)]
        public string Content { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(Project win|Skills & strengths|Questions to ask|Other)$")]
        public string Category { get; set; } = "Project win";

        public DateTime UpdatedAtUtc { get; set; }
    }
}
