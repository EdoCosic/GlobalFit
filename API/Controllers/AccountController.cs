using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.Entities;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;


public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")] //api/members/registery
    [AllowAnonymous]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerdto)
    {
        var user = new AppUser
        {
            DisplayName = registerdto.DisplayName,
            Email = registerdto.Email,
            UserName = registerdto.Email,
            Member = new Member
            {
                DisplayName = registerdto.DisplayName,
                Gender = registerdto.Gender,
                City = registerdto.City,
                Country = registerdto.Country,
                DateOfBirth = registerdto.DateOfBirth
            }
        };

        var result = await userManager.CreateAsync(user, registerdto.Password);

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("identity", error.Description);
            }
            return ValidationProblem();
        }

        return user.ToDto(tokenService);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await userManager.FindByEmailAsync(loginDto.Email);

        if (user is null) return Unauthorized("Invalid email address.");

        var result = await userManager.CheckPasswordAsync(user, loginDto.Password);

        if (!result) return Unauthorized("Invalid password.");

        return user.ToDto(tokenService);
    }

    
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        return NoContent();
    }
}
