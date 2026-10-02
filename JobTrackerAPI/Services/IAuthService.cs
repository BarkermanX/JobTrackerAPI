using JobTrackerAPI.Models;

namespace JobTrackerAPI.Services
{
    public interface IAuthService
    {
        User? ValidateUser(string username, string password);
    }
}