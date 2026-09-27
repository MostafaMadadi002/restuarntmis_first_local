# 🍽️ پلتفرم مدیریت عملیات رستوران و کافه (Local-First Restaurant Platform)

یک سامانه جامع، صنعتی و کاملاً بومی (**Local-First**) برای مدیریت یکپارچه رستوران شامل:
- **صندوق لمسی فروش (POS Master)**
- **نمایشگر هوشمند آشپزخانه (KDS)**
- **سامانه سفارش‌گیری تبلت گارسون (Waiter App)**
- **منوی دیجیتال QR و سفارش‌گیری آنلاین سر میز بدون نیاز به اینترنت (Customer QR Self-Ordering)**
- **تسویه اشتراکی و دُنگی (Split Bill Engine)**
- **مدیریت انبارداری و فرمولاسیون غذا (Inventory & Recipe Costing)**
- **باشگاه مشتریان و نظرسنجی (CRM & Loyalty)**
- **حضور و غیاب پرسنل و مانیتورینگ تبلت‌ها (Staff & Device Management)**

> **پایداری ۱۰۰٪ در شبکه محلی:** این نرم‌افزار به گونه‌ای معماری شده که حتی در شرایط قطع سراسری اینترنت، در بستر مودم و شبکه وای‌فای داخلی رستوران (Local LAN/Wi-Fi) با سرعت فوق‌العاده بالا و بدون کوچک‌ترین وقفه کار می‌کند.

---

## ⚡ راهنمای سریع (اجرای کل سیستم در ۳ دقیقه با SQLite)

اگر می‌خواهید بلافاصله روی کامپیوتر شخصی خود سیستم را بدون نیاز به نصب دیتابیس جانبی اجرا و تست کنید:

### ۱. اجرای سرور بک‌اند (ترمینال اول):
```bash
# رفتن به پوشه بک‌اند
cd backend

# ساخت و فعال‌سازی محیط مجازی پایتون
python3 -m venv venv
source venv/bin/activate    # در ویندوز: venv\Scripts\activate

# نصب پکیج‌ها
pip install -r requirements.txt

# مایگریشن‌ها و تزریق داده‌های نمونه اولیه
python manage.py makemigrations accounts restaurants tables catalog orders kitchen inventory recipes purchasing finance crm loyalty marketing operations staff devices audit reports
python manage.py migrate
python manage.py seed_demo_data

# اجرای سرور روی پورت ۸۰۰۰
python manage.py runserver 0.0.0.0:8000
```

### ۲. اجرای فرانت‌اند (ترمینال دوم در ریشه پروژه):
```bash
# نصب پکیج‌های فرانت و اجرای وب‌سرور
npm install
npm run dev
```

🌐 سپس مرورگر خود را باز کرده و به آدرس زیر بروید:
**`http://localhost:3000`**

نشانگر بالای صفحه به رنگ سبز درآمده و عبارت **«سرور محلی جنگو متصل»** را نشان خواهد داد!

---

## 📋 پیش‌نیازهای نرم‌افزاری

قبل از شروع، مطمئن شوید نرم‌افزارهای زیر روی سیستم شما نصب هستند:
- **Node.js** (نسخه 18 به بالا) و **npm** ([دانلود Node.js](https://nodejs.org/))
- **Python** (نسخه 3.10 یا بالاتر) ([دانلود Python](https://www.python.org/))
- **Git** ([دانلود Git](https://git-scm.com/))
- **PostgreSQL 14+** *(اختیاری - در صورت تمایل به استفاده از دیتابیس سروری بجای SQLite پیش‌فرض)*

---

## 🛠️ راهنمای گام‌به‌گام راه‌اندازی Backend (Django REST Framework)

### گام ۱: باز کردن ترمینال و ورود به پوشه بک‌اند
```bash
cd backend
```

### گام ۲: ساخت محیط ایزوله مجازی (Virtual Environment)
* **در لینوکس و مک (Linux / macOS):**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
* **در ویندوز (Windows PowerShell یا Command Prompt):**
  ```cmd
  python -m venv venv
  venv\Scripts\activate
  ```
*(پس از فعال‌سازی، پیشوند `(venv)` در خط فرمان ظاهر می‌شود).*

### گام ۳: ارتقای pip و نصب بسته‌های مورد نیاز
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### گام ۴: پیکربندی فایل محیطی (`.env`)
فایل نمونه را کپی کرده و در صورت نیاز مقادیر آن را بازبینی کنید:
* **در لینوکس / مک:**
  ```bash
  cp .env.example .env
  ```
* **در ویندوز:**
  ```cmd
  copy .env.example .env
  ```

#### گزینه‌های دیتابیس در `.env`:
* **حالت الف: استفاده از دیتابیس سبک لوکال (SQLite - پیشنهادی برای تست سریع بدون نصب دیتابیس):**
  ```env
  DJANGO_SECRET_KEY="local-restaurant-secret-key-12345"
  DEBUG=True
  ALLOWED_HOSTS=*
  DB_ENGINE=sqlite
  ```
* **حالت ب: استفاده از دیتابیس سازمانی (PostgreSQL):**
  ```env
  DJANGO_SECRET_KEY="local-restaurant-secret-key-12345"
  DEBUG=True
  ALLOWED_HOSTS=*
  DB_ENGINE=postgres
  DB_NAME=restaurant_db
  DB_USER=postgres
  DB_PASSWORD=your_password
  DB_HOST=127.0.0.1
  DB_PORT=5432
  ```
  *(اگر حالت PostgreSQL را انتخاب کردید، ابتدا در Postgres دستور `CREATE DATABASE restaurant_db;` را اجرا فرمایید).*

---

### گام ۵: ساخت و اعمال مایگریشن‌ها (Migrations)

برای ایجاد تمام جداول دیتابیس (میزها، منو، سفارشات، KDS، تسویه، انبار، باشگاه مشتریان، پرسنل، لاگ و سخت‌افزارها)، دستورات زیر را به ترتیب اجرا کنید:

```bash
# ایجاد مایگریشن‌های تمامی ماژول‌ها
python manage.py makemigrations accounts restaurants tables catalog orders kitchen inventory recipes purchasing finance crm loyalty marketing operations staff devices audit reports

# اعمال تغییرات بر روی پایگاه داده
python manage.py migrate
```

### گام ۶: تزریق داده‌های نمونه اولیه رستوران (Seed Data)
جهت جلوگیری از خالی بودن منو و میزها، یک کامند اختصاصی آماده شده که اطلاعات کامل رستوران آریانا (میزهای سالن، وی‌آی‌پی، تراس، منوی کباب‌ها و غذاهای سنتی، ایستگاه‌های پخت، موجودی انبار، پرسنل و نمایشگرها) را در چند ثانیه اضافه می‌کند:

```bash
python manage.py seed_demo_data
```

### گام ۷: ساخت کاربر ادمین دلخواه (اختیاری)
دستور `seed_demo_data` قبلاً کاربر `admin` با پسورد `admin123` را ساخته است. در صورت تمایل به ساخت مدیر جدید:
```bash
python manage.py createsuperuser
```

### گام ۸: اجرای تست‌های خودکار (Unit Tests)
برای اطمینان از عملکرد صحیح منطق محاسبه فاکتور اشتراکی (Split Bill)، تراکنش‌های مالی و قفل‌های دیتابیس:
```bash
python manage.py test apps.finance
```

### گام ۹: اجرای نهایی سرور بک‌اند
دستور زیر سرور را روی تمام کارت‌های شبکه فعال گوش به زنگ قرار می‌دهد:
```bash
python manage.py runserver 0.0.0.0:8000
```
✅ **آدرس‌های تست مستقیم بک‌اند:**
- **تست سلامت سرویس (Health Check):** `http://localhost:8000/api/v1/health/`
- **پنل ادمین جنگو (Django Admin):** `http://localhost:8000/admin/`

---

## 💻 راهنمای گام‌به‌گام راه‌اندازی Frontend (React + Vite + TailwindCSS)

در یک پنجره ترمینال جدید (جدا از ترمینال جنگو)، به **پوشه اصلی پروژه** بروید:

### گام ۱: نصب پکیج‌های جاوااسکریپت
```bash
npm install
```

### گام ۲: اجرای سرور فرانت‌اند در حالت توسعه (Dev Server)
```bash
npm run dev
```

مرورگر خود را باز کرده و وارد شوید:
👉 **`http://localhost:3000`**

---

## 🔗 نحوه اتصال و راستی‌آزمایی ارتباط فرانت به بک‌اند

1. **پروکسی هوشمند Vite (`vite.config.ts`):**  
   تمام درخواست‌های ارسالی با پیشوند `/api/*` به صورت داخلی به `http://127.0.0.1:8000` فوروارد می‌شوند؛ بنابراین هیچ خطای CORS یا نیاز به تنظیمات پورت در کلاینت نخواهید داشت.

2. **نشانگر وضعیت در هدر (Topbar Status Badge):**  
   در بالای صفحه سمت چپ، وضعیت سرور محلی نشان داده می‌شود:
   - 🟢 **سبز (`سرور محلی جنگو متصل`):** نشان‌دهنده پاسخ 200 OK از جنگو و همگام‌سازی مستقیم با دیتابیس.
   - 🟡 **زرد (`حالت لوکال (راهنما)`):** اگر جنگو خاموش باشد، سیستم در حالت Standby کار می‌کند و با کلیک روی آن پنجره راهنما و دکمه **تست مجدد اتصال** باز می‌شود.

3. **ارتباط دوطرفه عملیات:**
   - با تغییر وضعیت میز، ویرایش قیمت غذا، یا ثبت سفارش در POS و تبلت گارسون، اطلاعات بلافاصله در دیتابیس جنگو ذخیره می‌گردند.

---

## 📱 راهنمای اتصال تبلت‌ها و گوشی‌های داخل رستوران با Wi-Fi (شبکه محلی)

برای اینکه تبلت گارسون، نمایشگر آشپزخانه و گوشی مشتریان به سرور متصل شوند:

1. سرور (کامپیوتر اصلی رستوران) و تمام دستگاه‌ها را به یک مودم Wi-Fi مشترک وصل کنید.
2. آی‌پی محلی کامپیوتر اصلی را بیابید:
   - در لینوکس: `ip a` یا `hostname -I` (مثلاً: `192.168.1.50`)
   - در ویندوز: دستور `ipconfig` (بخش IPv4 Address)
3. در فایل `backend/.env` متغیر `ALLOWED_HOSTS=*` باشد (که به طور پیش‌فرض هست).
4. دستگاه‌ها می‌توانند با مرورگر به آدرس زیر وصل شوند:
   - **سامانه مدیریت و گارسون:** `http://192.168.1.50:3000`
   - **سفارش‌گیری مشتری با اسکن QR:** `http://192.168.1.50:3000/?tableId=1`

---

## 👥 اطلاعات کاربری پیش‌فرض سیستم

| نقش (Role) | نام کاربری | رمز عبور | دسترسی و کاربرد |
| :--- | :--- | :--- | :--- |
| **سوپریوزر / مدیر ارشد** | `admin` | `admin123` | دسترسی کامل به پنل ادمین جنگو، تنظیمات، آمار و گزارشات |
| **صندوقدار (POS)** | منوی نقش در Topbar | انتخاب **صندوقدار** | ثبت سفارش، تسویه نقدی/کارت‌خوان و چاپ فاکتور |
| **سالندار / گارسون** | منوی نقش در Topbar | انتخاب **گارسون** | ثبت سفارش سر میز، ارسال به آشپزخانه، رسیدگی به درخواست‌ها |
| **آشپزخانه (KDS)** | منوی نقش در Topbar | انتخاب **آشپزخانه** | مدیریت صف پخت، فیلتر ایستگاه کباب/غذا، تغییر وضعیت آماده‌سازی |
| **مهمان / مشتری (QR)** | منوی نقش در Topbar | انتخاب **مشتری** | منوی سلف‌سرویس مهمان، دکمه فراخوانی گارسون و ثبت سفارش |

---

## 🆘 دستورات کاربردی و خطایابی (Troubleshooting)

### خطای «Port 8000 already in use»:
اگر پورت ۸۰۰۰ اشغال بود:
* در لینوکس/مک:
  ```bash
  lsof -ti:8000 | xargs kill -9
  ```
* در ویندوز:
  ```cmd
  netstat -ano | findstr :8000
  taskkill /PID <PID_NUMBER> /F
  ```

### بازنشانی و ریست کامل دیتابیس از نو:
اگر می‌خواهید دیتابیس را پاک کرده و از صفر بسازید:
```bash
# در لینوکس / مک:
rm -f backend/db.sqlite3
rm -rf backend/apps/*/migrations/00*.py

# در ویندوز:
del backend\db.sqlite3

# سپس مجدداً مایگریشن و داده‌های اولیه را اعمال کنید:
python manage.py makemigrations accounts restaurants tables catalog orders kitchen inventory recipes purchasing finance crm loyalty marketing operations staff devices audit reports
python manage.py migrate
python manage.py seed_demo_data
```

### پشتیبان‌گیری منظم (Backup):
یک اسکریپت خودکار در مسیر `backend/scripts/daily_backup.sh` برای تهیه نسخه پشتیبان زمان‌بندی‌شده روی هارد اکسترنال سرور تدارک دیده شده است.
