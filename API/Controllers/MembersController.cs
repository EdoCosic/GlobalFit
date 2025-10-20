using API.Data;
using API.Entities;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // /api/members
    [Authorize]
    public class MembersController(AppDbContext context) : ControllerBase
    {
        // GET /api/members?Name=edo&Email=@gmail.com&Page=1&PageSize=10
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMembers([FromQuery] MemberQuery q)
        {
            var query = context.Users.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(q.Name))
                query = query.Where(u => EF.Functions.Like(u.DisplayName, $"%{q.Name}%"));

            if (!string.IsNullOrWhiteSpace(q.Email))
                query = query.Where(u => EF.Functions.Like(u.Email, $"%{q.Email}%"));


            var sortBy = (q.SortBy ?? "displayName").ToLowerInvariant();
            var sortDir = (q.SortDir ?? "asc").ToLowerInvariant();

            query = (sortBy, sortDir) switch
             {
                ("email", "desc")       => query.OrderByDescending(u => u.Email),
                ("email", _)            => query.OrderBy(u => u.Email),
                ("displayname", "desc") => query.OrderByDescending(u => u.DisplayName),
                _                       => query.OrderBy(u => u.DisplayName)
            };
            
            var total = await query.CountAsync();

            var items = await query
                .Skip((q.Page - 1) * q.PageSize)
                .Take(q.PageSize)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)total / q.PageSize);
            Response.Headers["X-Total-Count"]  = total.ToString();
            Response.Headers["X-Page"]         = q.Page.ToString();
            Response.Headers["X-Page-Size"]    = q.PageSize.ToString();
            Response.Headers["X-Total-Pages"] = totalPages.ToString();
            
            string baseUrl = $"{Request.Scheme}://{Request.Host}{Request.Path}";
            string buildUrl(int page) =>
                QueryString.Create(new Dictionary<string, string?>
                {
                    ["Name"] = q.Name,
                    ["Email"] = q.Email,
                    ["Page"] = page.ToString(),
                    ["PageSize"] = q.PageSize.ToString(),
                    ["SortBy"] = q.SortBy,
                    ["SortDir"] = q.SortDir
                }).ToString();
             
            var links = new List<string>();
            if (q.Page > 1)             links.Add($"<{baseUrl}{buildUrl(q.Page - 1)}>; rel=\"prev\"");
            if (q.Page < totalPages)    links.Add($"<{baseUrl}{buildUrl(q.Page + 1)}>; rel=\"next\"");
            if (links.Count > 0)        Response.Headers["Link"] = string.Join(", ", links);
            
            return items;
        }
        
        // GET /api/members/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AppUser>> GetMember(string id)
        {
            var member = await context.Users.FindAsync(id);
            return member is null ? NotFound() : member;
        }

        // POST /api/members
        [HttpPost]
        public async Task<ActionResult<AppUser>> CreateMember([FromBody] MemberCreateDto dto)
        {
            // [ApiController] će vratiti 400 ako validacija pada
            var user = new AppUser { DisplayName = dto.DisplayName, Email = dto.Email };

            // (opcija) zaštita na nivou API-a za dupli email
            var emailTaken = await context.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailTaken) return Conflict("Email is already taken.");

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMember), new { id = user.Id }, user);
        }

        // PUT /api/members/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(string id, [FromBody] MemberUpdateDto dto)
        {
            var user = await context.Users.FindAsync(id);
            if (user is null) return NotFound();

            // ako mijenja email, provjeri unikatnost
            if (!string.Equals(user.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
            {
                var emailTaken = await context.Users.AnyAsync(u => u.Email == dto.Email);
                if (emailTaken) return Conflict("Email is already taken.");
            }

            user.DisplayName = dto.DisplayName;
            user.Email = dto.Email;

            await context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/members/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(string id)
        {
            var user = await context.Users.FindAsync(id);
            if (user is null) return NotFound();

            context.Users.Remove(user);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
