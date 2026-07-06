using Microsoft.AspNetCore.Mvc;
using NileHealth.Api.Models;
using NileHealth.Api.Services;

namespace NileHealth.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FirebaseService _firebaseService;

        public AuthController(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        // Endpoint to verify authorization token and get current profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Missing or invalid authorization token format." });
            }

            var token = authHeader.Substring("Bearer ".Length);
            var verifiedToken = await _firebaseService.VerifyTokenAsync(token);
            if (verifiedToken == null)
            {
                return Unauthorized(new { message = "Invalid Firebase credentials." });
            }

            string uid = verifiedToken.Uid;
            var userProfile = await _firebaseService.GetUserProfileAsync(uid);
            
            if (userProfile == null)
            {
                return NotFound(new { message = "Profile not registered in internal database." });
            }

            return Ok(userProfile);
        }

        // Endpoint to update or register a user's internal metadata after Firebase Signup
        [HttpPost("register-metadata")]
        public async Task<IActionResult> RegisterMetadata([FromBody] User user)
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Missing authorization token." });
            }

            var token = authHeader.Substring("Bearer ".Length);
            var verifiedToken = await _firebaseService.VerifyTokenAsync(token);
            if (verifiedToken == null || verifiedToken.Uid != user.Id)
            {
                return BadRequest(new { message = "Unauthorized: ID mismatch or expired token." });
            }

            await _firebaseService.UpsertUserProfileAsync(user);
            return Ok(new { message = "Metadata recorded successfully", user });
        }
    }
}
