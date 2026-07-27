using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GinosGelato.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Flavors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Flavors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConfirmationNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FulfillmentType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ZipCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SpecialInstructions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Subtotal = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Tax = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    DeliveryFee = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    ShippingFee = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Toppings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Toppings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    Container = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Flavors = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Toppings = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LinePrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Flavors",
                columns: new[] { "Id", "Color", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "#F3E5AB", "Classic vanilla with Madagascar beans", "Vanilla Dream" },
                    { 2, "#5C4033", "Rich dark chocolate delight", "Chocolate Fudge" },
                    { 3, "#FC5A8D", "Fresh strawberries and cream", "Strawberry Bliss" },
                    { 4, "#98FF98", "Cool mint with chocolate chips", "Mint Chocolate Chip" },
                    { 5, "#D9D9D9", "Crushed Oreo cookies in vanilla", "Cookies & Cream" },
                    { 6, "#8B5A2B", "Chocolate with marshmallows & nuts", "Rocky Road" },
                    { 7, "#7B68EE", "Mixed berry explosion", "Berry Burst" },
                    { 8, "#93C572", "Authentic Italian pistachio", "Pistachio" },
                    { 9, "#FFF44F", "Refreshing lemon zest", "Lemon Sorbet" },
                    { 10, "#C68E17", "Sweet caramel with sea salt", "Salted Caramel" },
                    { 11, "#6F4E37", "Espresso with coffee bean crunch", "Coffee Crunch" },
                    { 12, "#FF9AA2", "Colorful fruit sherbet mix", "Rainbow Sherbet" }
                });

            migrationBuilder.InsertData(
                table: "Toppings",
                columns: new[] { "Id", "Name", "Price" },
                values: new object[,]
                {
                    { 1, "Rainbow Sprinkles", 0.50m },
                    { 2, "Chocolate Chips", 0.75m },
                    { 3, "Crushed Oreos", 1.00m },
                    { 4, "Caramel Sauce", 0.75m },
                    { 5, "Hot Fudge", 0.75m },
                    { 6, "Whipped Cream", 0.50m },
                    { 7, "Cherry", 0.25m },
                    { 8, "Crushed Nuts", 1.00m },
                    { 9, "Fresh Strawberries", 1.25m },
                    { 10, "Gummy Bears", 0.75m },
                    { 11, "Coconut Flakes", 0.50m },
                    { 12, "Graham Cracker", 0.75m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Flavors");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "Toppings");

            migrationBuilder.DropTable(
                name: "Orders");
        }
    }
}
