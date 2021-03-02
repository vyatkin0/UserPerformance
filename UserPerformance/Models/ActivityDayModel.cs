using System;
using System.ComponentModel.DataAnnotations;

namespace UserPerformanceApp.Models
{
    public class ActivityDayModel
    {
        [Required]
        public DateTime day { get; set; }

        [Required]
        public int dayType { get; set; }

        public string hours { get; set; }
    }
}