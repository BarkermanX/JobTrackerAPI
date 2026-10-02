using Microsoft.AspNetCore.Identity;
using JobTrackerAPI.Data;
using JobTrackerAPI.Models;

namespace JobTrackerAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly PersonnelDbContext context;
        private readonly IPasswordHasher<User> passwordHasher;

        public AuthService(
            PersonnelDbContext context,
            IPasswordHasher<User> passwordHasher)
        {
            this.context = context;
            this.passwordHasher = passwordHasher;
        }

        public User? ValidateUser(string username, string password)
        {
            var user = context.Users
                .FirstOrDefault(u => u.Username == username);

            if (user == null)
            {
                return null;
            }

            var result = passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                password);

            if (result == PasswordVerificationResult.Success)
            {
                return user;
            }

            return null;
        }
    }
}