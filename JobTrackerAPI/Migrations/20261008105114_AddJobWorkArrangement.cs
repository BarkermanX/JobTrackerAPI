using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddJobWorkArrangement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WorkArrangement",
                table: "JobExpectations",
                type: "nvarchar(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "All");

            migrationBuilder.Sql(
                """
                UPDATE [JobExpectations]
                SET [WorkArrangement] = CASE WHEN [Remote] = 1 THEN N'All' ELSE N'On-site' END
                """);

            migrationBuilder.DropColumn(
                name: "Remote",
                table: "JobExpectations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Remote",
                table: "JobExpectations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                """
                UPDATE [JobExpectations]
                SET [Remote] = CASE WHEN [WorkArrangement] IN (N'Remote', N'Hybrid', N'All') THEN 1 ELSE 0 END
                """);

            migrationBuilder.DropColumn(
                name: "WorkArrangement",
                table: "JobExpectations");
        }
    }
}
