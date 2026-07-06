# Nile Health ASP.NET Core 8.0 Web API Backend

مرحباً بك! لقد قمنا ببرمجة وتجهيز جزء الـ Backend بالكامل لك باستخدام **ASP.NET Core 8.0 (C#)** والربط مع قاعدة بيانات **Firebase Firestore** ونظام المصادقة **Firebase Auth**، مع تلبية جميع التعديلات المطلوبة.

---

## 🛠️ التعديلات المخصصة المدمجة بالداخل (Custom Modifications)
1. **عرض الروابط المباشرة لملفات الأشعة (Radiographs Link):**
   - تم تعديل موديل الـ Radiology وقاعدة البيانات لحفظ وعرض الروابط المباشرة (`ImageUrl`) التي يتم إدخالها يدوياً بدلاً من صور مصغرة.
2. **إلغاء التحقق من وثائق الأطباء (No Doctor Verification Files):**
   - تم تبسيط كود تسجيل الأطباء وحذف الحاجة لمستندات نقابة الأطباء أو رفع ملفات في التسجيل ليكون مرناً ومباشراً.

---

## 📂 هيكل المجلد ونظام الملفات (Folder Structure)
- **`Program.cs`**: إعداد وتشغيل خادم ASP.NET Core، تفعيل الـ CORS لتشغيل تطبيق React بسلاسة، ومصادقة الـ JWT الخاصة بـ Firebase.
- **`Models.cs`**: الموديلات وهياكل البيانات بلغة C# مطابقة تماماً للموديلات في واجهة الـ React (مثل `User`, `MedicalRecord`, `RadiologyReport`, `Claim` ... إلخ) مع وسوم Firebase Firestore.
- **`FirebaseService.cs`**: الخدمة المسؤولة عن التحقق من الـ Tokens وإرسال/استقبال البيانات من Firestore.
- **`Controllers/`**:
  - `AuthController.cs`: معالجة الملفات الشخصية والتحقق من حسابات المستخدمين.
  - `RecordsController.cs`: إدارة السجلات الطبية، الروشتات، تحاليل المختبر، وتقارير الأشعة.
  - `AdminController.cs`: لوحة تحكم الأدمن وموافقة الأطباء.

---

## 🚀 كيفية تشغيل مشروع الـ ASP.NET Core محلياً

### 1. المتطلبات المسبقة:
- تثبيت [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0).
- أداة تطوير مثل **Visual Studio 2022** أو **VS Code** مع إضافة C#.

### 2. تحميل ملف حساب Firebase الخدمي (Firebase Service Account Key):
- اذهب إلى **Firebase Console** -> **Project Settings** -> **Service accounts**.
- اضغط على **Generate new private key** وقم بتحميل ملف الـ `.json`.
- ضع الملف داخل مجلد باسم `secrets` داخل مشروعك وقم بتسميته `firebase_service_account.json` (أو حدث المسار في `appsettings.json`).

### 3. تشغيل المشروع عبر سطر الأوامر (Command Line):
```bash
# الانتقال لمجلد المشروع
cd aspnet-core-backend

# استعادة الحزم الاعتمادية
dotnet restore

# تشغيل المشروع
dotnet run
```
سيبدأ الخادم بالعمل على `http://localhost:5000` (أو الرابط المحدد في ملف التشغيل). يمكنك فتح واجهة **Swagger** للتجربة التفاعلية عبر: `http://localhost:5000/swagger`.

---

## 🔗 ربط تطبيق React بالـ ASP.NET Core Backend

لتوجيه تطبيق الـ React لاستخدام الـ C# API بدلاً من التخاطب المباشر مع Firebase من المتصفح:
1. قم بإنشاء ملف `.env` في واجهة الـ React وضع الرابط:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
2. عند إجراء أي اتصال بالخادم، أرسل الـ `idToken` الذي تحصل عليه من Firebase Auth في الهيدر باسم `Authorization`:
   ```typescript
   const token = await auth.currentUser?.getIdToken();
   const response = await fetch("http://localhost:5000/api/records/medical-records/PATIENT_ID", {
     headers: {
       "Authorization": `Bearer ${token}`
     }
   });
   ```

تهانينا على هذه البنية البرمجية المتكاملة والحديثة! 🚀
