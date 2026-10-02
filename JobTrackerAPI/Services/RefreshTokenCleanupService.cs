using Microsoft.EntityFrameworkCore;
using JobTrackerAPI.Data;

namespace JobTrackerAPI.Services
{
    public class RefreshTokenCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory scopeFactory;

        public RefreshTokenCleanupService(IServiceScopeFactory scopeFactory)
        {
            this.scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            using PeriodicTimer timer = new(TimeSpan.FromDays(1));

            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                using var scope = scopeFactory.CreateScope();

                var context = scope.ServiceProvider
                    .GetRequiredService<PersonnelDbContext>();

                var tokens = await context.RefreshTokens
                    .Where(rt =>
                        rt.Revoked ||
                        rt.ExpiresAt <= DateTime.UtcNow)
                    .ToListAsync(stoppingToken);

                context.RefreshTokens.RemoveRange(tokens);

                await context.SaveChangesAsync(stoppingToken);
            }
        }
    }
}