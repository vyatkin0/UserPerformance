using UserPerformanceApp.Infrastructure;
using UserPerformanceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace UserPerformanceApp.Controllers
{
    [ApiController]
    [Route("/api")]
    //[Authorize]
    public class PerformanceController : ControllerBase
    {
        private readonly AppDbContext _ctx;

        public PerformanceController(AppDbContext ctx)
        {
            _ctx = ctx;
        }

        [HttpPost("[action]")]
        public IActionResult SaveActivities(ActivitiesModel model)
        {
            Guid? userId = HttpContext.User.Identity.Name == null ? null : _ctx.Users.Where(u => u.Login == HttpContext.User.Identity.Name.ToUpper()).SingleOrDefault()?.Id;

            if (null == userId || !userId.HasValue)
            {
                userId = Guid.Empty;
                //return BadRequest("User is not authorized");
            }

            IEnumerable<UserActivity> userActivities = _ctx.UserActivities
                .Where(a => a.UserId == userId);

            if (model.selected?.Length > 0)
            {
                _ctx.UserActivities
                    .RemoveRange(userActivities.Where(a => !model.selected.Contains(a.ActivityId)
                                                                && !_ctx.UserActivityDates.Any(ad =>
                                                                    ad.UserActivity == a)));

                foreach (var id in model.selected.Except(userActivities.Select(a => a.ActivityId)))
                {
                    _ctx.UserActivities.Add(new UserActivity
                    {
                        UserId = userId.Value,
                        ActivityId = id
                    });
                }
            }
            else
            {
                _ctx.UserActivities.RemoveRange(userActivities.Where(a =>
                    !_ctx.UserActivityDates.Any(ad => ad.UserActivity == a)));
            }

            _ctx.SaveChanges();

            return Ok("Success");
        }

        [HttpGet("[action]")]
        public IActionResult Activities()
        {
            Guid? userId = HttpContext.User.Identity.Name == null ? null : _ctx.Users.Where(u => u.Login == HttpContext.User.Identity.Name.ToUpper()).SingleOrDefault()?.Id;

            if (null == userId || !userId.HasValue)
            {
                userId = Guid.Empty;
                //return BadRequest("User is not authorized");
            }

            var selected = _ctx.UserActivities
                .Where(a => a.UserId == userId)
                .Select(a => a.Activity.Id)
                .ToArray();

            return Ok(new ActivitiesModel
            {
                activities = _ctx.Activities.ToArray(),
                selected = selected
            });
        }

        [HttpPost("[action]")]
        public IActionResult AddActivity(ActivityModel model)
        {
            if (model.workCost.GetValueOrDefault() <= 0)
            {
                ModelState.AddModelError("error", "Workcost is not valid");
            }

            if (!ModelState.IsValid)
            {
                var messages = string.Join("; ", ModelState.Values
                    .SelectMany(x => x.Errors)
                    .Select(x => x.ErrorMessage));

                return BadRequest(messages);
            }

            try
            {
                Guid? userId = HttpContext.User.Identity.Name == null ? null : _ctx.Users.Where(u => u.Login == HttpContext.User.Identity.Name.ToUpper()).SingleOrDefault()?.Id;

                if (null == userId || !userId.HasValue)
                {
                    userId = Guid.Empty;
                    //return BadRequest("User is not authorized");
                }

                Activity activity = null;
                if (model.id.HasValue)
                {
                    activity = _ctx.Activities.Where(a => a.Id == model.id).SingleOrDefault();
                }

                bool added = null == activity;

                if (added)
                {
                    activity = new Activity
                    {
                        ParentId = 1 // Активности пользователя
                    };
                }

                activity.Name = model.name;
                activity.Description = model.description;

                if (!added && activity.WorkCost.Value != model.workCost.Value)
                {
                    switch (model.options)
                    {
                        case 1:
                            return BadRequest("По указанному виду деятельности имеются затраты. Время не может быть измененено");

                        case 2:
                            {
                                decimal k = activity.WorkCost.Value / model.workCost.Value;

                                var activities = _ctx.UserActivityDates.Where(ead => ead.UserActivity.UserId == userId
                                    && ead.ActivityId == model.id.Value);

                                foreach (var ead in activities)
                                {
                                    ead.Count = Math.Round(ead.Count * k, 1);
                                }
                            }
                            break;
                    }
                }

                activity.WorkCost = model.workCost;

                if (added)
                {
                    _ctx.UserActivities.Add(new UserActivity
                    {
                        Activity = activity,
                        UserId = userId.Value
                    });
                }

                _ctx.SaveChanges();

                return Ok(activity);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost("[action]")]
        public IActionResult DeleteActivity(DeleteActivityModel model)
        {
            if (!ModelState.IsValid)
            {
                var messages = string.Join("; ", ModelState.Values
                    .SelectMany(x => x.Errors)
                    .Select(x => x.ErrorMessage));

                return BadRequest(messages);
            }

            try
            {
                Guid? userId = HttpContext.User.Identity.Name == null ? null : _ctx.Users.Where(u => u.Login == HttpContext.User.Identity.Name.ToUpper()).SingleOrDefault()?.Id;

                if (null == userId || !userId.HasValue)
                {
                    userId = Guid.Empty;
                    //return BadRequest("User is not authorized");
                }

                _ctx.Database.BeginTransaction();

                if (_ctx.UserActivityDates.Any(ead => ead.UserActivity.UserId == userId && ead.ActivityId == model.id))
                {
                    DateTime today = DateTime.Now.Date;

                    var todayActivities = _ctx.UserActivityDates.Where(ead => ead.UserActivity.UserId == userId
                        && ead.ActivityId == model.id
                        && ead.Date >= today);

                    _ctx.UserActivityDates.RemoveRange(todayActivities);
                }

                _ctx.SaveChanges();

                if (!_ctx.UserActivityDates.Any(ead => ead.UserActivity.UserId == userId && ead.ActivityId == model.id))
                {
                    _ctx.UserActivities.RemoveRange(_ctx.UserActivities.Where(ea => ea.UserId == userId && ea.ActivityId == model.id));
                    _ctx.Activities.RemoveRange(_ctx.Activities.Where(a => a.Id == model.id));
                }

                _ctx.SaveChanges();

                _ctx.Database.CommitTransaction();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            return Ok("Success");
        }

        [HttpGet("[action]")]
        public IActionResult UserActivities(DateTime from, DateTime to, int offset, int count)
        {
            if (to < from) ModelState.AddModelError("", "Date to must be greater or equals than date from");
            if (!ModelState.IsValid) return BadRequest();

            AppUser user = HttpContext.User.Identity.Name==null ? null : _ctx.Users.Where(u => u.Login == HttpContext.User.Identity.Name.ToUpper()).SingleOrDefault();

            if (null == user)
            {
                string userName = HttpContext.User.Identity.Name == null ? "Not authorized application user" : $"Not authorized application user({ HttpContext.User.Identity.Name})";
                user = new AppUser { Id = Guid.Empty, Name = userName, Login = HttpContext.User.Identity.Name };
                //return BadRequest("User is not authorized");
            }

            Guid userId = user.Id;

            DateTime now = DateTime.Now.Date;

            if (from == default)
            {
                from = new DateTime(now.Year, now.Month, 1);
            }
            else
            {
                from = from.Date;
            }

            if (to == default) to = now;
            else to = to.Date;

            if (from.AddDays(offset) <= to) from = from.AddDays(offset);
            if (count != 0 && from.AddDays(count - 1) <= to) to = from.AddDays(count - 1);

            var displayDays = (to - from).Days;

            int currentDay = (now - from).Days; //-1; // (int)(now.DayOfWeek) - 1;

            DateTime startDate = from;  // now.AddDays(-currentDay); // now.AddDays(-6);
            DateTime endDate = to;      // startDate.AddDays(_displayDays);

            DateTime firstDay = new DateTime(now.Year, now.Month, 1);

            var userMonthHours = _ctx.UserDateWorkHours
                .Where(wh => wh.UserId == userId && wh.Date >= firstDay && wh.Date < now)
                .Select(wh => new { wh.Date, wh.WorkHours })
                .ToDictionary(wh => wh.Date);
            //.Sum(wh => wh.WorkHours);

            decimal monthHours = 0;
            int monthDays = 0;

            DateTime day = firstDay;

            while (day < now)
            {
                if (userMonthHours.ContainsKey(day))
                {
                    decimal.TryParse(userMonthHours[day].WorkHours.Replace('.', ','), out var workHours);
                    monthHours += workHours;

                    if (workHours > 0)
                    {
                        ++monthDays;
                    }
                }

                day = day.AddDays(1);
            }

            decimal monthActivityMins = Convert.ToDecimal(_ctx.UserActivityDates
                .Where(ead => ead.UserActivity.UserId == userId && ead.Date >= firstDay && ead.Date < now)
                .Sum(ead => (double)(ead.Count * ead.UserActivity.Activity.WorkCost.GetValueOrDefault())));

            List<UserActivityDate> userActivityDates = _ctx.UserActivityDates
                .Where(ead => ead.UserActivity.UserId == userId && ead.Date >= startDate && ead.Date <= endDate)
                .Include(ead => ead.UserActivity.Activity)
                .OrderBy(a => a.Date)
                .ToList();

            DateTime lastDay = firstDay.AddMonths(1);
            Dictionary<long, decimal> userActivitiesMonth = _ctx.UserActivityDates
                .Where(ead => ead.UserActivity.UserId == userId && ead.Date >= firstDay && ead.Date < lastDay)
                .GroupBy(ead => new { ead.UserActivity.UserId, ead.UserActivity.ActivityId }, (e, eads) => new { e.ActivityId, sum = eads.Sum(a => (double)a.Count) })
                .ToDictionary(ea => ea.ActivityId, ea => Math.Round((decimal)ea.sum, 1));

            Dictionary<DateTime, UserDateWorkHours> employeeWorkHours = _ctx.UserDateWorkHours
                .Where(wh => wh.UserId == userId && wh.Date >= startDate && wh.Date <= endDate)
                .ToDictionary(a => a.Date);

            UserActivitiesModel model = new UserActivitiesModel
            {
                currentDay = currentDay,
                monthWorkDays = monthDays,
                days = new ActivityDayModel[displayDays]
            };

            if (monthHours > 0)
            {
                model.monthPerformance = Math.Round(monthActivityMins * 100 / Convert.ToDecimal(monthHours) / 60, 2);
            }

            model.maxYear = now.Year + 1;

            DateTime? minDate = _ctx.UserActivityDates.Where(ead => ead.UserId == userId).Min(ead => (DateTime?)ead.Date);

            model.minYear = minDate.HasValue ? minDate.Value.Year : default;

            if (model.minYear < model.maxYear - 3)
            {
                model.minYear = model.maxYear - 3;
            }

            Dictionary<DateTime, int> dayTypes = _ctx.CalendarDays
                .Where(cd => cd.Date >= startDate && cd.Date <= endDate)
                .ToDictionary(cd => cd.Date, cd => cd.Type);

            Dictionary<long, decimal[]> dea = new Dictionary<long, decimal[]>();

            using List<UserActivityDate>.Enumerator en = userActivityDates.GetEnumerator();
            en.MoveNext();

            for (int i = 0; i < displayDays; ++i)
            {
                DateTime activityDay = startDate.AddDays(i);

                int dayType = dayTypes.ContainsKey(activityDay) ? dayTypes[activityDay] : 0; // 0-Working day, 1- Holiday

                string workHours = "0";
                if (employeeWorkHours.ContainsKey(activityDay))
                {
                    workHours = employeeWorkHours[activityDay].WorkHours;
                }
                else
                {
                    if (dayType == 1)
                    {
                        workHours = "H";
                    }
                    else
                    {
                        workHours = "8.0";
                    }
                }

                model.days[i] = new ActivityDayModel
                {
                    day = activityDay,
                    dayType = dayType,
                    hours = workHours
                };

                while (null != en.Current && en.Current.Date.Date == activityDay)
                {
                    if (!dea.ContainsKey(en.Current.UserActivity.Activity.Id))
                    {
                        dea[en.Current.UserActivity.Activity.Id] = new decimal[displayDays];
                    }

                    dea[en.Current.UserActivity.Activity.Id][i] += Math.Round(en.Current.Count, 1);

                    en.MoveNext();
                }
            }

            long[] activityIds = userActivityDates
                .Select(ea => ea.UserActivity.Activity.ParentId ?? ea.ActivityId)
                .ToArray();

            List<UserActivity> userActivities = _ctx.UserActivities
                .Where(ea => ea.UserId == userId)
                .Include(ea => ea.Activity)
                .OrderBy(ea => ea.Activity.Id)
                .ToList();

            long[] userActivityIds = userActivities
                .Select(ea => ea.Activity.ParentId ?? ea.ActivityId)
                .ToArray();

            // Children contains only Tracked activities
            IEnumerable<Activity> userParentActivities;

            if (activityIds.Length > 0)
            {
                // Children contains only Tracked activities
                userParentActivities = _ctx.Activities
                    .Where(a => !a.ParentId.HasValue && (activityIds.Contains(a.Id) || userActivityIds.Contains(a.Id)))
                    .OrderByDescending(a => activityIds.Contains(a.Id))
                    .ThenBy(a => a.Id)
                    .AsEnumerable();
            }
            else
            {
                userParentActivities = _ctx.Activities
                    .Where(a => !a.ParentId.HasValue && userActivityIds.Contains(a.Id))
                    .AsEnumerable();
            }

            model.userActivities = new List<EmployeeActivityModel>();
            foreach (Activity a in userParentActivities)
            {
                model.userActivities.Add(new EmployeeActivityModel
                {
                    activity = a,
                    counts = dea.ContainsKey(a.Id) ? dea[a.Id] : new decimal[displayDays],
                    countPerMonth = userActivitiesMonth.ContainsKey(a.Id) ? userActivitiesMonth[a.Id] : 0
                });

                if (a.Children?.Count > 0)
                {
                    foreach (Activity ca in a.Children.OrderBy(x => x.Id))
                    {
                        ca.WorkCost = Math.Round(ca.WorkCost.GetValueOrDefault(), 1);
                        model.userActivities.Add(new EmployeeActivityModel
                        {
                            activity = ca,
                            counts = dea.ContainsKey(ca.Id) ? dea[ca.Id] : new decimal[displayDays],
                            countPerMonth = userActivitiesMonth.ContainsKey(ca.Id) ? userActivitiesMonth[ca.Id] : 0
                        });
                    }
                }
            }

            model.editedDays = GetEditedDays(model.currentDay, startDate);

            model.userName = user.Name;

            return Ok(model);
        }

        // Returns number of past days when counts and hours can be changed by user (5 working days)
        private int GetEditedDays(int currentDayIndex, DateTime startDate)
        {
            if (currentDayIndex < 1) return 1;

            const int maxWorkDays = 5;

            DateTime activityDay = startDate.AddDays(currentDayIndex);

            DateTime[] workDays = _ctx.CalendarDays
                .Where(cd => cd.Date <= activityDay
                                   && cd.Type != 1)// 1- Holiday
                .Select(t => t.Date)
                .OrderByDescending(t => t.Date)
                .Take(maxWorkDays).ToArray();

            if (workDays.Length < 1)
            {
                return currentDayIndex + 1;
            }

            return (activityDay - workDays[workDays.Length - 1].Date).Days + 1;
        }

        [HttpPost("[action]")]
        public IActionResult SaveUserActivities([FromBody] SaveUserActivityModel[] models)
        {
            if (!ModelState.IsValid)
            {
                string messages = string.Join("; ", ModelState.Values
                    .SelectMany(x => x.Errors)
                    .Select(x => x.ErrorMessage));

                return BadRequest(messages);
            }

            try
            {
                Guid? userId = HttpContext.User.Identity.Name == null ? null : _ctx.Users.Where(u => u.Login == HttpContext.User.Identity.Name.ToUpper()).SingleOrDefault()?.Id;

                if (null == userId || !userId.HasValue)
                {
                    userId = Guid.Empty;
                    //return BadRequest("User is not authorized");
                }

                List<UserActivityDate> userActivities = null;

                foreach (SaveUserActivityModel model in models)
                {
                    DateTime date = model.day.Date;

                    if (0 == model.activityId)
                    {
                        char[] allowed = new char[] { ',', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'H', 'V' };
                        string hours = model.hours.Trim().Replace(',', '.').ToUpper();

                        if (!hours.All(c => allowed.Contains(c)))
                        {
                            model.hours = "0";
                        }

                        UserDateWorkHours wh = _ctx.UserDateWorkHours.SingleOrDefault(h =>
                            h.UserId == userId && h.Date == date);
                        if (null == wh)
                        {
                            _ctx.UserDateWorkHours.Add(new UserDateWorkHours
                            {
                                UserId = userId.Value,
                                Date = date,
                                WorkHours = hours
                            });
                        }
                        else
                        {
                            if (wh.WorkHours != hours)
                            {
                                wh.WorkHours = hours;
                            }
                        }

                        continue;
                    }

                    if (null == userActivities)
                    {
                        userActivities = _ctx.UserActivityDates
                            .Where(ead => ead.UserActivity.UserId == userId)
                            .Include(ead => ead.UserActivity)
                            .ToList();
                    }

                    UserActivityDate ead = userActivities
                        .SingleOrDefault(ea =>
                            ea.UserActivity.ActivityId == model.activityId && ea.Date == date);

                    if (model.count > 0)
                    {
                        if (null == ead)
                        {
                            UserActivity ea = _ctx.UserActivities
                                .SingleOrDefault(x => x.UserId == userId && x.ActivityId == model.activityId);

                            if (null == ea)
                            {
                                ea = new UserActivity
                                {
                                    UserId = userId.Value,
                                    ActivityId = model.activityId
                                };

                                _ctx.UserActivities.Add(ea);
                            }

                            ead = new UserActivityDate
                            { UserActivity = ea, Date = date };
                            _ctx.UserActivityDates.Add(ead);
                        }

                        ead.Count = model.count.Value;
                    }
                    else
                    {
                        if (null != ead)
                        {
                            _ctx.UserActivityDates.Remove(ead);
                        }
                    }
                }

                _ctx.SaveChanges();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            return Ok("Success");
        }
    }
}