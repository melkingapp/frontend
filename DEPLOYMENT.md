# 🛰️ Melking Frontend Deployment Guide

## 1. سرور Production (Linux)

- OS: Ubuntu 22.04 (یا هر توزیع سازگار)
- وب‌سرور: Nginx
- پوشه فرانت‌اند: `/var/www/melking/frontend-new`
- Backend جدید روی پورت `9000` در مسیر `/var/www/melking/backend-new`

```bash
sudo apt update && sudo apt install -y nginx
sudo ufw allow 'Nginx Full'

sudo mkdir -p /var/www/melking/frontend-new/{releases,shared}
sudo chown -R $USER:$USER /var/www/melking
```

## 2. کانفیگ Nginx

`/etc/nginx/sites-available/melking.conf`

```nginx
server {
    listen 80;
    server_name melkingapp.ir www.melkingapp.ir;

    root /var/www/melking/frontend-new/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:9000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /static/ {
        proxy_pass http://127.0.0.1:9000/static/;
    }

    location /media/ {
        proxy_pass http://127.0.0.1:9000/media/;
    }
}
```

فعال‌سازی:

```bash
sudo ln -sf /etc/nginx/sites-available/melking.conf /etc/nginx/sites-enabled/melking.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 3. گردش Deployment

1. GitHub Actions `npm run build` → `dist/`
2. فشرده‌سازی `dist` → انتقال به `/tmp/frontend-dist.tar.gz`
3. استخراج در پوشه release جدید (نام‌گذاری زمان + SHA)
4. لینک `current` به release جدید
5. `systemctl reload nginx`
6. Health check روی `DEPLOYMENT_URL`

ساختار نهایی:

```
/var/www/melking/frontend-new
├── releases/
│   ├── release-20250101-abc1234/
│   └── ...
├── shared/
└── current -> releases/release-20250101-abc1234
```

## 4. دستورات مفید

```bash
# نمایش release فعلی
readlink -f /var/www/melking/frontend-new/current

# حذف release های قدیمی (مثال: نگه‌داشتن 3 تا)
cd /var/www/melking/frontend-new/releases
ls -1tr | head -n -3 | xargs -r rm -rf

# ریست سریع frontend بدون build
systemctl reload nginx
```

## 5. Troubleshooting

| مشکل | راه‌حل |
| --- | --- |
| سفید شدن صفحه | `dist/` ناقص یا `current` درست لینک نشده است. symlink را بررسی کنید. |
| 404 روی route های React | `location / { try_files ... }` در Nginx درست تنظیم نشده است. |
| عدم دسترسی به API | مطمئن شوید `/api/` به پورت 9000 فوروارد می‌شود و CORS سمت backend اجازه می‌دهد. |
| خطای 502 | backend خاموش است یا Firewall پورت 9000 را بسته است. |

## 6. Rollback

```bash
cd /var/www/melking/frontend-new/releases
ls -1tr           # release های قدیمی
ln -sfn releases/release-<old> ../current
systemctl reload nginx
```

بهتر است همیشه حداقل دو release نگه دارید تا rollback فوری باشد.

---

برای هماهنگی بیشتر با backend، فایل `CI_CD_SETUP.md` را مطالعه کنید و مطمئن شوید Secrets مشترک (SSH، HOST و ...) یکسان تنظیم شده‌اند. موفق باشید! 🚀*** End Patch

