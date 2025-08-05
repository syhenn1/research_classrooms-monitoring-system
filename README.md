# Sistem Monitoring Aktivitas Kelas Berbasis Visi Komputer

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-00FFFF?style=for-the-badge&logo=yolo&logoColor=black)](https://github.com/ultralytics/ultralytics)

Repositori ini berisi kode untuk Sistem Monitoring Kelas yang dirancang untuk mendeteksi dan mencatat aktivitas siswa secara _real-time_ menggunakan deteksi objek. Sistem ini mampu mengidentifikasi berbagai perilaku kunci di dalam kelas dan menyajikannya melalui antarmuka web yang interaktif.

## ✨ Fitur Utama

- **Deteksi Objek Real-Time**: Menggunakan model **YOLOv8n** yang telah di-_training_ ulang untuk mengidentifikasi aktivitas spesifik di kelas.
- **Logging Berbasis Kejadian**: Sistem secara cerdas mencatat perubahan status atau kejadian yang signifikan.
- **Filter Durasi**: _Log_ hanya akan dicatat jika sebuah kejadian berlangsung selama **5 detik atau lebih**, mengurangi _noise_ dari perubahan sesaat.
- **Penghitung Kejadian (_Counter_)**: Setiap _log_ yang tercatat dilengkapi dengan penghitung untuk melacak frekuensi setiap kejadian.
- **Antarmuka Pengguna Modern**: _Frontend_ dibangun menggunakan **ReactJS** untuk visualisasi data yang dinamis dan responsif.
- **Empat Kelas Deteksi**: Model dilatih untuk mengenali 4 kategori aktivitas utama siswa.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Model Deteksi**: Custom model yang dilatih menggunakan **YOLOv8n** (`yolov8n.pt` sebagai _pretrained weights_).
- **Frontend**: [ReactJS](https://reactjs.org/)
- **Backend**: **[Placeholder]** - _Backend belum ditentukan. Logika saat ini dijalankan di sisi klien atau skrip Python terpisah._

---

## 🎯 Kelas Deteksi

Model ini dilatih untuk mendeteksi 4 kelas perilaku utama yang relevan dengan lingkungan belajar:

1.  **`gaze`**: Menganalisis arah pandangan atau fokus siswa, apakah memperhatikan guru/papan tulis atau tidak.
2.  **`sitting_position`**: Mendeteksi posisi duduk siswa (misalnya, tegak, membungkuk, atau posisi tidak wajar lainnya).
3.  **`note_taking`**: Mengidentifikasi aktivitas mencatat atau menulis oleh siswa.
4.  **`disruption_events`**: Mengenali kejadian yang berpotensi mengganggu, seperti mengobrol, menggunakan ponsel, atau meninggalkan kursi.

---

## ⚙️ Cara Kerja Logging

Sistem ini dirancang untuk tidak membanjiri _log_ dengan perubahan kecil. Sebuah kejadian baru akan dicatat ke dalam sistem _log_ jika memenuhi kondisi berikut:

1.  Sistem mendeteksi adanya perubahan status dari aktivitas sebelumnya (misalnya, dari `gaze` fokus menjadi `disruption_event`).
2.  Status baru tersebut **bertahan secara konsisten selama minimal 5 detik**.
3.  Setelah kondisi terpenuhi, sistem akan menyimpan _log_ baru dan memperbarui _counter_ untuk kejadian tersebut.

Contoh alur _log_:

- `10:05:03` - `note_taking` terdeteksi.
- `10:05:04` - `note_taking` masih terdeteksi.
- `...`
- `10:05:08` - Kondisi 5 detik terpenuhi, **Log dicatat**: `[10:05:08] Event: note_taking, Count: 1`.

---

## 🚀 Instalasi & Penggunaan

Berikut adalah langkah-langkah dasar untuk menjalankan proyek ini.

### Prasyarat

- Node.js & npm
- Python 3.8+
- Pip & Git

### Frontend (ReactJS)

```bash
# 1. Clone repositori
git clone https://github.com/syhenn1/research_classrooms-monitoring-system.git

# 2. Pindah ke direktori FrontEnd
cd frontend

# 3. Instal semua dependency
npm install concurrently react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

```

### Backend (Python & MySQL)

```bash
# 1. Pindah ke direktori BackEnd
cd ../backend

# 2. Buat virtual environment
python -m venv venv

# 3. Aktifkan virtual environment
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# 4. Instal dependency Python (jika tersedia requirements.txt)
pip install -r requirements.txt

```


# Menjalankan Sistem

```bash

# 1. Pindah ke direktori FrontEnd
cd ../frontend

# 2. Jalankan aplikasi React
npm start

```