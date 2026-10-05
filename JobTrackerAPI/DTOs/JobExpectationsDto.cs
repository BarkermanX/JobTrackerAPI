using System.ComponentModel.DataAnnotations;

namespace JobTrackerAPI.DTOs
{
    public sealed class JobExpectationsDto
    {
        [Required]
        [MaxLength(10)]
        public List<string> JobTitles { get; set; } = [];

        [Required]
        [MaxLength(10)]
        public List<string> CompanyPreferences { get; set; } = [];

        [Required]
        [MaxLength(120)]
        public string Location { get; set; } = string.Empty;

        [Range(0, 1440)]
        public int MaxCommuteMinutes { get; set; } = 30;

        [Range(0, 10000000)]
        public decimal MinimumSalary { get; set; } = 50000;

        [Range(0, 10000000)]
        public decimal MaximumSalary { get; set; } = 60000;

        public bool Remote { get; set; } = true;
    }
}
