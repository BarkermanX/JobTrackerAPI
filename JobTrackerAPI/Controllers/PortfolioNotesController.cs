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
    public sealed class PortfolioNotesController : ControllerBase
    {
        private readonly PersonnelDbContext context;

        public PortfolioNotesController(PersonnelDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        [ProducesResponseType<List<PortfolioNoteDto>>(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<PortfolioNoteDto>>> Get(CancellationToken cancellationToken)
        {
            var user = await GetCurrentUserAsync(cancellationToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var notes = await context.PortfolioNotes
                .AsNoTracking()
                .Where(note => note.UserId == user.Id)
                .OrderByDescending(note => note.UpdatedAtUtc)
                .ToListAsync(cancellationToken);

            return Ok(notes.Select(ToDto).ToList());
        }

        [HttpPost]
        [ProducesResponseType<PortfolioNoteDto>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PortfolioNoteDto>> Create(
            PortfolioNoteDto request,
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

            var now = DateTime.UtcNow;
            var note = new PortfolioNote
            {
                UserId = user.Id,
                Title = request.Title,
                Content = request.Content,
                Category = request.Category,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };

            context.PortfolioNotes.Add(note);
            await context.SaveChangesAsync(cancellationToken);

            return Created("/api/PortfolioNotes", ToDto(note));
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType<PortfolioNoteDto>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PortfolioNoteDto>> Update(
            int id,
            PortfolioNoteDto request,
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

            var note = await context.PortfolioNotes
                .SingleOrDefaultAsync(item => item.Id == id && item.UserId == user.Id, cancellationToken);
            if (note is null)
            {
                return NotFound();
            }

            note.Title = request.Title;
            note.Content = request.Content;
            note.Category = request.Category;
            note.UpdatedAtUtc = DateTime.UtcNow;

            await context.SaveChangesAsync(cancellationToken);
            return Ok(ToDto(note));
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

            var note = await context.PortfolioNotes
                .SingleOrDefaultAsync(item => item.Id == id && item.UserId == user.Id, cancellationToken);
            if (note is null)
            {
                return NotFound();
            }

            context.PortfolioNotes.Remove(note);
            await context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        private void Normalize(PortfolioNoteDto request)
        {
            request.Title = request.Title?.Trim() ?? string.Empty;
            request.Content = request.Content?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                ModelState.AddModelError(nameof(request.Title), "A note title is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Content))
            {
                ModelState.AddModelError(nameof(request.Content), "Note content is required.");
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

        private static PortfolioNoteDto ToDto(PortfolioNote note)
        {
            return new PortfolioNoteDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                Category = note.Category,
                UpdatedAtUtc = note.UpdatedAtUtc
            };
        }
    }
}
