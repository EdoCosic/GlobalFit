using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class AppUser
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required, MaxLength(100)]
    public required string DisplayName { get; set; }

    [Required, MaxLength(200), EmailAddress]
    public required string Email { get; set; }

    public required byte[] PasswordHash { get; set; } = Array.Empty<byte>();
    public required byte[] PasswordSalt { get; set; } = Array.Empty<byte>();
}
