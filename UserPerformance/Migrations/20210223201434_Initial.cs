using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace UserPerformance.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Activities",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WorkCost = table.Column<decimal>(type: "decimal(9,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Activities_Activities_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CalendarDays",
                columns: table => new
                {
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalendarDays", x => x.Date);
                });

            migrationBuilder.CreateTable(
                name: "UserDateWorkHours",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    WorkHours = table.Column<string>(type: "nvarchar(8)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDateWorkHours", x => new { x.UserId, x.Date });
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Login = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserActivities",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActivityId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserActivities", x => new { x.UserId, x.ActivityId });
                    table.ForeignKey(
                        name: "FK_UserActivities_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserActivityDates",
                columns: table => new
                {
                    ActivityId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    Count = table.Column<decimal>(type: "decimal(9,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserActivityDates", x => new { x.UserId, x.ActivityId, x.Date });
                    table.ForeignKey(
                        name: "FK_UserActivityDates_UserActivities_UserId_ActivityId",
                        columns: x => new { x.UserId, x.ActivityId },
                        principalTable: "UserActivities",
                        principalColumns: new[] { "UserId", "ActivityId" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Activities",
                columns: new[] { "Id", "Description", "Name", "ParentId", "WorkCost" },
                values: new object[] { 1L, "Root activity for all user activities", "User activities", null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_ParentId",
                table: "Activities",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_UserActivities_ActivityId",
                table: "UserActivities",
                column: "ActivityId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CalendarDays");

            migrationBuilder.DropTable(
                name: "UserActivityDates");

            migrationBuilder.DropTable(
                name: "UserDateWorkHours");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "UserActivities");

            migrationBuilder.DropTable(
                name: "Activities");
        }
    }
}
