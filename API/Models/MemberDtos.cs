using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class MemberCreateDto
{
    [Required, MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    [Required, MaxLength(200), EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class MemberUpdateDto
{
    [Required, MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    [Required, MaxLength(200), EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class MemberQuery
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    private const int MaxPageSize = 50;
    private int _pageSize = 10;
    public int Page { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : (value < 0 ? 10 : value);
    }

    public string? SortBy { get; set; } = "DisplayName";

    public string? SortDir { get; set; } = "asc";
}
