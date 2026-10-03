using JobTrackerAPI.DTOs;

namespace JobTrackerAPI.Services
{
    public interface IAdzunaJobSearchService
    {
        Task<AdzunaSearchResponseDto> SearchAsync(
            string what,
            string? where,
            CancellationToken cancellationToken);
    }
}
