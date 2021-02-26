using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using Moq;
using Microsoft.EntityFrameworkCore.Infrastructure;
using UserPerformanceApp.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using UserPerformanceApp.Controllers;
using Microsoft.AspNetCore.Http;
using UserPerformanceApp.Models;

namespace UnitTestProject
{
    public class TestDatabaseFacade : DatabaseFacade
    {
        public TestDatabaseFacade() : base(new AppDbContext()) { }
        public override void RollbackTransaction() { }
        public override IDbContextTransaction BeginTransaction()
        {
            return null;
        }
        public override void CommitTransaction() { }
    }

    [TestClass]
    public class PerformanceControllerTest
    {
        Mock<DbSet<T>> ConfigureSet<T>(IQueryable<T> data) where T : class
        {
            var mockSet = new Mock<DbSet<T>>();
            mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            return mockSet;
        }
        Mock<AppDbContext> ConfigureAppDbContext()
        {
            var mockAppDb = new Mock<AppDbContext>();

            var daysData = new List<CalendarDay>
            {
                new CalendarDay { Date=new DateTime(2020,1,1), Type = 1 },
                new CalendarDay { Date=new DateTime(2020,1,2), Type = 1 },
                new CalendarDay { Date=new DateTime(2020,1,3), Type = 1 },
                new CalendarDay { Date=new DateTime(2020,1,4), Type = 1 },
                new CalendarDay { Date=new DateTime(2020,1,5), Type = 1 },
            }.AsQueryable();

            var mockDaysSet = ConfigureSet<CalendarDay>(daysData);
            mockAppDb.SetupGet(m => m.CalendarDays).Returns(mockDaysSet.Object);

            var users = new List<AppUser>
            {
                new AppUser { Id=new Guid("00000000-0000-4000-A000-000000000001"), Name = "User1", Login = "TESTUSER1" },
                new AppUser { Id=new Guid("00000000-0000-4000-A000-000000000002"), Name = "User2", Login = "TESTUSER2" },
                new AppUser { Id=new Guid("00000000-0000-4000-A000-000000000003"), Name = "User3", Login = "TESTUSER3" },
            };

            var dataUsers = users.AsQueryable();

            var mockUsersSet = ConfigureSet<AppUser>(dataUsers);
            mockAppDb.SetupGet(m => m.Users).Returns(mockUsersSet.Object);

            var activities = new List<Activity>
            {
                new Activity { Id=1, Name = "BBB", WorkCost = 10 },
                new Activity { Id=2, Name = "ZZZ", WorkCost = 10 },
                new Activity { Id=3, Name = "AAA", WorkCost = 10 },
            };

            var data = activities.AsQueryable();

            var mockSet = ConfigureSet<Activity>(data);
            mockAppDb.SetupGet(m => m.Activities).Returns(mockSet.Object);

            Guid userId = new Guid("00000000-0000-4000-A000-000000000001");

            var employeeActivities = new List<UserActivity>
            {
                new UserActivity { UserId=userId, ActivityId =1, Activity=activities[0] },
                new UserActivity { UserId=userId, ActivityId =2, Activity=activities[1] },
                new UserActivity { UserId=userId, ActivityId =3, Activity=activities[2] },
            };

            var eaData = employeeActivities.AsQueryable();

            var mockEaSet = ConfigureSet<UserActivity>(eaData);
            mockAppDb.SetupGet(m => m.UserActivities).Returns(mockEaSet.Object);

            Guid roleId = new Guid("0C13B543-362D-4536-999A-774DFC0913FB");
            Guid scopeId1 = new Guid("00000000-0000-4000-A000-000000000001");
            Guid scopeId2 = new Guid("00000000-0000-4000-A000-000000000002");

            var eadData = new List<UserActivityDate>
            {
                new UserActivityDate { UserId=userId, Date=new DateTime(2020,1,1), ActivityId =1, UserActivity=employeeActivities[0] },
                new UserActivityDate { UserId=userId, Date=new DateTime(2020,1,2), ActivityId =2, UserActivity=employeeActivities[1] },
                new UserActivityDate { UserId=userId, Date=new DateTime(2020,1,3), ActivityId =3, UserActivity=employeeActivities[2] },
            }.AsQueryable();

            var mockEadSet = ConfigureSet<UserActivityDate>(eadData);

            mockAppDb.SetupGet(m => m.UserActivityDates).Returns(mockEadSet.Object);

            var edhData = new List<UserDateWorkHours>
            {
                new UserDateWorkHours { UserId=userId, Date=new DateTime(2020,1,1), WorkHours ="8" },
                new UserDateWorkHours { UserId=userId, Date=new DateTime(2020,1,2), WorkHours ="7" },
                new UserDateWorkHours { UserId=userId, Date=new DateTime(2020,1,3), WorkHours ="6.5" },
            }.AsQueryable();

            var mockEdhSet = ConfigureSet<UserDateWorkHours>(edhData);

            mockAppDb.SetupGet(m => m.UserDateWorkHours).Returns(mockEdhSet.Object);

            DatabaseFacade database = new TestDatabaseFacade();
            mockAppDb.SetupGet(m => m.Database).Returns(database);
            return mockAppDb;
        }

        PerformanceController ConfigureController()
        {
            var mockAppDb = ConfigureAppDbContext();

            var httpContext = new Mock<HttpContext>();

            httpContext.SetupGet(ctx => ctx.User.Identity.Name).Returns("TestUser1");

            var context = new ControllerContext();
            context.HttpContext = httpContext.Object;

            PerformanceController controller = new PerformanceController(mockAppDb.Object);
            controller.ControllerContext = context;

            return controller;
        }

        [TestMethod]
        public void TestAddActivity()
        {
            PerformanceController ñontroller = ConfigureController();

            ActivityModel m = new ActivityModel { name = "TTT", description = "description of TTT", workCost = 20 };

            IActionResult result = ñontroller.AddActivity(m);

            Assert.IsTrue(result is OkObjectResult);

            OkObjectResult okResult = result as OkObjectResult;

            Assert.IsTrue(okResult.Value is Activity);

            Activity activity = okResult.Value as Activity;

            Assert.IsTrue(activity.Id == 0 && activity.Name == "TTT" && activity.Description == m.description && activity.WorkCost == m.workCost && activity.ParentId == 1);

            m = new ActivityModel { id = 0, name = "TTT2", description = "description of TTT", workCost = 30 };

            // Modification
            result = ñontroller.AddActivity(m);

            Assert.IsTrue(result is OkObjectResult);

            okResult = result as OkObjectResult;

            Assert.IsTrue(okResult.Value is Activity);

            activity = okResult.Value as Activity;

            Assert.IsTrue(activity.Id == 0 && activity.Name == m.name && activity.Description == m.description && activity.WorkCost == m.workCost && activity.ParentId == 1);


            m = new ActivityModel { id = 1, name = "TTT2", description = "description of TTT", workCost = 20, options = 1 };

            // Modification
            result = ñontroller.AddActivity(m);

            Assert.IsTrue(result is BadRequestObjectResult);
        }


        [TestMethod]
        public void TestDeleteActivity()
        {
            PerformanceController ñontroller = ConfigureController();

            DeleteActivityModel m = new DeleteActivityModel { id = 1 };

            IActionResult result = ñontroller.DeleteActivity(m);

            Assert.IsTrue(result is OkObjectResult);

            OkObjectResult okResult = result as OkObjectResult;

            Assert.IsTrue(okResult.Value as string == "Success");

            m = new DeleteActivityModel { id = 4 };

            result = ñontroller.DeleteActivity(m);

            Assert.IsTrue(okResult.Value as string == "Success");
            //Assert.IsTrue(result is BadRequestObjectResult);
        }

        [TestMethod]
        public void TestActivities()
        {
            PerformanceController ñontroller = ConfigureController();

            IActionResult result = ñontroller.Activities();

            Assert.IsTrue(result is OkObjectResult);

            OkObjectResult okResult = result as OkObjectResult;

            Assert.IsTrue(okResult.Value is ActivitiesModel);

            ActivitiesModel activities = okResult.Value as ActivitiesModel;

            Assert.AreEqual(activities.Selected.Length, 3);
            Assert.AreEqual(activities.Selected[0], 1);
            Assert.AreEqual(activities.Selected[1], 2);
            Assert.AreEqual(activities.Selected[2], 3);
            Assert.AreEqual(activities.Activities.Length, 3);
            Assert.AreEqual(activities.Activities[0].Id, 1);
            Assert.AreEqual(activities.Activities[1].Id, 2);
            Assert.AreEqual(activities.Activities[2].Id, 3);
        }

        [TestMethod]
        public void TestUserActivities()
        {
            PerformanceController ñontroller = ConfigureController();

            DateTime startDate = new DateTime(2020, 1, 1);
            IActionResult result = ñontroller.UserActivities(startDate, new DateTime(2020, 1, 3), 0, 10);

            Assert.IsTrue(result is OkObjectResult);

            OkObjectResult okResult = result as OkObjectResult;

            Assert.IsTrue(okResult.Value is UserActivitiesModel);

            UserActivitiesModel ea = okResult.Value as UserActivitiesModel;

            int days = (int)(DateTime.Now.Date - startDate).TotalDays;

            Assert.AreEqual(ea.UserName, "User1");
            Assert.AreEqual(ea.CurrentDay, days);
            Assert.AreEqual(ea.EditedDays, days + 1);
            Assert.AreEqual(ea.Days.Length, 2);
            Assert.AreEqual(ea.Days[0].day, startDate);
            Assert.AreEqual(ea.Days[1].day, new DateTime(2020, 1, 2));
            Assert.AreEqual(ea.MaxYear, DateTime.Now.Date.Year + 1);
            Assert.AreEqual(ea.MinYear, 2020);
            Assert.AreEqual(ea.MonthPerformance, 0);
            Assert.AreEqual(ea.MonthWorkDays, 0);

            result = ñontroller.UserActivities(new DateTime(2020, 1, 3), startDate, 0, 10);
            Assert.IsInstanceOfType(result, typeof(BadRequestResult));
        }

        [TestMethod]
        public void TestSaveActivities()
        {
            PerformanceController ñontroller = ConfigureController();
            ActivitiesModel activities = new ActivitiesModel
            {
                Selected = new long[] { 1 }
            };

            IActionResult result = ñontroller.SaveActivities(activities);

            Assert.IsTrue(result is OkObjectResult);

            OkObjectResult okResult = result as OkObjectResult;

            Assert.AreEqual(okResult.Value, "Success");
        }

        [TestMethod]
        public void TestSaveUserActivities()
        {
            PerformanceController ñontroller = ConfigureController();

            SaveUserActivityModel[] userActivities = new SaveUserActivityModel[] {
                new SaveUserActivityModel{
                    day = new DateTime(2020, 1, 1),
                    hours = "V",
                    activityId = 0,
                },
                new SaveUserActivityModel{
                    day = new DateTime(2020, 1, 2),
                    count = 2.1m,
                    hours = "6",
                    activityId = 2,
                },
                new SaveUserActivityModel{
                    day = new DateTime(2020, 1, 2),
                    count = 3.0m,
                    activityId = 2,
                },
            };

            IActionResult result = ñontroller.SaveUserActivities(userActivities);

            Assert.IsTrue(result is OkObjectResult);

            OkObjectResult okResult = result as OkObjectResult;

            Assert.AreEqual(okResult.Value, "Success");
        }
    }
}
