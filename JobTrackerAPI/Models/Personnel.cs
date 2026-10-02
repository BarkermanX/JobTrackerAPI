using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace JobTrackerAPI.Models
{
    public class Personnel
    {
        public int PersonnelId { get; set; }

        [Required]
        public string Reference { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Pronouns { get; set; } = string.Empty;

        public string PreferredName { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }  //Nullable DateTime to allow for optional DOB

        public string Notes { get; set; } = string.Empty;
    }
}