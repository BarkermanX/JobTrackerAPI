namespace JobTrackerAPI.DTOs
{
    public sealed class AdzunaJobDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string RedirectUrl { get; set; } = string.Empty;
        public string Created { get; set; } = string.Empty;
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
    }

    public sealed class AdzunaSearchResponseDto
    {
        public int Count { get; set; }
        public IReadOnlyList<AdzunaJobDto> Results { get; set; } = [];
    }
}
