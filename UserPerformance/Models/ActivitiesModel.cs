using UserPerformanceApp.Infrastructure;

namespace UserPerformanceApp.Models
{
    public class ActivitiesModel
    {
        public Activity[] Activities { get; set; }

        public long[] Selected { get; set; }
    }
}