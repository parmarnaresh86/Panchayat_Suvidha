# Project Structure

## Overview

This project now has **two separate implementations**:

1. **React + Node.js** (Original) - In root folders
2. **React + Laravel** (New) - In `my-village/` folder

---

## 📁 Current Structure

```
Panchayat_Suvidha/
│
├── frontend/                    # React frontend (shared, points to Node.js)
├── backend/                     # Node.js + Express backend
├── panchayat-laravel/          # Laravel backend (full installation)
├── laravel-backend/            # Laravel backend files (templates)
│
├── my-village/                 # 🆕 REACT + LARAVEL (Organized)
│   ├── frontend/               # React frontend copy
│   ├── backend/                # Laravel backend copy
│   ├── deploy-to-laravel.bat   # Deployment script
│   ├── deploy-to-laravel.sh    # Deployment script (Linux/Mac)
│   ├── HOSTING_QUICK_START.md  # Hosting guide
│   ├── READY_TO_HOST.md        # Overview
│   └── README.md               # Quick start guide
│
└── [Various documentation files]
```

---

## 🎯 Which One to Use?

### Use `my-village/` folder if you want:
- ✅ React + Laravel stack
- ✅ Clean, organized structure
- ✅ Ready to deploy
- ✅ Separate from Node.js version
- ✅ All-in-one package

### Use root folders if you want:
- Node.js + Express backend
- Original implementation
- Development/testing

---

## 🚀 Getting Started with my-village

```bash
cd my-village

# Install dependencies
cd frontend && npm install
cd ../backend && composer install

# Setup database
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Run servers
php artisan serve  # Backend on :8000
# In another terminal:
cd frontend && npm run dev  # Frontend on :5173
```

---

## 📦 Deploy my-village

```bash
cd my-village

# Windows
deploy-to-laravel.bat

# Linux/Mac
chmod +x deploy-to-laravel.sh
./deploy-to-laravel.sh
```

Then visit: http://localhost:8000

---

## 📚 Documentation

### For my-village (React + Laravel):
- `my-village/README.md` - Quick start
- `my-village/HOSTING_QUICK_START.md` - Deployment guide
- `my-village/READY_TO_HOST.md` - Overview

### General:
- `DEPLOYMENT_GUIDE.md` - Complete deployment docs
- `INDEX.md` - Project overview
- Tech stack guides in `.kiro/steering/`

---

## 🔄 Differences

| Feature | Root (Node.js) | my-village (Laravel) |
|---------|---------------|---------------------|
| Backend | Express.js | Laravel 11 |
| Database | MS SQL Server | MySQL/MariaDB |
| Auth | JWT (dummy) | Laravel Sanctum |
| Structure | Scattered | Organized |
| Deployment | Manual | Automated scripts |
| Hosting | Requires Node.js | Standard PHP hosting |

---

## 💡 Recommendation

**For production hosting**: Use `my-village/` folder
- Easier to deploy
- Works on cheap shared hosting
- Better organized
- Complete documentation
- Automated deployment

**For development**: Use either based on your preference

---

## 🗂️ Clean Up (Optional)

If you only want the Laravel version, you can:

1. Keep only `my-village/` folder
2. Delete root `frontend/`, `backend/`, `panchayat-laravel/`
3. Move `my-village/` contents to root if desired

---

## ✅ Summary

- **my-village/** = Complete React + Laravel package, ready to host
- **Root folders** = Original Node.js implementation
- Both work independently
- Choose based on your hosting preference

---

Happy coding! 🚀
