using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers
{
    public class TrainingReservationsController(AppDbContext context) : BaseApiController
    {
        
        [HttpGet("reserved")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetReservedSlots([FromQuery] string trainerName, [FromQuery] string date)
        {
            if (string.IsNullOrWhiteSpace(trainerName) || string.IsNullOrWhiteSpace(date))
                return BadRequest("trainerName and date are required.");

            if (!DateOnly.TryParse(date, out var d))
                return BadRequest("Invalid date format. Use yyyy-MM-dd.");

            var reserved = await context.TrainingReservations
                .Where(x => x.TrainerName == trainerName && x.Date == d)
                .Select(x => x.StartTime.ToString("HH:mm"))
                .ToListAsync();

            return Ok(reserved);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<ActionResult<IReadOnlyList<object>>> GetMyReservations()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var items = await context.TrainingReservations
                .Where(x => x.AppUserId == userId)
                .OrderBy(x => x.Date)
                .ThenBy(x => x.StartTime)
                .Select(x => new
                {
                    x.Id,
                    x.TrainerName,
                    Date = x.Date.ToString("yyyy-MM-dd"),
                    StartTime = x.StartTime.ToString("HH:mm"),
                    EndTime = x.EndTime.ToString("HH:mm"),
                    x.CreatedAtUtc
                })
                .ToListAsync();

            return Ok(items);
        }

        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Cancel(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var reservation = await context.TrainingReservations
                .FirstOrDefaultAsync(x => x.Id == id && x.AppUserId == userId);

            if (reservation == null)
                return NotFound("Reservation not found.");

            context.TrainingReservations.Remove(reservation);
            await context.SaveChangesAsync();

            return Ok();
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] TrainingReservationCreateDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            if (!DateOnly.TryParse(dto.Date, out var d))
                return BadRequest("Invalid date format. Use yyyy-MM-dd.");

            if (!TimeOnly.TryParse(dto.StartTime, out var start))
                return BadRequest("Invalid time format. Use HH:mm.");

            var tomorrow = DateOnly.FromDateTime(DateTime.Now.Date.AddDays(1));
            if (d < tomorrow) return BadRequest("Date must be from tomorrow onwards.");

            var dayOfWeek = d.ToDateTime(TimeOnly.MinValue).DayOfWeek;
            if (dayOfWeek == DayOfWeek.Sunday) return BadRequest("Sundays are not available.");

            var allowed = new HashSet<string>(
                Enumerable.Range(8, 11).Select(h => new TimeOnly(h, 0).ToString("HH:mm"))
            );

            if (!allowed.Contains(start.ToString("HH:mm")))
                return BadRequest("Invalid slot. Allowed 08:00–18:00.");

            var exists = await context.TrainingReservations.AnyAsync(x =>
                x.TrainerName == dto.TrainerName &&
                x.Date == d &&
                x.StartTime == start
            );

            if (exists) return Conflict("This time slot is already reserved.");

            var reservation = new TrainingReservation
            {
                TrainerName = dto.TrainerName,
                Date = d,
                StartTime = start,
                EndTime = start.AddMinutes(60),
                AppUserId = userId
            };

            context.TrainingReservations.Add(reservation);
            await context.SaveChangesAsync();

            return Ok(new { reservation.Id });
        }
    }
}
