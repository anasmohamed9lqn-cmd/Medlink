using Microsoft.AspNetCore.Mvc;
using NileHealth.Api.Models;
using NileHealth.Api.Services;
using Google.Cloud.Firestore;

namespace NileHealth.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly FirebaseService _firebaseService;

        public AdminController(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        // --- Approve/Reject Doctors (No verification document file review required now) ---
        [HttpPost("doctors/{doctorId}/approve")]
        public async Task<IActionResult> ApproveDoctor(string doctorId)
        {
            try
            {
                var docRef = _firebaseService.Db.Collection("users").Document(doctorId);
                await docRef.UpdateAsync("status", "Active");

                // If a doctor request tracker exists, update it too
                var reqRef = _firebaseService.Db.Collection("doctorRequests").Document(doctorId);
                var reqSnapshot = await reqRef.GetSnapshotAsync();
                if (reqSnapshot.Exists)
                {
                    await reqRef.UpdateAsync("status", "approved");
                }

                return Ok(new { message = $"Doctor account {doctorId} activated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("doctors/{doctorId}/reject")]
        public async Task<IActionResult> RejectDoctor(string doctorId)
        {
            try
            {
                var docRef = _firebaseService.Db.Collection("users").Document(doctorId);
                await docRef.UpdateAsync("status", "Declined");

                var reqRef = _firebaseService.Db.Collection("doctorRequests").Document(doctorId);
                var reqSnapshot = await reqRef.GetSnapshotAsync();
                if (reqSnapshot.Exists)
                {
                    await reqRef.UpdateAsync("status", "rejected");
                }

                return Ok(new { message = $"Doctor account {doctorId} declined successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // --- Medical Institutions ---
        [HttpGet("institutions")]
        public async Task<IActionResult> GetInstitutions()
        {
            var collectionRef = _firebaseService.Db.Collection("institutions");
            var snapshot = await collectionRef.GetSnapshotAsync();
            var list = new List<MedicalInstitution>();
            foreach (var docSnap in snapshot.Documents)
            {
                list.Add(docSnap.ConvertTo<MedicalInstitution>());
            }
            return Ok(list);
        }

        [HttpPost("institutions")]
        public async Task<IActionResult> AddInstitution([FromBody] MedicalInstitution inst)
        {
            if (string.IsNullOrEmpty(inst.Id))
            {
                inst.Id = Guid.NewGuid().ToString();
            }
            await _firebaseService.Db.Collection("institutions").Document(inst.Id).SetAsync(inst);
            return Ok(new { message = "Institution created", inst });
        }
    }
}
