using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailReferenceUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Personnel",
                newName: "PersonnelID");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Personnel",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Reference",
                table: "Personnel",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Personnel_Email_Reference",
                table: "Personnel",
                columns: new[] { "Email", "Reference" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Personnel_Email_Reference",
                table: "Personnel");

            migrationBuilder.DropColumn(
                name: "Reference",
                table: "Personnel");

            migrationBuilder.RenameColumn(
                name: "PersonnelID",
                table: "Personnel",
                newName: "Id");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Personnel",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
