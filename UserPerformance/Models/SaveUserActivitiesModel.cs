using System;
using System.ComponentModel.DataAnnotations;

namespace UserPerformanceApp.Models
{
    public class SaveUserActivityModel
    {
        [Required]
        public DateTime day { get; set; }
        [Required]
        public long activityId { get; set; }
        public decimal? count { get; set; }
        public string hours { get; set; }
    }
}