using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace UserPerformanceApp.Models
{
    public class UserActivitiesModel
    {
        [Required]
        public ActivityDayModel[] Days { get; set; }

        [Required]
        public int CurrentDay { get; set; }

        [Required]
        public decimal MonthWorkDays { get; set; }

        [Required]
        public decimal MonthPerformance { get; set; }

        public List<EmployeeActivityModel> UserActivities { get; set; }

        public string UserName { get; set; }

        public int EditedDays { get; set; }

        public int MinYear { get; set; }

        public int MaxYear { get; set; }
    }
}