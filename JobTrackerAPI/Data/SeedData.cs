using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using JobTrackerAPI.Models;

namespace JobTrackerAPI.Data
{
    public static class SeedData
    {
        public static void Initialize(
            PersonnelDbContext context,
            IPasswordHasher<User> passwordHasher)
        {
            // Don't create the user if it already exists
            if (!context.Users.Any(u => u.Username == "admin"))
            {

                var user = new User
                {
                    Username = "admin",
                    Role = "Admin"
                };

                user.PasswordHash = passwordHasher.HashPassword(
                    user,
                    "password");

                context.Users.Add(user);
            }

            if (!context.Users.Any(u => u.Username == "user1"))
            {


                var user = new User
                {
                    Username = "user1",
                    Role = "User"
                };

                user.PasswordHash = passwordHasher.HashPassword(
                    user,
                    "password");

                context.Users.Add(user);
                
            }

            context.SaveChanges();
        }
    }
}