using System.Security.Claims;
using System.Text.Json;
using JobTrackerAPI.Data;
using JobTrackerAPI.DTOs;
using JobTrackerAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTrackerAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public sealed class JobExpectationsController : ControllerBase
    {
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
        private readonly PersonnelDbContext context;

        public JobExpectationsController(PersonnelDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        [ProducesResponseType<JobExpectationsDto>(StatusCodes.Status200OK)]
        public async Task<ActionResult<JobExpectationsDto>> Get(CancellationToken cancellationToken)
        {
            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var expectation = await context.JobExpectations
                .AsNoTracking()
                .SingleOrDefaultAsync(item => item.UserId == user.Id, cancellationToken);

            return Ok(expectation is null ? new JobExpectationsDto() : ToDto(expectation));
        }

        [HttpPut]
        [ProducesResponseType<JobExpectationsDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<JobExpectationsDto>> Save(
            JobExpectationsDto request,
            CancellationToken cancellationToken)
        {
            request.JobTitles = request.JobTitles
                .Select(title => title.Trim())
                .Where(title => title.Length > 0)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (request.JobTitles.Any(title => title.Length > 120))
            {
                ModelState.AddModelError(
                    nameof(request.JobTitles),
                    "Each job title must be no longer than 120 characters.");
            }

            request.CompanyPreferences = request.CompanyPreferences
                .Select(preference => preference.Trim())
                .Where(preference => preference.Length > 0)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (request.CompanyPreferences.Any(preference => preference.Length > 120))
            {
                ModelState.AddModelError(
                    nameof(request.CompanyPreferences),
                    "Each company preference must be no longer than 120 characters.");
            }

            if (request.MinimumSalary > request.MaximumSalary)
            {
                ModelState.AddModelError(
                    nameof(request.MaximumSalary),
                    "Maximum salary must be greater than or equal to minimum salary.");
            }

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var expectation = await context.JobExpectations
                .SingleOrDefaultAsync(item => item.UserId == user.Id, cancellationToken);

            if (expectation is null)
            {
                expectation = new JobExpectation { UserId = user.Id };
                context.JobExpectations.Add(expectation);
            }

            expectation.JobTitlesJson = JsonSerializer.Serialize(request.JobTitles, JsonOptions);
            expectation.CompanyPreferencesJson = JsonSerializer.Serialize(request.CompanyPreferences, JsonOptions);
            expectation.Location = request.Location.Trim();
            expectation.MaxCommuteMinutes = request.MaxCommuteMinutes;
            expectation.MinimumSalary = request.MinimumSalary;
            expectation.MaximumSalary = request.MaximumSalary;
            expectation.WorkArrangement = request.WorkArrangement;

            await context.SaveChangesAsync(cancellationToken);

            return Ok(ToDto(expectation));
        }

        private Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrWhiteSpace(username))
            {
                return Task.FromResult<User?>(null);
            }

            return context.Users.SingleOrDefaultAsync(
                user => user.Username == username,
                cancellationToken);
        }

        private static JobExpectationsDto ToDto(JobExpectation expectation)
        {
            return new JobExpectationsDto
            {
                JobTitles = JsonSerializer.Deserialize<List<string>>(
                    expectation.JobTitlesJson,
                    JsonOptions) ?? [],
                CompanyPreferences = JsonSerializer.Deserialize<List<string>>(
                    expectation.CompanyPreferencesJson,
                    JsonOptions) ?? [],
                Location = expectation.Location,
                MaxCommuteMinutes = expectation.MaxCommuteMinutes,
                MinimumSalary = expectation.MinimumSalary,
                MaximumSalary = expectation.MaximumSalary,
                WorkArrangement = expectation.WorkArrangement
            };
        }
    }
}
