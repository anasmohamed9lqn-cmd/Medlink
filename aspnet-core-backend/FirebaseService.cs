using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using NileHealth.Api.Models;

namespace NileHealth.Api.Services
{
    public class FirebaseService
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly FirebaseApp _firebaseApp;

        public FirebaseService(IConfiguration configuration)
        {
            string projectId = configuration["Firebase:ProjectId"] ?? "ai-studio-51b0b46c-80ba-47ad-8a0c-dc4a7d8c59c7";
            string serviceAccountPath = configuration["Firebase:ServiceAccountPath"] ?? "";

            // Initialize Firebase App if not already initialized
            if (FirebaseApp.DefaultInstance == null)
            {
                AppOptions options;
                if (!string.IsNullOrEmpty(serviceAccountPath) && File.Exists(serviceAccountPath))
                {
                    options = new AppOptions
                    {
                        Credential = GoogleCredential.FromFile(serviceAccountPath)
                    };
                }
                else
                {
                    options = new AppOptions
                    {
                        Credential = GoogleCredential.GetApplicationDefault()
                    };
                }
                _firebaseApp = FirebaseApp.Create(options);
            }
            else
            {
                _firebaseApp = FirebaseApp.DefaultInstance;
            }

            // Initialize Firestore
            _firestoreDb = FirestoreDb.Create(projectId);
        }

        public FirestoreDb Db => _firestoreDb;

        // Verify Firebase JWT token
        public async Task<FirebaseToken?> VerifyTokenAsync(string idToken)
        {
            try
            {
                return await FirebaseAuth.GetAuth(_firebaseApp).VerifyIdTokenAsync(idToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token verification failed: {ex.Message}");
                return null;
            }
        }

        // --- User Profile Handling ---
        public async Task<User?> GetUserProfileAsync(string userId)
        {
            var docRef = _firestoreDb.Collection("users").Document(userId);
            var snapshot = await docRef.GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<User>();
            }
            return null;
        }

        public async Task UpsertUserProfileAsync(User user)
        {
            var docRef = _firestoreDb.Collection("users").Document(user.Id);
            await docRef.SetAsync(user, SetOptions.MergeAll);
        }

        // --- Generic CRUD helper for sub-collections ---
        public async Task<List<T>> GetDocumentsAsync<T>(string collectionName, string patientId) where T : class
        {
            var collectionRef = _firestoreDb.Collection(collectionName);
            var query = collectionRef.WhereEqualTo("patientId", patientId);
            var querySnapshot = await query.GetSnapshotAsync();
            
            var results = new List<T>();
            foreach (var docSnapshot in querySnapshot.Documents)
            {
                results.Add(docSnapshot.ConvertTo<T>());
            }
            return results;
        }

        public async Task AddDocumentAsync<T>(string collectionName, string id, T data) where T : class
        {
            var docRef = _firestoreDb.Collection(collectionName).Document(id);
            await docRef.SetAsync(data);
        }
    }
}
