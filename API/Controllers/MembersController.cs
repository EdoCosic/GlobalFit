using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using API.Interfaces;

namespace API.Controllers
{
    [Authorize]
    public class MembersController(IMemberRepository memberRepository) : BaseApiController
    {
        // GET /api/members?Name=edo&Email=@gmail.com&Page=1&PageSize=10
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers()
        {
            return Ok(await memberRepository.GetMembersAsync());
        }

        // GET /api/members/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Member>> GetMember(string id)
        {
            var member = await memberRepository.GetMemberByIdAsync(id);
            if (member == null) return NotFound();
            return member;
        }

        [HttpGet("{id}/photos")]
        public async Task<ActionResult<IReadOnlyList<Photo>>> GetMemberPhotos(string id)
        {
            return Ok(await memberRepository.GetPhotosForMemberAsync(id));
        }
    }
}
