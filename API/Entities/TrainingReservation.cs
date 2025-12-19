using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class TrainingReservation
{
    public int Id { get; set; }

    public string AppUserId { get; set; } = null!; //ovo je za rezervaciju da se zna koji user je napravio rezervaciju

    [Required]
    public string TrainerName { get; set; } = null!;

    [Required]
    public DateOnly Date { get; set; }

    [Required]
    public TimeOnly StartTime { get; set; }

    [Required]
    public TimeOnly EndTime { get; set; } 

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
