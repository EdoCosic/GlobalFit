using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class TrainingReservation
{
    public int Id { get; set; }

    [Required]
    public string TrainerName { get; set; } = null!; // za sada string, poslije može TrainerId

    [Required]
    public DateOnly Date { get; set; } // samo datum

    [Required]
    public TimeOnly StartTime { get; set; } // 08:00, 09:00 ...

    [Required]
    public TimeOnly EndTime { get; set; } // Start + 60 min

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
