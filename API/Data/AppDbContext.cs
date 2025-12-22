using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data
{
    public class AppDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
    {
        public DbSet<Member> Members { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<TrainingReservation> TrainingReservations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<IdentityRole>()
                .HasData(
                  new IdentityRole { Id = "member-id", Name = "Member", NormalizedName = "MEMBER" },
                  new IdentityRole { Id = "moderator-id", Name = "Moderator", NormalizedName = "MODERATOR" },
                  new IdentityRole { Id = "admin-id", Name = "Admin", NormalizedName = "ADMIN" }
            );

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
