using System.Security.Claims;
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
    public sealed class SavedJobsController : ControllerBase
    {
        private readonly PersonnelDbContext context;

        public SavedJobsController(PersonnelDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        [ProducesResponseType<List<SavedJobDto>>(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<SavedJobDto>>> Get(CancellationToken cancellationToken)
        {
            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var savedJobs = await context.SavedJobs
                .AsNoTracking()
                .Where(savedJob => savedJob.UserId == user.Id)
                .OrderBy(savedJob => savedJob.ClosingDate == null)
                .ThenBy(savedJob => savedJob.ClosingDate)
                .ThenByDescending(savedJob => savedJob.CreatedAtUtc)
                .ToListAsync(cancellationToken);

            return Ok(savedJobs.Select(ToDto).ToList());
        }

        [HttpPost]
        [ProducesResponseType<SavedJobDto>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<SavedJobDto>> Create(
            SavedJobDto request,
            CancellationToken cancellationToken)
        {
            NormalizeAndValidate(request);

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var savedJob = new SavedJob
            {
                UserId = user.Id,
                CompanyName = request.CompanyName,
                JobTitle = request.JobTitle,
                Salary = request.Salary,
                JobUrl = request.JobUrl,
                Location = request.Location,
                ClosingDate = request.ClosingDate,
                Notes = request.Notes,
                CreatedAtUtc = DateTime.UtcNow
            };

            context.SavedJobs.Add(savedJob);
            await context.SaveChangesAsync(cancellationToken);

            return Created("/api/SavedJobs", ToDto(savedJob));
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType<SavedJobDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<SavedJobDto>> Update(
            int id,
            SavedJobDto request,
            CancellationToken cancellationToken)
        {
            NormalizeAndValidate(request);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var savedJob = await context.SavedJobs
                .SingleOrDefaultAsync(
                    item => item.Id == id && item.UserId == user.Id,
                    cancellationToken);

            if (savedJob is null)
            {
                return NotFound();
            }

            savedJob.CompanyName = request.CompanyName;
            savedJob.JobTitle = request.JobTitle;
            savedJob.Salary = request.Salary;
            savedJob.JobUrl = request.JobUrl;
            savedJob.Location = request.Location;
            savedJob.ClosingDate = request.ClosingDate;
            savedJob.Notes = request.Notes;

            await context.SaveChangesAsync(cancellationToken);

            return Ok(ToDto(savedJob));
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var savedJob = await context.SavedJobs
                .SingleOrDefaultAsync(
                    item => item.Id == id && item.UserId == user.Id,
                    cancellationToken);

            if (savedJob is null)
            {
                return NotFound();
            }

            context.SavedJobs.Remove(savedJob);
            await context.SaveChangesAsync(cancellationToken);

            return NoContent();
        }

        private void NormalizeAndValidate(SavedJobDto request)
        {
            request.CompanyName = request.CompanyName?.Trim() ?? string.Empty;
            request.JobTitle = request.JobTitle?.Trim() ?? string.Empty;
            request.Salary = request.Salary?.Trim() ?? string.Empty;
            request.JobUrl = request.JobUrl?.Trim() ?? string.Empty;
            request.Location = request.Location?.Trim() ?? string.Empty;
            request.Notes = request.Notes?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(request.CompanyName))
            {
                ModelState.AddModelError(nameof(request.CompanyName), "Company is required.");
            }

            if (string.IsNullOrWhiteSpace(request.JobTitle))
            {
                ModelState.AddModelError(nameof(request.JobTitle), "Job title is required.");
            }

            if (request.JobUrl.Length > 0 &&
                (!Uri.TryCreate(request.JobUrl, UriKind.Absolute, out var jobUri) ||
                 (jobUri.Scheme != Uri.UriSchemeHttp && jobUri.Scheme != Uri.UriSchemeHttps)))
            {
                ModelState.AddModelError(nameof(request.JobUrl), "Enter a valid HTTP or HTTPS job URL.");
            }
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

        private static SavedJobDto ToDto(SavedJob savedJob)
        {
            return new SavedJobDto
            {
                Id = savedJob.Id,
                CompanyName = savedJob.CompanyName,
                JobTitle = savedJob.JobTitle,
                Salary = savedJob.Salary,
                JobUrl = savedJob.JobUrl,
                Location = savedJob.Location,
                ClosingDate = savedJob.ClosingDate,
                Notes = savedJob.Notes
            };
        }
    }
}
