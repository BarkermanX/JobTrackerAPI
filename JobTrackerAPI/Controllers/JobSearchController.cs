using System.Text.Json;
using JobTrackerAPI.DTOs;
using JobTrackerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrackerAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public sealed class JobSearchController : ControllerBase
    {
        private readonly IAdzunaJobSearchService searchService;
        private readonly IConfiguration configuration;
        private readonly ILogger<JobSearchController> logger;

        public JobSearchController(
            IAdzunaJobSearchService searchService,
            IConfiguration configuration,
            ILogger<JobSearchController> logger)
        {
            this.searchService = searchService;
            this.configuration = configuration;
            this.logger = logger;
        }

        [HttpGet("adzuna")]
        [ProducesResponseType<AdzunaSearchResponseDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        public async Task<ActionResult<AdzunaSearchResponseDto>> SearchAdzuna(
            [FromQuery] string? what,
            [FromQuery] string? where,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(what) || what.Trim().Length < 2)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "A job title or keyword is required.",
                    Detail = "Enter at least two characters to search for jobs."
                });
            }

            if (what.Length > 120 || (where?.Length ?? 0) > 120)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Search terms are too long.",
                    Detail = "Job title and location must each be no longer than 120 characters."
                });
            }

            if (string.IsNullOrWhiteSpace(configuration["Adzuna:AppId"])
                || string.IsNullOrWhiteSpace(configuration["Adzuna:AppKey"]))
            {
                return Problem(
                    statusCode: StatusCodes.Status503ServiceUnavailable,
                    title: "Job search is not configured.",
                    detail: "Adzuna credentials have not been configured for this application.");
            }

            try
            {
                var results = await searchService.SearchAsync(
                    what.Trim(),
                    where?.Trim(),
                    cancellationToken);

                return Ok(results);
            }
            catch (HttpRequestException exception)
            {
                logger.LogWarning(exception, "Adzuna job search request failed.");
                return Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "Job search provider unavailable.",
                    detail: "Adzuna could not complete the search. Please try again shortly.");
            }
            catch (JsonException exception)
            {
                logger.LogWarning(exception, "Adzuna returned an invalid job search response.");
                return Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "Invalid response from job search provider.",
                    detail: "Adzuna returned results in an unexpected format.");
            }
        }
    }
}
