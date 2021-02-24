using UserPerformanceApp.Infrastructure;

namespace UserPerformanceApp.Models
{
    public class EmployeeActivityModel
    {
        public Activity Activity { get; set; }

        public decimal CountPerMonth { get; set; }

        public decimal[] Counts { get; set; }
    }
}