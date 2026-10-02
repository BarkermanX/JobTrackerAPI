namespace JobTrackerAPI.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }

        public string Token { get; set; } = string.Empty;

        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime ExpiresAt { get; set; }

        public bool Revoked { get; set; }

        public User? User { get; set; }

        public Guid TokenFamilyId { get; set; }


    }
}