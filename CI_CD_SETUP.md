# 🚀 راهنمای راه‌اندازی CI/CD برای Melking Frontend

این راهنما همان مراحلی است که برای backend انجام شد، اما برای مخزن مستقل فرانت‌اند (`melkingapp/frontend`).

## 1️⃣ ایجاد مخزن جداگانه

```bash
cd /path/to/melking/frontend
rm -rf .git              # اگر این دایرکتوری هنوز زیرمجموعه مخزن قبلی است
git init
git add .
git commit -m "feat: bootstrap standalone frontend"
git branch -M main
git remote add origin git@github.com:melkingapp/frontend.git
git push -u origin main
```

> اگر از قبل history قدیمی دارید، فقط `git remote set-url origin ...` را انجام دهید.

## 2️⃣ تنظیم Secrets در GitHub

به مسیر `Settings → Secrets and variables → Actions` بروید و مقادیر [لیست شده در `.github/SECRETS_SETUP.md`](.github/SECRETS_SETUP.md) را اضافه کنید. برای کپی سریع، فایل [`COPY_PASTE_SECRETS.txt`](COPY_PASTE_SECRETS.txt) آماده است.

حداقل Secrets لازم:

- `SSH_PRIVATE_KEY`
- `SSH_USER`
- `SSH_HOST`
- `VITE_API_BASE_URL`
- `DEPLOYMENT_URL`

## 3️⃣ آماده‌سازی سرور

روی سرور (همان جایی که backend روی پورت 9000 بالا است):

```bash
sudo mkdir -p /var/www/melking/frontend-new/releases
sudo mkdir -p /var/www/melking/frontend-new/shared
sudo chown -R $USER:$USER /var/www/melking/frontend-new
```

کانفیگ Nginx باید روت `current` را سرو کند:

```nginx
root /var/www/melking/frontend-new/current;
index index.html;
location / { try_files $uri $uri/ /index.html; }
location /api/ { proxy_pass http://localhost:9000/api/; ... }
```

جزئیات کامل در [DEPLOYMENT.md](DEPLOYMENT.md).

## 4️⃣ اجرای اولین Pipeline

```bash
git checkout -b chore/test-ci
echo "// test" >> README.md
git commit -am "chore: test frontend pipeline"
git push origin chore/test-ci
```

در تب **Actions**، workflow باید تا مرحله build موفق شود. پس از merge به `main`, Job Deploy نیز اجرا و فایل‌های `dist/` روی سرور قرار می‌گیرند.

## 5️⃣ چک‌لیست پیش از Merge

- [ ] `npm run lint` در local سبز است
- [ ] `npm run build` بدون warning جدی تمام می‌شود
- [ ] Secrets مورد نیاز تنظیم شده‌اند
- [ ] مسیر `/var/www/melking/frontend-new` روی سرور وجود دارد
- [ ] Nginx پس از deploy، `melkingapp.ir` را از مسیر جدید سرو می‌کند

## 6️⃣ عیب‌یابی متداول

| مشکل | راه‌حل |
| --- | --- |
| `Permission denied (publickey)` | SSH key را دوباره بسازید و `authorized_keys` را چک کنید |
| `scp: /tmp/... Permission denied` | دسترسی کاربر سرور را بررسی کنید (نیاز به root یا sudo) |
| `systemctl reload nginx` خطا می‌دهد | نام سرویس را در workflow به مقدار صحیح (مثلاً `nginx.service`) تغییر دهید |
| Health check شکست می‌خورد | `DEPLOYMENT_URL` را بررسی کنید و مطمئن شوید Nginx روت جدید را سرو می‌کند |

## 7️⃣ Next Steps

- Branch protection روی `main`
- اضافه کردن Slack/Discord notification به Job `notify`
- در صورت نیاز به CDN یا CloudFront، مرحله deploy را با آپلود به bucket جایگزین کنید

موفق باشید! ✨

