# Sistem Monitoring Aktivitas Kelas Berbasis Visi Komputer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-00FFFF?style=for-the-badge&logo=yolo&logoColor=black)](https://github.com/ultralytics/ultralytics)

Repositori ini berisi kode untuk Sistem Monitoring Kelas yang dirancang untuk mendeteksi dan mencatat aktivitas siswa secara *real-time* menggunakan deteksi objek. Sistem ini mampu mengidentifikasi berbagai perilaku kunci di dalam kelas dan menyajikannya melalui antarmuka web yang interaktif.

## ✨ Fitur Utama

-   **Deteksi Objek Real-Time**: Menggunakan model **YOLOv8n** yang telah di-*training* ulang untuk mengidentifikasi aktivitas spesifik di kelas.
-   **Logging Berbasis Kejadian**: Sistem secara cerdas mencatat perubahan status atau kejadian yang signifikan.
-   **Filter Durasi**: *Log* hanya akan dicatat jika sebuah kejadian berlangsung selama **5 detik atau lebih**, mengurangi *noise* dari perubahan sesaat.
-   **Penghitung Kejadian (*Counter*)**: Setiap *log* yang tercatat dilengkapi dengan penghitung untuk melacak frekuensi setiap kejadian.
-   **Antarmuka Pengguna Modern**: *Frontend* dibangun menggunakan **ReactJS** untuk visualisasi data yang dinamis dan responsif.
-   **Empat Kelas Deteksi**: Model dilatih untuk mengenali 4 kategori aktivitas utama siswa.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

-   **Model Deteksi**: Custom model yang dilatih menggunakan **YOLOv8n** (`yolov8n.pt` sebagai *pretrained weights*).
-   **Frontend**: [ReactJS](https://reactjs.org/)
-   **Backend**: **[Placeholder]** - *Backend belum ditentukan. Logika saat ini dijalankan di sisi klien atau skrip Python terpisah.*

---

## 🎯 Kelas Deteksi

Model ini dilatih untuk mendeteksi 4 kelas perilaku utama yang relevan dengan lingkungan belajar:

1.  **`gaze`**: Menganalisis arah pandangan atau fokus siswa, apakah memperhatikan guru/papan tulis atau tidak.
2.  **`sitting_position`**: Mendeteksi posisi duduk siswa (misalnya, tegak, membungkuk, atau posisi tidak wajar lainnya).
3.  **`note_taking`**: Mengidentifikasi aktivitas mencatat atau menulis oleh siswa.
4.  **`disruption_events`**: Mengenali kejadian yang berpotensi mengganggu, seperti mengobrol, menggunakan ponsel, atau meninggalkan kursi.

---

## ⚙️ Cara Kerja Logging

Sistem ini dirancang untuk tidak membanjiri *log* dengan perubahan kecil. Sebuah kejadian baru akan dicatat ke dalam sistem *log* jika memenuhi kondisi berikut:

1.  Sistem mendeteksi adanya perubahan status dari aktivitas sebelumnya (misalnya, dari `gaze` fokus menjadi `disruption_event`).
2.  Status baru tersebut **bertahan secara konsisten selama minimal 5 detik**.
3.  Setelah kondisi terpenuhi, sistem akan menyimpan *log* baru dan memperbarui *counter* untuk kejadian tersebut.

Contoh alur *log*:
- `10:05:03` - `note_taking` terdeteksi.
- `10:05:04` - `note_taking` masih terdeteksi.
- `...`
- `10:05:08` - Kondisi 5 detik terpenuhi, **Log dicatat**: `[10:05:08] Event: note_taking, Count: 1`.

---

## 🚀 Instalasi & Penggunaan

Berikut adalah langkah-langkah dasar untuk menjalankan proyek ini.

### Prasyarat

-   Node.js & npm
-   Python 3.8+
-   Pip & Git

### Frontend (ReactJS)

```bash
# 1. Clone repositori
git clone [https://github.com/](https://github.com/)[USERNAME]/[NAMA-REPOSITORI].git

# 2. Masuk ke direktori frontend
cd [NAMA-REPOSITORI]/frontend

# 3. Instal semua dependency
npm install
npm install concurrently

# 4. Jalankan aplikasi React
npm start
