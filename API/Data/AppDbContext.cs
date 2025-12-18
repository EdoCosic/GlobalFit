using API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data
{
    public class AppDbContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<AppUser> Users { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<TrainingReservation> TrainingReservations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AppUser>()
                .HasIndex(u => u.Email)
                .IsUnique();

            var dateOnlyConverter = new ValueConverter<DateOnly, string>(
                v => v.ToString("yyyy-MM-dd"),
                v => DateOnly.Parse(v)
            );

            var timeOnlyConverter = new ValueConverter<TimeOnly, string>(
                v => v.ToString("HH:mm"),
                v => TimeOnly.Parse(v)
            );

            modelBuilder.Entity<TrainingReservation>(e =>
            {
                e.Property(x => x.Date).HasConversion(dateOnlyConverter);
                e.Property(x => x.StartTime).HasConversion(timeOnlyConverter);
                e.Property(x => x.EndTime).HasConversion(timeOnlyConverter);
                e.HasIndex(x => new { x.TrainerName, x.Date, x.StartTime }).IsUnique();
            });
        }
    }
}
