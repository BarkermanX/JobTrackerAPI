namespace JobTrackerAPI.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;
    using JobTrackerAPI.Data;
    using JobTrackerAPI.Models;
    using JobTrackerAPI.Services;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Security.Cryptography;
    using System.Text;

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IAuthService authService;
        private readonly PersonnelDbContext context;

        public AuthController(IConfiguration configuration, IAuthService authService, PersonnelDbContext context)
        {

            _configuration = configuration;
            this.authService = authService;
            this.context = context;

        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequest objRequest)
        {
            var objUser = authService.ValidateUser(objRequest.Username, objRequest.Password);

            if (objUser == null)
            {
                return Unauthorized();
            }

            string strAccessToken = GenerateAccessToken(objUser);
            var strRefreshToken = GenerateRefreshToken(objUser, Guid.NewGuid());

            Response.Cookies.Append(
                "accessToken",
                strAccessToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(30)
                });

            Response.Cookies.Append(
                "refreshToken",
                strRefreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

            return Ok();
        }

        [HttpPost("refresh")]
        public ActionResult Refresh()
        {
            if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            {
                return Unauthorized();
            }
            var hashedRefreshToken = HashRefreshToken(refreshToken);

            var storedToken = context.RefreshTokens
                .FirstOrDefault(rt => rt.Token == hashedRefreshToken);

            if (storedToken == null)
            {
                return Unauthorized("Invalid refresh token.");
            }

            if (storedToken.Revoked)
            {
                var familyTokens = context.RefreshTokens
                .Where(rt => rt.TokenFamilyId == storedToken.TokenFamilyId)
                .ToList();

                foreach (var token in familyTokens)
                {
                    token.Revoked = true;
                }

                context.SaveChanges();

                return Unauthorized("Refresh token reuse detected.");
            }

            if (storedToken.ExpiresAt <= DateTime.UtcNow)
            {
                return Unauthorized("Refresh token has expired.");
            }

            var user = context.Users
                .FirstOrDefault(u => u.Id == storedToken.UserId);

            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            // Revoke the old refresh token
            storedToken.Revoked = true;

            var strNewAccessToken = GenerateAccessToken(user);
            var strRefreshToken = GenerateRefreshToken(user, storedToken.TokenFamilyId);

            Response.Cookies.Append(
                "accessToken",
                strNewAccessToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(30)
                });

            Response.Cookies.Append(
                "refreshToken",
                strRefreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

            return Ok();
        }

        private string GenerateAccessToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("permission", "personnel.manage")
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                //expires: DateTime.UtcNow.AddMinutes(30),
                expires: DateTime.UtcNow.AddMinutes(1),
                signingCredentials: credentials
            );

           return  new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken(User user, Guid strTokenFamilyId)
        {
            var rawRefreshToken = Convert.ToBase64String(
                RandomNumberGenerator.GetBytes(64));

            var refreshToken = new RefreshToken
            {
                Token = HashRefreshToken(rawRefreshToken),
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                TokenFamilyId = strTokenFamilyId,
                Revoked = false
            };

            context.RefreshTokens.Add(refreshToken);
            context.SaveChanges();

            return rawRefreshToken;
        }

        [HttpPost("logout")]
        public ActionResult Logout()
        {
            if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            {
                return Ok();
            }

            var hashedRefreshToken = HashRefreshToken(refreshToken);
            var storedToken = context.RefreshTokens
                .FirstOrDefault(rt => rt.Token == hashedRefreshToken);

            if (storedToken == null)
            {
                return NotFound();
            }

            var familyTokens = context.RefreshTokens
             .Where(rt => rt.TokenFamilyId == storedToken.TokenFamilyId)
             .ToList();

            foreach (var token in familyTokens)
            {
                token.Revoked = true;
            }

            context.SaveChanges();

            Response.Cookies.Delete("accessToken");
            Response.Cookies.Delete("refreshToken");

            return Ok();
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized();
            }

            return Ok(new
            {
                username = User.Identity.Name,
                role = User.FindFirst(ClaimTypes.Role)?.Value
            });
        }

        private string HashRefreshToken(string token)
        {
            using var sha256 = SHA256.Create();

            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = sha256.ComputeHash(bytes);

            return Convert.ToBase64String(hash);
        }
    }
}
