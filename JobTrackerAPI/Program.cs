using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using JobTrackerAPI.Data;
using JobTrackerAPI.Models;
using JobTrackerAPI.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Dependency Injections
builder.Services.AddScoped<IPersonnelService, PersonnelService>();
builder.Services.AddDbContext<PersonnelDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

builder.Services.AddHostedService<RefreshTokenCleanupService>();

var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Add Authentication and Authorization
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue(
                    "accessToken",
                    out var token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            }
        };
    });
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidateLifetime = true,
//            ValidateIssuerSigningKey = true,

//            ValidIssuer = builder.Configuration["Jwt:Issuer"],
//            ValidAudience = builder.Configuration["Jwt:Audience"],

//            IssuerSigningKey = new SymmetricSecurityKey(
//                Encoding.UTF8.GetBytes(
//                    builder.Configuration["Jwt:Key"]!
//                )
//            )
//        };
//    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanManagePersonnel", policy =>
    {
        policy.RequireClaim("permission", "personnel.manage");
    });
});


// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Components ??= new OpenApiComponents();

        document.Components.SecuritySchemes ??=
            new Dictionary<string, IOpenApiSecurityScheme>();

        document.Components.SecuritySchemes["Bearer"] =
            new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter your JWT token"
            };

        return Task.CompletedTask;
    });

    options.AddOperationTransformer((operation, context, cancellationToken) =>
    {
        if (context.Description.ActionDescriptor.EndpointMetadata
            .OfType<IAuthorizeData>()
            .Any())
        {
            operation.Security ??= new List<OpenApiSecurityRequirement>();

            var securityRequirement = new OpenApiSecurityRequirement();

            securityRequirement.Add(
                new OpenApiSecuritySchemeReference(
                    "Bearer",
                    context.Document),
                new List<string>()
            );

            operation.Security.Add(securityRequirement);
        }

        return Task.CompletedTask;
    });
});



var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var context = services.GetRequiredService<PersonnelDbContext>();
    var passwordHasher = services.GetRequiredService<IPasswordHasher<User>>();

    SeedData.Initialize(context, passwordHasher);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUi(options =>
    {
        options.DocumentPath = "/openapi/v1.json";
    });
}

app.UseHttpsRedirection();

app.UseCors("ReactApp");

app.UseExceptionHandler("/error");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
