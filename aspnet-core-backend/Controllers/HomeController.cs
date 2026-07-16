using Microsoft.AspNetCore.Mvc;
using NileHealth.Api.Models;
using NileHealth.Api.Services;
using Google.Cloud.Firestore;

namespace NileHealth.Api.Controllers
{
    public class HomeController : Controller
    {
        private readonly FirebaseService _firebaseService;

        public HomeController(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        public async Task<IActionResult> Index()
        {
            // Landing page showing Nile Health platform features
            try
            {
                var usersSnapshot = await _firebaseService.Db.Collection("users").GetSnapshotAsync();
                ViewBag.TotalUsers = usersSnapshot.Count;

                var institutionsSnapshot = await _firebaseService.Db.Collection("institutions").GetSnapshotAsync();
                ViewBag.TotalInstitutions = institutionsSnapshot.Count;
            }
            catch (Exception)
            {
                ViewBag.TotalUsers = 0;
                ViewBag.TotalInstitutions = 0;
            }

            return View();
        }

        public async Task<IActionResult> Dashboard()
        {
            var users = new List<User>();
            var institutions = new List<MedicalInstitution>();
            var organizationRequests = new List<OrganizationRequest>();

            try
            {
                // Fetch dynamic collections from Firebase Firestore database
                var usersSnapshot = await _firebaseService.Db.Collection("users").GetSnapshotAsync();
                foreach (var doc in usersSnapshot.Documents)
                {
                    users.Add(doc.ConvertTo<User>());
                }

                var instSnapshot = await _firebaseService.Db.Collection("institutions").GetSnapshotAsync();
                foreach (var doc in instSnapshot.Documents)
                {
                    institutions.Add(doc.ConvertTo<MedicalInstitution>());
                }

                var reqSnapshot = await _firebaseService.Db.Collection("organizationRequests").GetSnapshotAsync();
                foreach (var doc in reqSnapshot.Documents)
                {
                    organizationRequests.Add(doc.ConvertTo<OrganizationRequest>());
                }
            }
            catch (Exception ex)
            {
                ViewBag.Error = $"Failed to load Firestore data: {ex.Message}";
            }

            // Bind data to ViewBag for MVC rendering
            ViewBag.Users = users;
            ViewBag.Institutions = institutions;
            ViewBag.OrganizationRequests = organizationRequests;

            ViewBag.Doctors = users.Where(u => u.Role == "doctor").ToList();
            ViewBag.Patients = users.Where(u => u.Role == "patient").ToList();
            ViewBag.InsuranceUsers = users.Where(u => u.Role == "insurance").ToList();

            return View();
        }
    }
}
