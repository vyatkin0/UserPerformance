using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Text.Json.Serialization;

namespace UserPerformanceApp.Infrastructure
{
    /// <summary>
    /// Entity framework classes for database entities
    /// </summary>
    public class AppDbContext : DbContext
    {
        //Database migrated flag
        private static bool _migrated;

        //Logging interface for databases
        private static readonly ILoggerFactory _loggerFactory = LoggerFactory.Create(builder => { builder.AddConsole(); });
        private readonly IConfiguration _configuration;

        //Users table
        public virtual DbSet<AppUser> Users { get; set; }

        //Activities table
        public virtual DbSet<Activity> Activities { get; set; }

        //Calendar days table, contains type of the day (holiday, vacation etc.) for each day
        public virtual DbSet<CalendarDay> CalendarDays { get; set; }

        //User activities table
        public virtual DbSet<UserActivity> UserActivities { get; set; }

        //User activives count on exact date
        public virtual DbSet<UserActivityDate> UserActivityDates { get; set; }

        //Hours spent by user on exact date
        public virtual DbSet<UserDateWorkHours> UserDateWorkHours { get; set; }

        // For unit test only
        public AppDbContext()
        {
        }

        public AppDbContext(IConfiguration configuration)
        {
            _configuration = configuration;

            if (!_migrated)
            {
                _migrated = true;
                Database.Migrate();
            }
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(_configuration.GetConnectionString("UserPerformance")); 
                optionsBuilder.UseLoggerFactory(_loggerFactory);
                //optionsBuilder.EnableSensitiveDataLogging(true);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //Write Fluent API configurations here
            modelBuilder.Entity<CalendarDay>().HasKey(d => d.Date);
            modelBuilder.Entity<UserActivity>().HasKey(ua => new { ua.UserId, ua.ActivityId });
            modelBuilder.Entity<UserActivityDate>().HasKey(uad=> new { uad.UserId, uad.ActivityId, uad.Date});
            modelBuilder.Entity<UserDateWorkHours>().HasKey(uad => new { uad.UserId, uad.Date });

            modelBuilder.Entity<UserActivityDate>()
                .HasOne(uad => uad.UserActivity)
                .WithMany(a => a.UserActivityDates)
                .HasForeignKey(uad => new { uad.UserId, uad.ActivityId })
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserActivity>()
                .HasOne(ua => ua.Activity)
                .WithMany(a => a.UserActivities)
                .HasForeignKey(ua => ua.ActivityId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Activity>()
                .HasOne(a => a.Parent)
                .WithMany(a => a.Children)
                .HasForeignKey(ua => ua.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Activity>()
                .HasData(new {
                    Id = 1L,
                    Name = "User activities",
                    Description = "Root activity for all user activities"
                });

            base.OnModelCreating(modelBuilder);
        }
    }

    public partial class CalendarDay
    {
        public DateTime Date { get; set; }
        public int Type { get; set; }
    }

    public class AppUser
    {
        [Key]
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string Login { get; set; }
    }

    public class Activity
    {
        [Key]
        public long Id { get; set; }

        public long? ParentId { get; set; }

        [JsonIgnore]
        public virtual Activity Parent { get; set; }

        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [Column(TypeName = "decimal(9,2)")]
        public decimal? WorkCost { get; set; }

        [JsonIgnore]
        public ICollection<UserActivity> UserActivities { get; set; } // Связанные активности пользователей

        [JsonIgnore]
        public ICollection<Activity> Children { get; set; } // Связанные активности пользователей
    }

    public class UserActivity
    {
        public Guid UserId { get; set; }

        public long ActivityId { get; set; }

        public Activity Activity { get; set; }

        public ICollection<UserActivityDate> UserActivityDates { get; set; } // Связанные активности пользователей на даты
    }

    public class UserActivityDate
    {
        public long ActivityId { get; set; }
        public Guid UserId { get; set; }
        public UserActivity UserActivity { get; set; }

        [Column(TypeName = "date")]
        public DateTime @Date { get; set; }

        [Column(TypeName = "decimal(9,2)")]
        public decimal Count { get; set; }
    }

    public class UserDateWorkHours
    {
        public Guid UserId { get; set; }
        [Column(TypeName = "date")]
        public DateTime @Date { get; set; }

        [Column(TypeName = "nvarchar(8)")]
        public string WorkHours { get; set; }
    }
}
