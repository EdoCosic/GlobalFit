namespace API.DTOs;

public class TrainingReservationCreateDto
{
    public string TrainerName { get; set; } = null!;
    public string Date { get; set; } = null!;          
    public string StartTime { get; set; } = null!;     
}
