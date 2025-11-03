# React MSI - EPC Dashboard

Modern dashboard aplikasi untuk manajemen Electronic Parts Catalog (EPC) dengan sistem manajemen VIN, kategori, dan suku cadang kendaraan.

## 🚀 Tech Stack

- **Framework:** React 19 dengan TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **Routing:** React Router 7
- **State Management:** Context API
- **HTTP Client:** Axios
- **UI Components:** Custom components + React Data Table
- **Validation:** Custom validation dengan TypeScript
- **Testing:** Vitest + React Testing Library
- **Code Quality:** ESLint + Prettier

## 📋 Prerequisites

- Node.js 18+ dan npm
- Git

## 🛠️ Setup & Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd epc
```

> **Note for Windows Users:** Pastikan repository diletakkan dekat root drive untuk menghindari masalah path.

### 2. Install Dependencies

```bash
npm install
```

> Gunakan flag `--legacy-peer-deps` jika menghadapi masalah saat install.

### 3. Environment Configuration

Buat file `.env` di root project dengan menyalin dari `.env.example`:

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan konfigurasi yang sesuai:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PORT=4000
VITE_OPEN=false
VITE_HMR=true
VITE_HOST=false
```

### 4. Start Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:4000` (atau sesuai VITE_PORT)

## 📁 Project Structure

```
epc/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── common/      # Common components
│   │   ├── form/        # Form components
│   │   ├── ui/          # UI elements
│   │   └── ...
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── SidebarContext.tsx
│   ├── hooks/           # Custom React hooks
│   ├── layout/          # Layout components
│   ├── pages/           # Page components
│   ├── Routes/          # Route configuration
│   ├── services/        # API services
│   ├── helpers/         # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── ...
├── .env.example         # Environment template
├── package.json
└── vite.config.ts
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code dengan Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:ui` - Run tests dengan UI
- `npm run test:coverage` - Run tests dengan coverage report

## 🔐 Authentication

Aplikasi menggunakan sistem SSO authentication dengan:
- Role-based access control (RBAC)
- Permission-based menu access
- JWT token management
- Session management

## 📚 Key Features

- ✅ **Dashboard EPC** - Overview catalog dan statistik
- ✅ **VIN Management** - Manajemen Vehicle Identification Number
- ✅ **Catalog Management** - CRUD untuk parts catalog
- ✅ **Category Management** - Hierarki kategori suku cadang
- ✅ **Master Category** - Master data kategori
- ✅ **Administration** - Manajemen user, role, menu, dll
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Permission System** - Fine-grained access control

## 🧪 Testing

Aplikasi menggunakan Vitest untuk testing:

```bash
# Run semua tests
npm run test

# Run tests dengan UI
npm run test:ui

# Run tests dengan coverage
npm run test:coverage
```

## 🏗️ Build for Production

```bash
npm run build
```

Build artifacts akan tersimpan di folder `dist/`.

## 📝 Code Quality

### ESLint
```bash
npm run lint          # Check
npm run lint:fix      # Fix issues
```

### Prettier
```bash
npm run format        # Format code
npm run format:check  # Check formatting
```

## 🔧 Troubleshooting

### Port already in use
Edit `VITE_PORT` di file `.env`

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
npm run lint:fix
npm run build
```

## 📖 Documentation

Untuk dokumentasi lengkap tentang issues dan rekomendasi perbaikan, lihat:
- [KOREKSI_DAN_REKOMENDASI.md](./KOREKSI_DAN_REKOMENDASI.md) - Review sistem dan rekomendasi
- [INSTALL_SEHAT.md](./INSTALL_SEHAT.md) - Panduan install dependencies

## 👥 Contributing

1. Create feature branch dari `main`
2. Commit perubahan dengan pesan jelas
3. Push ke branch dan buat Pull Request
4. Pastikan semua tests pass dan linter tidak error

## 📄 License

Copyright © 2024 Motor Sights International

---

**Last Updated:** December 2024