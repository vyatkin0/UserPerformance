using System.ComponentModel.DataAnnotations;

namespace UserPerformanceApp.Models
{
    public class ActivityModel
    {
        public long? id { get; set; }
        [Required]
        public string name { get; set; }
        public string description { get; set; }
        [Required]
        public decimal? workCost { get; set; }
        public int? options { get; set; }
    }

    public class DeleteActivityModel
    {
        [Required]
        public long id { get; set; }
        public int? options { get; set; }
    }
}