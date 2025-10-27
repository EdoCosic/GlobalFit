using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class RegisterDto
{
    [Required, MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    [Required, MaxLength(200), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(50)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required, MaxLength(200), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(50)]
    public string Password { get; set; } = string.Empty;
}

public class UserDto
{
    public required string Id { get; set; } = string.Empty;
    public required string DisplayName { get; set; } = string.Empty;
    public required string Email { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public required string Token { get; set; } = string.Empty;
}
