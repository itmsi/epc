# 🚀 Panduan Install Dependencies Baru

## Overview
Setelah review sistem, beberapa dependencies baru perlu ditambahkan untuk meningkatkan kualitas kode, testing, dan development experience.

---

## 📦 Dependencies yang Perlu Diinstall

### 1. Testing Dependencies
```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

**Fungsi:**
- `vitest`: Testing framework modern
- `@vitest/ui`: UI untuk melihat hasil test
- `@vitest/coverage-v8`: Code coverage reporting

---

### 2. Formatting & Code Quality
```bash
npm install -D prettier eslint-plugin-prettier
```

**Fungsi:**
- `prettier`: Code formatter
- `eslint-plugin-prettier`: Integrasi Prettier dengan ESLint

---

### 3. Testing Library untuk React
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Fungsi:**
- `@testing-library/react`: Testing utilities untuk React
- `@testing-library/jest-dom`: Custom matchers untuk testing
- `@testing-library/user-event`: Simulasi user interaction

---

### 4. Type Definitions untuk Testing
```bash
npm install -D @testing-library/jest-dom
```

---

## 🎯 Install Semua Sekaligus (Recommended)

```bash
npm install -D \
  vitest \
  @vitest/ui \
  @vitest/coverage-v8 \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  prettier \
  eslint-plugin-prettier \
  jsdom
```

---

## 📝 Cara Install

### Opsi 1: Install Manual (Copy-paste satu per satu)
Jalankan setiap command di atas secara berurutan.

### Opsi 2: Install Sekaligus (Recommended)
```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event prettier eslint-plugin-prettier jsdom
```

### Opsi 3: Update package.json lalu npm install
File `package.json` sudah di-update, tinggal run:
```bash
npm install
```

---

## ✅ Verifikasi Installasi

Setelah install, verifikasi dengan menjalankan:

```bash
# Test jika vitest berjalan
npm run test

# Cek jika prettier terpasang
npx prettier --version

# Cek coverage (harus ada test dulu)
npm run test:coverage
```

---

## 🔧 Konfigurasi Tambahan (Optional)

### Setup Sentry untuk Error Tracking
```bash
npm install @sentry/react @sentry/tracing
```

### Setup DOMPurify untuk XSS Protection
```bash
npm install dompurify
npm install -D @types/dompurify
```

---

## 📌 Catatan Penting

1. **File yang sudah dibuat:**
   - ✅ `.prettierrc` - Config Prettier
   - ✅ `.editorconfig` - Editor config
   - ✅ `vitest.config.ts` - Config testing
   - ✅ `src/test/setup.ts` - Test setup
   - ✅ `src/test/utils.tsx` - Test utilities
   - ✅ Sample test files

2. **File yang perlu dibuat manual:**
   - ⚠️ `.env` - Copy dari `.env.example` dan isi dengan nilai real

3. **Scripts baru di package.json:**
   - `npm run lint:fix` - Fix eslint errors
   - `npm run format` - Format code dengan Prettier
   - `npm run format:check` - Check formatting
   - `npm run test` - Run tests
   - `npm run test:ui` - Run tests dengan UI
   - `npm run test:coverage` - Run tests dengan coverage

---

## 🎓 Next Steps

Setelah dependencies terinstall:

1. ✅ Buat file `.env` dari template
2. ✅ Jalankan `npm run format` untuk format existing code
3. ✅ Jalankan `npm run lint:fix` untuk fix linting issues
4. ✅ Mulai tulis tests untuk components dan services
5. ✅ Setup CI/CD untuk auto-testing

---

## ⚠️ Troubleshooting

### Error: "Cannot find module 'vitest'"
```bash
npm install -D vitest
```

### Error: "Prettier not found"
```bash
npm install -D prettier
```

### Error: "Testing library not found"
```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

---

## 📞 Bantuan

Jika ada masalah:
1. Cek versi Node.js: `node --version` (minimal v18)
2. Delete `node_modules` dan `package-lock.json`
3. Run `npm install` ulang
4. Jika masih error, cek error message dan Google solusinya

