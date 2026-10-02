using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class NewPewrsonnelFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PersonnelID",
                table: "Personnel",
                newName: "PersonnelId");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Personnel",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Personnel",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreferredName",
                table: "Personnel",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Pronouns",
                table: "Personnel",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Personnel",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Personnel");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Personnel");

            migrationBuilder.DropColumn(
                name: "PreferredName",
                table: "Personnel");

            migrationBuilder.DropColumn(
                name: "Pronouns",
                table: "Personnel");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Personnel");

            migrationBuilder.RenameColumn(
                name: "PersonnelId",
                table: "Personnel",
                newName: "PersonnelID");
        }
    }
}
