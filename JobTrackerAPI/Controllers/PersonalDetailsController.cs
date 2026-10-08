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
    public sealed class PersonalDetailsController : ControllerBase
    {
        private readonly PersonnelDbContext context;

        public PersonalDetailsController(PersonnelDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        [ProducesResponseType<PersonalDetailsDto>(StatusCodes.Status200OK)]
        public async Task<ActionResult<PersonalDetailsDto>> Get(CancellationToken cancellationToken)
        {
            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var details = await context.PersonalDetails
                .AsNoTracking()
                .SingleOrDefaultAsync(item => item.UserId == user.Id, cancellationToken);

            return Ok(details is null ? new PersonalDetailsDto() : ToDto(details));
        }

        [HttpPut]
        [ProducesResponseType<PersonalDetailsDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PersonalDetailsDto>> Save(
            PersonalDetailsDto request,
            CancellationToken cancellationToken)
        {
            request.FullName = request.FullName?.Trim() ?? string.Empty;
            request.Email = request.Email?.Trim() ?? string.Empty;
            request.Phone = request.Phone?.Trim() ?? string.Empty;
            request.Location = request.Location?.Trim() ?? string.Empty;
            request.ProfessionalSummary = request.ProfessionalSummary?.Trim() ?? string.Empty;

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var details = await context.PersonalDetails
                .SingleOrDefaultAsync(item => item.UserId == user.Id, cancellationToken);

            if (details is null)
            {
                details = new PersonalDetails { UserId = user.Id };
                context.PersonalDetails.Add(details);
            }

            details.FullName = request.FullName;
            details.Email = request.Email;
            details.Phone = request.Phone;
            details.Location = request.Location;
            details.ProfessionalSummary = request.ProfessionalSummary;

            await context.SaveChangesAsync(cancellationToken);

            return Ok(ToDto(details));
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

        private static PersonalDetailsDto ToDto(PersonalDetails details)
        {
            return new PersonalDetailsDto
            {
                FullName = details.FullName,
                Email = details.Email,
                Phone = details.Phone,
                Location = details.Location,
                ProfessionalSummary = details.ProfessionalSummary
            };
        }
    }
}
