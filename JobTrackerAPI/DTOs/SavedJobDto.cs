using System.ComponentModel.DataAnnotations;

namespace JobTrackerAPI.DTOs
{
    public sealed class SavedJobDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string JobTitle { get; set; } = string.Empty;

        [MaxLength(120)]
        public string Salary { get; set; } = string.Empty;

        [MaxLength(2048)]
        public string JobUrl { get; set; } = string.Empty;

        [MaxLength(120)]
        public string Location { get; set; } = string.Empty;

        public DateOnly? ClosingDate { get; set; }

        [MaxLength(2000)]
        public string Notes { get; set; } = string.Empty;
    }
}
