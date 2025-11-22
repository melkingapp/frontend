# 🔐 راهنمای تنظیم SSH Key برای GitHub Actions

## گام 1: اتصال به سرور

```bash
ssh root@171.22.25.201
```

رمز عبور: `Armita@Ahmadi0X11`

---

## گام 2: بررسی وجود SSH Key

```bash
ls -la ~/.ssh/
```

اگر فایل‌های `id_rsa` و `id_rsa.pub` یا `id_ed25519` و `id_ed25519.pub` وجود دارند، به گام 4 بروید.

---

## گام 3: ساخت SSH Key جدید (اگر وجود نداشت)

```bash
ssh-keygen -t ed25519 -C "github-actions@melking" -f ~/.ssh/id_ed25519
```

**نکته:** وقتی از شما passphrase خواست، فقط Enter بزنید (بدون رمز).

---

## گام 4: نمایش Public Key (برای بررسی)

```bash
cat ~/.ssh/id_ed25519.pub
```

این را کپی کنید و در `~/.ssh/authorized_keys` سرور اضافه کنید (اگر قبلاً اضافه نشده):

```bash
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

---

## گام 5: نمایش Private Key (برای GitHub Secrets)

```bash
cat ~/.ssh/id_ed25519
```

**⚠️ مهم:** این محتوا را کامل کپی کنید (شامل `-----BEGIN OPENSSH PRIVATE KEY-----` و `-----END OPENSSH PRIVATE KEY-----`)

---

## گام 6: اضافه کردن به GitHub Secrets

1. به این آدرس بروید:
   ```
   https://github.com/melkingapp/frontend/settings/secrets/actions
   ```

2. روی **"New repository secret"** کلیک کنید

3. این secrets را یکی یکی اضافه کنید:

   | Name | Value |
   |------|-------|
   | `SSH_PRIVATE_KEY` | محتوای کامل `~/.ssh/id_ed25519` (از گام 5) |
   | `SSH_USER` | `root` |
   | `SSH_HOST` | `171.22.25.201` |
   | `DEPLOYMENT_URL` | `https://melkingapp.ir` |
   | `VITE_API_BASE_URL` | `https://melkingapp.ir/api/v1` |

---

## گام 7: تست اتصال (اختیاری)

از کامپیوتر خودتان:

```bash
ssh -i ~/.ssh/id_ed25519 root@171.22.25.201
```

اگر بدون رمز عبور متصل شد، یعنی SSH key درست کار می‌کند.

---

## ✅ بررسی نهایی

بعد از اضافه کردن secrets، یک commit به `main` push کنید تا workflow اجرا شود و deployment انجام شود.

