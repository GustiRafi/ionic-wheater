# Aplikasi Prakiraan Cuaca Jakarta (Ionic Vue)

Aplikasi mobile/web berbasis **Ionic Vue 3** dan **Vite** untuk menampilkan prakiraan cuaca per jam di Jakarta menggunakan Open-Meteo API.

---

## 🌐 Endpoint API

Data cuaca diambil secara online dari endpoint:
```text
https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m
```

Parameter lokasi:
- **Latitude**: `-6.2` (Jakarta)
- **Longitude**: `106.8` (Jakarta)
- **Hourly Metric**: `temperature_2m` (temperatur per jam dalam °C)

---

## 📊 Atribut / Kolom yang Ditampilkan

Sesuai ketentuan, aplikasi menampilkan:
1. **`time`**: Waktu pengukuran per jam (tersedia dalam format ISO 8601 asli dan format waktu lokal Indonesia).
2. **`temperature_2m`**: Suhu per jam dalam satuan derajat Celsius (`°C`).

---

## ✨ Fitur Tampilan

- **Tampilan Fleksibel (Dual View)**:
  - **Tampilan List**: Kartu terstruktur dengan indikator indeks, visualisasi suhu berdasar kategori warna, tanggal, jam, serta label field asli (`time` & `temperature_2m`).
  - **Tampilan Tabel**: Tabel responsif dengan kolom No, Waktu Pengukuran (`time`), Suhu (`temperature_2m`), dan Kategori Suhu (Sejuk / Normal / Hangat / Panas).
- **Ringkasan Cuaca (Hero Metrics)**:
  - Suhu terbaru / saat ini
  - Suhu minimum
  - Suhu maksimum
  - Total titik jam data (168 jam / 7 hari)
- **Pencarian & Filter**: Memfilter data berdasarkan tanggal (contoh: `2026-10-16`) atau jam.
- **Pull-to-Refresh & Tombol Segarkan**: Kemudahan reload data terkini.
- **Penanganan Error & Status Loading**: Spinner indikator dan tombol coba lagi saat jaringan bermasalah.

---

## 🚀 Panduan Menjalankan Proyek

### 1. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Akses aplikasi melalui browser di URL lokal yang ditampilkan (biasanya `http://localhost:5173/`).

### 2. Menjalankan Unit Test
```bash
npm run test:unit
```

### 3. Membangun untuk Produksi (Build)
```bash
npm run build
```

---

## 📦 Riwayat Commit (Atomic Commits)
1. `chore: initialize Ionic Vue project with base configuration and lockfile`
2. `feat: add weather types and Open-Meteo API service`
3. `feat: implement hourly weather forecast UI with list and table views`
4. `test: update unit tests and add documentation`
