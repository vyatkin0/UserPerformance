using UserPerformanceApp.Infrastructure;

namespace UserPerformanceApp.Models
{
    public class ActivitiesModel
    {
        public Activity[] activities { get; set; }

        public long[] selected { get; set; }
    }
}