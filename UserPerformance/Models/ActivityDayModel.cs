﻿using System;
using System.ComponentModel.DataAnnotations;

namespace UserPerformanceApp.Models
{
    public class ActivityDayModel
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int DayType { get; set; }

        public string Hours { get; set; }
    }
}