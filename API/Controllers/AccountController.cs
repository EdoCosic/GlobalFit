using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.Entities;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;


public class AccountController(AppDbContext context, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")] //api/members/registery
    [AllowAnonymous]
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
    {
        // unique email
        var exists = await context.Users.AnyAsync(x => x.Email == dto.Email);
        if (exists) return Conflict("Email is already taken.");

        // hash password
        using var hmac = new HMACSHA512();
        var user = new AppUser
        {
            DisplayName = dto.DisplayName,
            Email = dto.Email,
            PasswordSalt = hmac.Key,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password))
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user.ToDto(tokenService);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        var user = await context.Users.SingleOrDefaultAsync(x => x.Email == dto.Email);
        if (user is null) return Unauthorized("Invalid email address.");

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));

        if (!computed.SequenceEqual(user.PasswordHash))
            return Unauthorized("Invalid password.");

        return user.ToDto(tokenService);
    }

    
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        return NoContent();
    }
}
