# Nile Health ASP.NET Core 8.0 MVC Backend

مرحباً بك! لقد قمنا بترقية وتجهيز جزء الـ Backend بالكامل لك ليتحول إلى **ASP.NET Core 8.0 MVC (Model-View-Controller)** بشكل كامل ومتكامل مع قاعدة بيانات **Firebase Firestore** ونظام المصادقة **Firebase Auth**، مع تلبية جميع التعديلات المطلوبة.

---

## 🛠️ التعديلات المخصصة المدمجة بالداخل (Custom MVC Upgrades)
1. **ترقية الهيكل إلى MVC:**
   - تم تسجيل خدمات الكنترولر مع واجهات العرض Razor عن طريق `AddControllersWithViews()`.
   - تم ضبط مسارات التوجيه الافتراضية (Routing Map) لتوجيه المستخدمين لصفحة البداية الافتراضية: `"{controller=Home}/{action=Index}/{id?}"`.
2. **صفحة الهبوط وواجهات العرض التفاعلية (Razor Views):**
   - تم تصميم صفحة الهبوط الافتراضية `Home/Index` بشكل عصري وجذاب ومناسب للهواتف باستخدام Tailwind CSS.
   - تم بناء لوحة تحكم إدارية متكاملة `Home/Dashboard` تقوم بسحب البيانات الحية مباشرة من مجموعات Firestore (مثل الأطباء، المرضى، المؤسسات الطبية والطلبات المعلقة) وعرضها في جداول منظمة ديناميكياً بلغة C#.
3. **عرض الروابط المباشرة لملفات الأشعة (Radiographs Link):**
   - تم تعديل موديل الـ Radiology وقاعدة البيانات لحفظ وعرض الروابط المباشرة (`ImageUrl`) التي يتم إدخالها يدوياً بدلاً من صور مصغرة.
4. **إلغاء التحقق من وثائق الأطباء (No Doctor Verification Files):**
   - تم تبسيط كود تسجيل الأطباء وحذف الحاجة لمستندات نقابة الأطباء أو رفع ملفات في التسجيل ليكون مرناً ومباشراً.

---

## 📂 هيكل المجلد ونظام الملفات (MVC Folder Structure)
- **`Program.cs`**: إعداد خادم ASP.NET Core لدعم الـ MVC (`AddControllersWithViews`) والـ API، وتفعيل الـ Static Files ورسم خريطة مسار الـ Controller Route.
- **`Controllers/`**:
  - `HomeController.cs`: الكنترولر المسؤول عن طلب وإرجاع صفحات Razor (`Index`, `Dashboard`) وتمرير بيانات Firestore لصفحات العرض عبر الـ `ViewBag`.
  - `AuthController.cs`: معالجة الملفات الشخصية والتحقق من حسابات المستخدمين.
  - `RecordsController.cs`: إدارة السجلات الطبية، الروشتات، تحاليل المختبر، وتقارير الأشعة.
  - `AdminController.cs`: لوحة تحكم الأدمن وموافقة الأطباء.
- **`Models.cs`**: الموديلات وهياكل البيانات بلغة C# مطابقة تماماً للموديلات في واجهة الـ React مع وسوم Firebase Firestore.
- **`Views/`**:
  - `Shared/_Layout.cshtml`: الهيكل الخارجي العام والـ Navigation Bar والـ Footer الموحد لكافة الصفحات باستخدام Tailwind CSS.
  - `Home/Index.cshtml`: صفحة الترحيب واستعراض إحصائيات النظام.
  - `Home/Dashboard.cshtml`: لوحة الإحصائيات التفصيلية والمستخدمين والمؤسسات والطلبات المسحوبة ديناميكياً من قاعدة البيانات.
  - `_ViewStart.cshtml` & `_ViewImports.cshtml`: الملفات الخاصة بتهيئة مسارات صفحات Razor واستيراد المكتبات بشكل تلقائي.
- **`FirebaseService.cs`**: الخدمة المسؤولة عن التحقق من الـ Tokens وإرسال/استقبال البيانات من Firestore.

---

## 🚀 كيفية تشغيل مشروع الـ ASP.NET Core MVC محلياً

### 1. المتمتطلبات المسبقة:
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
سيبدأ الخادم بالعمل على `http://localhost:5000` (أو الرابط المحدد في ملف التشغيل).
- لمشاهدة واجهة الـ MVC الرائعة: افتح `http://localhost:5000` في متصفحك.
- لمشاهدة لوحة التحكم الديناميكية: اذهب إلى `http://localhost:5000/Home/Dashboard`.
- لتجربة الـ Swagger API: اذهب إلى `http://localhost:5000/swagger`.

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

تهانينا على هذه البنية البرمجية المتكاملة والحديثة بنظام MVC! 🚀
