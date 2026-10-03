using System.Text.Json;
using JobTrackerAPI.DTOs;

namespace JobTrackerAPI.Services
{
    public sealed class AdzunaJobSearchService : IAdzunaJobSearchService
    {
        private const string ApiBaseUrl = "https://api.adzuna.com/v1/api/jobs";
        private readonly HttpClient httpClient;
        private readonly IConfiguration configuration;

        public AdzunaJobSearchService(HttpClient httpClient, IConfiguration configuration)
        {
            this.httpClient = httpClient;
            this.configuration = configuration;
        }

        public async Task<AdzunaSearchResponseDto> SearchAsync(
            string what,
            string? where,
            CancellationToken cancellationToken)
        {
            var appId = configuration["Adzuna:AppId"];
            var appKey = configuration["Adzuna:AppKey"];

            if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(appKey))
            {
                throw new InvalidOperationException("Adzuna credentials are not configured.");
            }

            var country = configuration["Adzuna:CountryCode"] ?? "gb";
            if (country.Length != 2 || country.Any(character => !char.IsAsciiLetter(character)))
            {
                throw new InvalidOperationException("Adzuna country code must be a two-letter code.");
            }

            var query = new List<string>
            {
                $"app_id={Uri.EscapeDataString(appId)}",
                $"app_key={Uri.EscapeDataString(appKey)}",
                "results_per_page=10",
                $"what={Uri.EscapeDataString(what)}"
            };

            if (!string.IsNullOrWhiteSpace(where))
            {
                query.Add($"where={Uri.EscapeDataString(where)}");
            }

            var requestUrl = $"{ApiBaseUrl}/{country.ToLowerInvariant()}/search/1?{string.Join("&", query)}";
            using var response = await httpClient.GetAsync(
                requestUrl,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);

            response.EnsureSuccessStatusCode();

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(
                stream,
                cancellationToken: cancellationToken);

            var root = document.RootElement;
            var count = root.GetProperty("count").GetInt32();
            var resultsElement = root.GetProperty("results");
            if (resultsElement.ValueKind != JsonValueKind.Array)
            {
                throw new JsonException("Adzuna returned an invalid results collection.");
            }

            var results = resultsElement.EnumerateArray()
                .Select(MapJob)
                .ToArray();

            return new AdzunaSearchResponseDto
            {
                Count = count,
                Results = results
            };
        }

        private static AdzunaJobDto MapJob(JsonElement element)
        {
            return new AdzunaJobDto
            {
                Id = element.TryGetProperty("id", out var id) ? id.ToString() : string.Empty,
                Title = GetString(element, "title"),
                Company = GetNestedString(element, "company", "display_name"),
                Location = GetNestedString(element, "location", "display_name"),
                Description = GetString(element, "description"),
                RedirectUrl = GetString(element, "redirect_url"),
                Created = GetString(element, "created"),
                SalaryMin = GetDecimal(element, "salary_min"),
                SalaryMax = GetDecimal(element, "salary_max")
            };
        }

        private static string GetString(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var value)
                && value.ValueKind == JsonValueKind.String
                ? value.GetString() ?? string.Empty
                : string.Empty;
        }

        private static string GetNestedString(
            JsonElement element,
            string objectName,
            string propertyName)
        {
            return element.TryGetProperty(objectName, out var nested)
                && nested.ValueKind == JsonValueKind.Object
                ? GetString(nested, propertyName)
                : string.Empty;
        }

        private static decimal? GetDecimal(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var value)
                && value.ValueKind == JsonValueKind.Number
                && value.TryGetDecimal(out var result)
                ? result
                : null;
        }
    }
}
