using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace UserPerformanceApp.Models
{
    public class UserActivitiesModel
    {
        [Required]
        public ActivityDayModel[] days { get; set; }

        [Required]
        public int currentDay { get; set; }

        [Required]
        public decimal monthWorkDays { get; set; }

        [Required]
        public decimal monthPerformance { get; set; }

        public List<EmployeeActivityModel> userActivities { get; set; }

        public string userName { get; set; }

        public int editedDays { get; set; }

        public int minYear { get; set; }

        public int maxYear { get; set; }
    }
}