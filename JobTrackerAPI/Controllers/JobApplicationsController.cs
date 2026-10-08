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
    public sealed class JobApplicationsController : ControllerBase
    {
        private readonly PersonnelDbContext context;

        public JobApplicationsController(PersonnelDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        [ProducesResponseType<List<JobApplicationDto>>(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<JobApplicationDto>>> Get(CancellationToken cancellationToken)
        {
            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var applications = await context.JobApplications
                .AsNoTracking()
                .Where(application => application.UserId == user.Id)
                .OrderBy(application => application.Status == "Applied" ? 0
                    : application.Status == "Interview" ? 1
                    : application.Status == "Offer" ? 2
                    : application.Status == "Rejected" ? 3
                    : 4)
                .ThenByDescending(application => application.DateApplied)
                .ThenBy(application => application.CompanyName)
                .ToListAsync(cancellationToken);

            return Ok(applications.Select(ToDto).ToList());
        }

        [HttpPost]
        [ProducesResponseType<JobApplicationDto>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<JobApplicationDto>> Create(
            JobApplicationDto request,
            CancellationToken cancellationToken)
        {
            request.CompanyName = request.CompanyName.Trim();
            request.JobTitle = request.JobTitle.Trim();
            request.Location = request.Location?.Trim() ?? string.Empty;

            if (request.DateApplied == DateOnly.MinValue)
            {
                ModelState.AddModelError(nameof(request.DateApplied), "Application date is required.");
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

            var application = new JobApplication
            {
                UserId = user.Id,
                CompanyName = request.CompanyName,
                JobTitle = request.JobTitle,
                Location = request.Location,
                DateApplied = request.DateApplied,
                Status = request.Status
            };

            context.JobApplications.Add(application);
            await context.SaveChangesAsync(cancellationToken);

            return Created("/api/JobApplications", ToDto(application));
        }

        [HttpPut("{id:int}/status")]
        [ProducesResponseType<JobApplicationDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<JobApplicationDto>> UpdateStatus(
            int id,
            UpdateJobApplicationStatusDto request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var application = await context.JobApplications
                .SingleOrDefaultAsync(
                    item => item.Id == id && item.UserId == user.Id,
                    cancellationToken);

            if (application is null)
            {
                return NotFound();
            }

            application.Status = request.Status;
            await context.SaveChangesAsync(cancellationToken);

            return Ok(ToDto(application));
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

            var application = await context.JobApplications
                .SingleOrDefaultAsync(
                    item => item.Id == id && item.UserId == user.Id,
                    cancellationToken);

            if (application is null)
            {
                return NotFound();
            }

            context.JobApplications.Remove(application);
            await context.SaveChangesAsync(cancellationToken);

            return NoContent();
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

        private static JobApplicationDto ToDto(JobApplication application)
        {
            return new JobApplicationDto
            {
                Id = application.Id,
                CompanyName = application.CompanyName,
                JobTitle = application.JobTitle,
                Location = application.Location,
                DateApplied = application.DateApplied,
                Status = application.Status
            };
        }
    }
}
