using UserPerformanceApp.Infrastructure;

namespace UserPerformanceApp.Models
{
    public class EmployeeActivityModel
    {
        public Activity activity { get; set; }

        public decimal countPerMonth { get; set; }

        public decimal[] counts { get; set; }
    }
}