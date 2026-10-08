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
    public sealed class InterviewFollowUpsController : ControllerBase
    {
        private readonly PersonnelDbContext context;

        public InterviewFollowUpsController(PersonnelDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        [ProducesResponseType<List<InterviewFollowUpDto>>(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<InterviewFollowUpDto>>> Get(CancellationToken cancellationToken)
        {
            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var now = DateTimeOffset.UtcNow;
            var followUps = await context.InterviewFollowUps
                .AsNoTracking()
                .Where(item => item.UserId == user.Id)
                .OrderBy(item => item.ScheduledAt)
                .ToListAsync(cancellationToken);

            var orderedFollowUps = followUps
                .OrderBy(item => item.ScheduledAt < now)
                .ThenBy(item => item.ScheduledAt < now
                    ? -item.ScheduledAt.UtcTicks
                    : item.ScheduledAt.UtcTicks)
                .ThenByDescending(item => item.CreatedAtUtc);

            return Ok(orderedFollowUps.Select(ToDto).ToList());
        }

        [HttpPost]
        [ProducesResponseType<InterviewFollowUpDto>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<InterviewFollowUpDto>> Create(
            InterviewFollowUpDto request,
            CancellationToken cancellationToken)
        {
            Normalize(request);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var followUp = new InterviewFollowUp
            {
                UserId = user.Id,
                CompanyName = request.CompanyName,
                JobTitle = request.JobTitle,
                Type = request.Type,
                ScheduledAt = request.ScheduledAt,
                LocationOrLink = request.LocationOrLink,
                Notes = request.Notes,
                CreatedAtUtc = DateTime.UtcNow
            };

            context.InterviewFollowUps.Add(followUp);
            await context.SaveChangesAsync(cancellationToken);

            return Created("/api/InterviewFollowUps", ToDto(followUp));
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType<InterviewFollowUpDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InterviewFollowUpDto>> Update(
            int id,
            InterviewFollowUpDto request,
            CancellationToken cancellationToken)
        {
            Normalize(request);
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var followUp = await context.InterviewFollowUps
                .SingleOrDefaultAsync(item => item.Id == id && item.UserId == user.Id, cancellationToken);
            if (followUp is null)
            {
                return NotFound();
            }

            followUp.CompanyName = request.CompanyName;
            followUp.JobTitle = request.JobTitle;
            followUp.Type = request.Type;
            followUp.ScheduledAt = request.ScheduledAt;
            followUp.LocationOrLink = request.LocationOrLink;
            followUp.Notes = request.Notes;

            await context.SaveChangesAsync(cancellationToken);
            return Ok(ToDto(followUp));
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

            var followUp = await context.InterviewFollowUps
                .SingleOrDefaultAsync(item => item.Id == id && item.UserId == user.Id, cancellationToken);
            if (followUp is null)
            {
                return NotFound();
            }

            context.InterviewFollowUps.Remove(followUp);
            await context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        private void Normalize(InterviewFollowUpDto request)
        {
            request.CompanyName = request.CompanyName?.Trim() ?? string.Empty;
            request.JobTitle = request.JobTitle?.Trim() ?? string.Empty;
            request.LocationOrLink = request.LocationOrLink?.Trim() ?? string.Empty;
            request.Notes = request.Notes?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(request.CompanyName))
            {
                ModelState.AddModelError(nameof(request.CompanyName), "Company is required.");
            }

            if (string.IsNullOrWhiteSpace(request.JobTitle))
            {
                ModelState.AddModelError(nameof(request.JobTitle), "Job title is required.");
            }

            if (request.ScheduledAt == default)
            {
                ModelState.AddModelError(nameof(request.ScheduledAt), "Date and time are required.");
            }
        }

        private Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrWhiteSpace(username))
            {
                return Task.FromResult<User?>(null);
            }

            return context.Users.SingleOrDefaultAsync(user => user.Username == username, cancellationToken);
        }

        private static InterviewFollowUpDto ToDto(InterviewFollowUp item)
        {
            return new InterviewFollowUpDto
            {
                Id = item.Id,
                CompanyName = item.CompanyName,
                JobTitle = item.JobTitle,
                Type = item.Type,
                ScheduledAt = item.ScheduledAt,
                LocationOrLink = item.LocationOrLink,
                Notes = item.Notes
            };
        }
    }
}
