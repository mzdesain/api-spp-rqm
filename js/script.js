// js/script.

// ==========================================
// SINKRONISASI DROPDOWN LOKASI OTOMATIS (GLOBAL)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Daftar ID elemen dropdown lokasi di semua halaman HTML kamu
    const dropdownLokasi = [
        { id: "filterLokasi", jenis: "filter" },           // Di Dashboard
        { id: "filterLokasiTunggakan", jenis: "filter" },  // Di Tunggakan
        { id: "filterLokasiLaporan", jenis: "filter" },    // Di Laporan
        { id: "lokasiRQM", jenis: "input" },               // Di Tambah Santri
        { id: "lokasiPemasukan", jenis: "input" },         // Di Pemasukan
        { id: "lokasiPengeluaran", jenis: "input" }        // Di Pengeluaran
    ];

    // Cek apakah halaman yang sedang dibuka memiliki minimal satu dropdown lokasi
    let adaDropdownLokasi = dropdownLokasi.some(item => document.getElementById(item.id));
    
    if (adaDropdownLokasi) {
        fetch(`${API_URL}?action=get_lokasi&_nocache=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                let daftarLokasi = data.data; // Array dari database
                
                dropdownLokasi.forEach(item => {
                    let selectEl = document.getElementById(item.id);
                    if (selectEl) {
                        selectEl.innerHTML = ""; // Bersihkan opsi manual bawaan HTML
                        
                        // Jika dropdown ini untuk Filter (Tunggakan/Laporan/Dashboard)
                        if (item.jenis === "filter") {
                            let optSemua = document.createElement("option");
                            optSemua.value = "Semua";
                            optSemua.textContent = "Semua Lokasi";
                            selectEl.appendChild(optSemua);
                        } 
                        // Jika dropdown ini untuk Input (Santri Baru/Keuangan)
                        else {
                            let optKosong = document.createElement("option");
                            optKosong.value = "";
                            optKosong.textContent = "-- Pilih Lokasi --";
                            optKosong.disabled = true;
                            optKosong.selected = true;
                            selectEl.appendChild(optKosong);
                        }

                        // Suntikkan lokasi dari database (termasuk RQM 4 yang baru ditambah)
                        daftarLokasi.forEach(loc => {
                            let opt = document.createElement("option");
                            opt.value = loc.nama_lokasi;
                            opt.textContent = loc.nama_lokasi;
                            selectEl.appendChild(opt);
                        });
                    }
                });
            }
        })
        .catch(err => console.error("Gagal sinkronisasi data lokasi:", err));
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const formOrtu = document.getElementById("formOrtu");
    
    // Mengecek apakah formOrtu ada di halaman ini (menghindari error di halaman admin)
    if (formOrtu) {
        formOrtu.addEventListener("submit", function(e) {
            e.preventDefault(); // Mencegah halaman reload saat form dikirim
            
            const namaSantri = document.getElementById("namaSantri").value;
            const noRegistrasi = document.getElementById("noRegistrasi").value;
            const btnCari = document.getElementById("btnCari");
            const areaRiwayat = document.getElementById("areaRiwayat");
            
            // Ubah teks tombol dan matikan sementara saat proses loading
            btnCari.textContent = "Mencari Data...";
            btnCari.disabled = true;
            
            // Memanggil API Apps Script menggunakan fetch API
            // Pastikan API_URL sudah diset dengan benar di file config.js
            fetch(`${API_URL}?action=get_riwayat_pembayaran&nomor_registrasi=${noRegistrasi}`)
                .then(response => response.json())
                .then(data => {
                    // Kembalikan tombol ke kondisi semula
                    btnCari.textContent = "Cari Data Pembayaran";
                    btnCari.disabled = false;
                    
                    if (data.status === "success") {
                        // Jika berhasil, panggil fungsi untuk menggambar tabel riwayat
                        tampilkanRiwayat(data.data, namaSantri);
                    } else {
                        // Jika terjadi error dari API
                        areaRiwayat.style.display = "block";
                        areaRiwayat.innerHTML = `<div style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 12px; border-radius: 3px; font-size: 14px;">Terjadi kesalahan: ${data.message}</div>`;
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    btnCari.textContent = "Cari Data Pembayaran";
                    btnCari.disabled = false;
                    
                    // Jika gagal koneksi (misal internet putus atau URL salah)
                    areaRiwayat.style.display = "block";
                    areaRiwayat.innerHTML = `<div style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 12px; border-radius: 3px; font-size: 14px;">Gagal terhubung ke server. Pastikan internet lancar dan URL API benar.</div>`;
                });
        });
    }
});

// Fungsi untuk membuat elemen HTML tabel hasil pencarian
function tampilkanRiwayat(dataPembayaran, namaSantri) {
    const areaRiwayat = document.getElementById("areaRiwayat");
    areaRiwayat.style.display = "block";
    
    // Cek jika array data kosong
    if (dataPembayaran.length === 0) {
        areaRiwayat.innerHTML = `<div style="color: #004085; background-color: #cce5ff; border: 1px solid #b8daff; padding: 12px; border-radius: 3px; text-align: center; font-size: 14px;">Belum ada data pembayaran untuk santri atas nama <strong>${namaSantri}</strong>.</div>`;
        return;
    }
    
    // Menyusun tabel riwayat
    let htmlTable = `
        <h3 style="margin-bottom: 12px; font-size: 15px; color: #212529; border-bottom: 2px solid #0056b3; display: inline-block; padding-bottom: 5px;">Hasil Pencarian: ${namaSantri}</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; margin-top: 5px;">
                <thead>
                    <tr style="background-color: #f8f9fa; border-top: 1px solid #dee2e6; border-bottom: 2px solid #dee2e6;">
                        <th style="padding: 10px;">Tanggal</th>
                        <th style="padding: 10px;">Tahun Ajaran</th>
                        <th style="padding: 10px;">Bulan</th>
                        <th style="padding: 10px;">Nominal (Rp)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Melakukan perulangan (loop) untuk setiap data pembayaran yang ditarik
    dataPembayaran.forEach(item => {
        // Mengamankan format tanggal agar tidak muncul 1/1/1970
        let tanggal = item.tanggal_pembayaran;
        
        if (tanggal) {
            let parsedDate = new Date(tanggal);
            // Jika valid dan bukan indikasi error parsing JS (tahun 1970)
            if (!isNaN(parsedDate) && parsedDate.getFullYear() !== 1970) {
                tanggal = parsedDate.toLocaleDateString('id-ID');
            }
        } else {
            tanggal = "-"; // Menampilkan strip jika data tanggal kosong
        }
        
        // Memformat angka menjadi format ribuan standar Indonesia
        let nominal = Number(item.nominal_pembayaran).toLocaleString('id-ID');
        
        htmlTable += `
            <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px;">${tanggal}</td>
                <td style="padding: 10px;">${item.tahun_ajaran}</td>
                <td style="padding: 10px; font-weight: 600;">${item.bulan_pembayaran}</td>
                <td style="padding: 10px;">${nominal}</td>
            </tr>
        `;
    });
    
    htmlTable += `
                </tbody>
            </table>
        </div>
    `;
    
    areaRiwayat.innerHTML = htmlTable;
}

// --- LOGIKA UNTUK DASHBOARD ADMIN ---

document.addEventListener("DOMContentLoaded", function() {
    // Mengecek apakah kita berada di halaman dashboard admin (cek eksistensi id totSantri)
    const totSantriElement = document.getElementById("totSantri");
    
    if (totSantriElement) {
        // Load data awal dengan filter "Semua"
        loadDashboardSummary("Semua");
        
        // Event Listener untuk fitur Filter Lokasi
        const filterLokasi = document.getElementById("filterLokasi");
        if (filterLokasi) {
            filterLokasi.addEventListener("change", function() {
                loadDashboardSummary(this.value);
            });
        }
    }
});

function loadDashboardSummary(lokasi) {
    document.getElementById("totSantri").textContent = "...";
    document.getElementById("totLunas").textContent = "...";
    document.getElementById("totNunggak").textContent = "...";
    document.getElementById("totPemasukan").textContent = "Memuat...";
    if (document.getElementById("totPemasukanLain")) document.getElementById("totPemasukanLain").textContent = "Memuat...";
    if (document.getElementById("totPengeluaran")) document.getElementById("totPengeluaran").textContent = "Memuat...";
    if (document.getElementById("totPemasukanSemua")) document.getElementById("totPemasukanSemua").textContent = "Memuat...";
    if (document.getElementById("totPengeluaranSemua")) document.getElementById("totPengeluaranSemua").textContent = "Memuat...";
    if (document.getElementById("totSaldoSemua")) document.getElementById("totSaldoSemua").textContent = "Memuat..."; // Indikator loading saldo

    fetch(`${API_URL}?action=get_dashboard_summary&lokasi=${lokasi}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                document.getElementById("totSantri").textContent = data.data.total_santri;
                document.getElementById("totLunas").textContent = data.data.total_lunas;
                document.getElementById("totNunggak").textContent = data.data.total_nunggak;
                document.getElementById("totPemasukan").textContent = "Rp " + Number(data.data.total_pemasukan).toLocaleString('id-ID');
                
                if (document.getElementById("totPemasukanLain")) document.getElementById("totPemasukanLain").textContent = "Rp " + Number(data.data.total_pemasukan_lain).toLocaleString('id-ID');
                if (document.getElementById("totPengeluaran")) document.getElementById("totPengeluaran").textContent = "Rp " + Number(data.data.total_pengeluaran).toLocaleString('id-ID');
                if (document.getElementById("totPemasukanSemua")) document.getElementById("totPemasukanSemua").textContent = "Rp " + Number(data.data.total_pemasukan_semua).toLocaleString('id-ID');
                if (document.getElementById("totPengeluaranSemua")) document.getElementById("totPengeluaranSemua").textContent = "Rp " + Number(data.data.total_pengeluaran_semua).toLocaleString('id-ID');
                if (document.getElementById("totSaldoSemua")) document.getElementById("totSaldoSemua").textContent = "Rp " + Number(data.data.total_saldo_semua).toLocaleString('id-ID'); // Render angka saldo
            }
        })
        .catch(error => {
            console.error("Terjadi kesalahan:", error);
            document.getElementById("totPemasukan").textContent = "Gagal memuat";
            if (document.getElementById("totPemasukanLain")) document.getElementById("totPemasukanLain").textContent = "Error";
            if (document.getElementById("totPengeluaran")) document.getElementById("totPengeluaran").textContent = "Error";
            if (document.getElementById("totPemasukanSemua")) document.getElementById("totPemasukanSemua").textContent = "Error";
            if (document.getElementById("totPengeluaranSemua")) document.getElementById("totPengeluaranSemua").textContent = "Error";
            if (document.getElementById("totSaldoSemua")) document.getElementById("totSaldoSemua").textContent = "Error";
        });
}

// --- LOGIKA UNTUK INPUT DATA SANTRI BARU ---

document.addEventListener("DOMContentLoaded", function() {
    const formTambahSantri = document.getElementById("formTambahSantri");
    
    if (formTambahSantri) {
        formTambahSantri.addEventListener("submit", function(e) {
            e.preventDefault(); // Cegah reload halaman
            
            const btnSimpan = document.getElementById("btnSimpanSantri");
            const pesanArea = document.getElementById("pesanSantri");
            
            // Ambil data dari form
            const dataSantri = {
                nomor_registrasi: document.getElementById("regSantri").value,
                nama_santri: document.getElementById("namaSantri").value,
                lokasi_rqm: document.getElementById("lokasiRQM").value,
                tahun_ajaran: document.getElementById("tahunAjaran").value,
                nominal_spp: document.getElementById("nominalSPP").value,
                nomor_whatsapp: document.getElementById("waSantri").value // <-- TAMBAHAN WA
            };
            
            // Tampilan loading
            btnSimpan.textContent = "Menyimpan...";
            btnSimpan.disabled = true;
            pesanArea.style.display = "none";
            
            // Kirim POST request standar
            fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "tambah_santri",
                    data: dataSantri
                })
            })
            .then(response => response.json())
            .then(data => {
                btnSimpan.textContent = "Simpan Data Santri";
                btnSimpan.disabled = false;
                
                pesanArea.style.display = "block";
                if (data.status === "success") {
                    pesanArea.style.backgroundColor = "#d4edda";
                    pesanArea.style.color = "#155724";
                    pesanArea.style.border = "1px solid #c3e6cb";
                    pesanArea.innerHTML = `<strong>Berhasil!</strong> ${data.message}`;
                    formTambahSantri.reset(); // Kosongkan form setelah sukses
                } else {
                    pesanArea.style.backgroundColor = "#f8d7da";
                    pesanArea.style.color = "#721c24";
                    pesanArea.style.border = "1px solid #f5c6cb";
                    pesanArea.innerHTML = `<strong>Gagal:</strong> ${data.message}`;
                }
            })
            .catch(error => {
                console.error("Error:", error);
                btnSimpan.textContent = "Simpan Data Santri";
                btnSimpan.disabled = false;
                
                pesanArea.style.display = "block";
                pesanArea.style.backgroundColor = "#f8d7da";
                pesanArea.style.color = "#721c24";
                pesanArea.style.border = "1px solid #f5c6cb";
                pesanArea.innerHTML = "<strong>Error:</strong> Gagal memproses data.";
            });
        });
    }
});

// --- LOGIKA UNTUK INPUT PEMBAYARAN SPP ---

document.addEventListener("DOMContentLoaded", function() {
    const formTambahPembayaran = document.getElementById("formTambahPembayaran");
    
    if (formTambahPembayaran) {
        // --- TAMBAHAN: Tarik data santri untuk mengisi dropdown ---
        const dropdownReg = document.getElementById("regBayar");
        const cariSantri = document.getElementById("cariSantri");
        let dataSantriAsli = []; // Menyimpan data asli dari server di memori

        if (dropdownReg) {
            // Fungsi untuk menggambar ulang isi dropdown
            function renderDropdownSantri(dataList) {
                dropdownReg.innerHTML = '<option value="" disabled selected>-- Pilih Nama Santri --</option>';
                dataList.forEach(santri => {
                    let option = document.createElement("option");
                    option.value = santri.nomor_registrasi;
                    option.textContent = `${santri.nomor_registrasi} - ${santri.nama_santri}`; 
                    dropdownReg.appendChild(option);
                });
            }

            // Memanggil API
            fetch(`${API_URL}?action=get_data_santri`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        dataSantriAsli = data.data; // Simpan data utuh ke memori
                        renderDropdownSantri(dataSantriAsli); // Tampilkan semua data saat pertama kali dimuat
                    } else {
                        dropdownReg.innerHTML = '<option value="" disabled selected>Gagal memuat data santri</option>';
                    }
                })
                .catch(error => {
                    console.error("Error loading santri:", error);
                    dropdownReg.innerHTML = '<option value="" disabled selected>Error koneksi API</option>';
                });
                
            // Event Listener untuk Fitur Pencarian Langsung (Live Search)
            if (cariSantri) {
                cariSantri.addEventListener("input", function() {
                    let kataKunci = this.value.toLowerCase();
                    
                    // Saring data berdasarkan nama ATAU nomor registrasi
                    let dataTerfilter = dataSantriAsli.filter(santri => 
                        santri.nama_santri.toLowerCase().includes(kataKunci) || 
                        santri.nomor_registrasi.toLowerCase().includes(kataKunci)
                    );
                    
                    // Gambar ulang dropdown dengan data yang sudah disaring
                    renderDropdownSantri(dataTerfilter);
                });
            }
        }
        // --- AKHIR TAMBAHAN ---
        formTambahPembayaran.addEventListener("submit", function(e) {
            e.preventDefault(); 
            
            const btnSimpan = document.getElementById("btnSimpanBayar");
            const pesanArea = document.getElementById("pesanBayar");
            
            // Ambil data dari form
            const dataPembayaran = {
                nomor_registrasi: document.getElementById("regBayar").value,
                tanggal_pembayaran: document.getElementById("tglBayar").value,
                tahun_ajaran: document.getElementById("tahunAjaranBayar").value,
                bulan_pembayaran: document.getElementById("bulanBayar").value,
                nominal_pembayaran: document.getElementById("nominalBayar").value
            };
            
            btnSimpan.textContent = "Menyimpan...";
            btnSimpan.disabled = true;
            pesanArea.style.display = "none";
            
            // Kirim POST request
            fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "tambah_pembayaran",
                    data: dataPembayaran
                })
            })
            .then(response => response.json())
            .then(data => {
                btnSimpan.textContent = "Simpan Pembayaran";
                btnSimpan.disabled = false;
                
                pesanArea.style.display = "block";
                if (data.status === "success") {
                    pesanArea.style.backgroundColor = "#d4edda";
                    pesanArea.style.color = "#155724";
                    pesanArea.style.border = "1px solid #c3e6cb";
                    pesanArea.innerHTML = `<strong>Berhasil!</strong> ${data.message}`;
                    formTambahPembayaran.reset(); 
                } else {
                    pesanArea.style.backgroundColor = "#f8d7da";
                    pesanArea.style.color = "#721c24";
                    pesanArea.style.border = "1px solid #f5c6cb";
                    pesanArea.innerHTML = `<strong>Gagal:</strong> ${data.message}`;
                }
            })
            .catch(error => {
                console.error("Error:", error);
                btnSimpan.textContent = "Simpan Pembayaran";
                btnSimpan.disabled = false;
                
                pesanArea.style.display = "block";
                pesanArea.style.backgroundColor = "#f8d7da";
                pesanArea.style.color = "#721c24";
                pesanArea.style.border = "1px solid #f5c6cb";
                pesanArea.innerHTML = "<strong>Error:</strong> Gagal memproses data.";
            });
        });
    }
});

// --- LOGIKA UNTUK PEMASUKAN DAN PENGELUARAN ---

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Logika Form Pemasukan
    const formTambahPemasukan = document.getElementById("formTambahPemasukan");
    if (formTambahPemasukan) {
        formTambahPemasukan.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const btnSimpan = document.getElementById("btnSimpanPemasukan");
            const pesanArea = document.getElementById("pesanPemasukan");
            
            const dataPemasukan = {
                tanggal_pemasukan: document.getElementById("tglPemasukan").value,
                sumber_pemasukan: document.getElementById("sumberPemasukan").value,
                nominal: document.getElementById("nominalPemasukan").value,
                lokasi_rqm: document.getElementById("lokasiPemasukan").value
            };
            
            btnSimpan.textContent = "Menyimpan...";
            btnSimpan.disabled = true;
            pesanArea.style.display = "none";
            
            fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "tambah_pemasukan",
                    data: dataPemasukan
                })
            })
            .then(response => response.json())
            .then(data => {
                btnSimpan.textContent = "Simpan Pemasukan";
                btnSimpan.disabled = false;
                
                pesanArea.style.display = "block";
                if (data.status === "success") {
                    pesanArea.style.backgroundColor = "#d4edda";
                    pesanArea.style.color = "#155724";
                    pesanArea.style.border = "1px solid #c3e6cb";
                    pesanArea.innerHTML = `<strong>Berhasil!</strong> ${data.message}`;
                    formTambahPemasukan.reset();
                } else {
                    pesanArea.style.backgroundColor = "#f8d7da";
                    pesanArea.style.color = "#721c24";
                    pesanArea.style.border = "1px solid #f5c6cb";
                    pesanArea.innerHTML = `<strong>Gagal:</strong> ${data.message}`;
                }
            })
            .catch(error => {
                btnSimpan.textContent = "Simpan Pemasukan";
                btnSimpan.disabled = false;
                pesanArea.style.display = "block";
                pesanArea.style.backgroundColor = "#f8d7da";
                pesanArea.style.color = "#721c24";
                pesanArea.style.border = "1px solid #f5c6cb";
                pesanArea.innerHTML = "<strong>Error:</strong> Gagal memproses data.";
            });
        });
    }

    // 2. Logika Form Pengeluaran
    const formTambahPengeluaran = document.getElementById("formTambahPengeluaran");
    if (formTambahPengeluaran) {
        formTambahPengeluaran.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const btnSimpan = document.getElementById("btnSimpanPengeluaran");
            const pesanArea = document.getElementById("pesanPengeluaran");
            
            const dataPengeluaran = {
                tanggal_pengeluaran: document.getElementById("tglPengeluaran").value,
                jenis_pengeluaran: document.getElementById("jenisPengeluaran").value,
                nominal: document.getElementById("nominalPengeluaran").value,
                lokasi_rqm: document.getElementById("lokasiPengeluaran").value,
                sumber_dana: document.getElementById("sumberDanaPengeluaran").value, // Tambahan Baru
                keterangan: document.getElementById("keteranganPengeluaran").value
            };
            
            btnSimpan.textContent = "Menyimpan...";
            btnSimpan.disabled = true;
            pesanArea.style.display = "none";
            
            fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "tambah_pengeluaran",
                    data: dataPengeluaran
                })
            })
            .then(response => response.json())
            .then(data => {
                btnSimpan.textContent = "Simpan Pengeluaran";
                btnSimpan.disabled = false;
                
                pesanArea.style.display = "block";
                if (data.status === "success") {
                    pesanArea.style.backgroundColor = "#d4edda";
                    pesanArea.style.color = "#155724";
                    pesanArea.style.border = "1px solid #c3e6cb";
                    pesanArea.innerHTML = `<strong>Berhasil!</strong> ${data.message}`;
                    formTambahPengeluaran.reset();
                } else {
                    pesanArea.style.backgroundColor = "#f8d7da";
                    pesanArea.style.color = "#721c24";
                    pesanArea.style.border = "1px solid #f5c6cb";
                    pesanArea.innerHTML = `<strong>Gagal:</strong> ${data.message}`;
                }
            })
            .catch(error => {
                btnSimpan.textContent = "Simpan Pengeluaran";
                btnSimpan.disabled = false;
                pesanArea.style.display = "block";
                pesanArea.style.backgroundColor = "#f8d7da";
                pesanArea.style.color = "#721c24";
                pesanArea.style.border = "1px solid #f5c6cb";
                pesanArea.innerHTML = "<strong>Error:</strong> Gagal memproses data.";
            });
        });
    }
});

// ==========================================
// FITUR LAPORAN & CETAK
// ==========================================
if (document.getElementById("btnTampilkanLaporan")) {
    document.getElementById("btnTampilkanLaporan").addEventListener("click", function(e) {
        e.preventDefault();
        
        const lokasi = document.getElementById("filterLokasiLaporan").value;
        const bulan = document.getElementById("filterBulanLaporan").value;
        const tbody = document.getElementById("tabelDataLaporan");
        
        // Mode Loading
        tbody.innerHTML = '<tr><td colspan="5" style="border: 1px solid #d2d2d2; padding: 25px; text-align: center; color: #6c757d;">Sedang menarik rekap data dari server, mohon tunggu...</td></tr>';
        document.getElementById("totalPemasukanLaporan").textContent = "Menghitung...";
        document.getElementById("totalPengeluaranLaporan").textContent = "Menghitung...";
        document.getElementById("saldoAkhirLaporan").textContent = "Menghitung...";
        document.getElementById("saldoAkhirLaporan").style.color = "#323130";

        fetch(`${API_URL}?action=get_laporan&lokasi=${lokasi}&bulan=${bulan}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    tbody.innerHTML = "";
                    let totalPemasukan = 0;
                    let totalPengeluaran = 0;

                    if (data.data.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" style="border: 1px solid #d2d2d2; padding: 25px; text-align: center; color: #c00000;">Tidak ada data transaksi untuk bulan ini.</td></tr>';
                    } else {
                        data.data.forEach(item => {
                            totalPemasukan += item.pemasukan;
                            totalPengeluaran += item.pengeluaran;
                            
                            let tgl = new Date(item.tanggal);
                            let tglFormat = !isNaN(tgl) ? tgl.toLocaleDateString('id-ID') : item.tanggal;
                            
                            let tr = document.createElement("tr");
                            tr.innerHTML = `
                                <td style="border: 1px solid #d2d2d2; padding: 10px 12px; color: #323130;">${tglFormat}</td>
                                <td style="border: 1px solid #d2d2d2; padding: 10px 12px; color: #605e5c;">${item.kategori}</td>
                                <td style="border: 1px solid #d2d2d2; padding: 10px 12px; color: #323130; font-weight: 500;">${item.uraian}</td>
                                <td style="border: 1px solid #d2d2d2; padding: 10px 12px; color: #107c41; text-align: right; font-weight: 500;">${item.pemasukan > 0 ? "Rp " + item.pemasukan.toLocaleString('id-ID') : "-"}</td>
                                <td style="border: 1px solid #d2d2d2; padding: 10px 12px; color: #c00000; text-align: right; font-weight: 500;">${item.pengeluaran > 0 ? "Rp " + item.pengeluaran.toLocaleString('id-ID') : "-"}</td>
                            `;
                            tbody.appendChild(tr);
                        });
                    }

                    // Update Kalkulasi Angka Bawah
                    let saldo = totalPemasukan - totalPengeluaran;
                    document.getElementById("totalPemasukanLaporan").textContent = "Rp " + totalPemasukan.toLocaleString('id-ID');
                    document.getElementById("totalPengeluaranLaporan").textContent = "Rp " + totalPengeluaran.toLocaleString('id-ID');
                    document.getElementById("saldoAkhirLaporan").textContent = "Rp " + saldo.toLocaleString('id-ID');
                    
                    // Merah jika minus, Hijau jika surplus
                    if(saldo < 0) {
                        document.getElementById("saldoAkhirLaporan").style.color = "#c00000";
                    } else {
                        document.getElementById("saldoAkhirLaporan").style.color = "#107c41";
                    }
                }
            })
            .catch(error => {
                console.error("Error:", error);
                tbody.innerHTML = '<tr><td colspan="5" style="border: 1px solid #d2d2d2; padding: 25px; text-align: center; color: #c00000;">Terjadi kesalahan sistem saat memuat data.</td></tr>';
            });
    });
}

// ==========================================
// FITUR CETAK / PDF LAPORAN
// ==========================================
if (document.getElementById("btnCetakLaporan")) {
    document.getElementById("btnCetakLaporan").addEventListener("click", function(e) {
        e.preventDefault();
        
        // 1. Ambil teks dari filter yang sedang dipilih untuk dijadikan judul cetak
        let elLokasi = document.getElementById("filterLokasiLaporan");
        let txtLokasi = elLokasi.options[elLokasi.selectedIndex].text;
        
        let elBulan = document.getElementById("filterBulanLaporan");
        let txtBulan = elBulan.options[elBulan.selectedIndex].text;
        
        // 2. Format Tanggal Hari Ini (Untuk TTD)
        const namaBulanArr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        let now = new Date();
        let tglCetak = now.getDate() + " " + namaBulanArr[now.getMonth()] + " " + now.getFullYear();

        // 3. Ambil elemen pembungkus tabel
        let tableContainer = document.querySelector(".content-wrapper > div:nth-child(2)");

        // 4. Buat Elemen Kop Surat (Header Cetak)
        let printHeader = document.createElement("div");
        printHeader.id = "printHeader";
        printHeader.style.display = "none"; // Sembunyikan di layar normal
        printHeader.innerHTML = `
            <div style="display: flex; align-items: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 25px;">
                <!-- Path logo disesuaikan dengan posisi file admin/laporan.html -->
                <img src="../assets/Foto Gedung.jpeg" style="width: 80px; height: auto; margin-right: 20px;">
                <div style="flex: 1; text-align: center;">
                    <h1 style="margin: 0; font-size: 22px; text-transform: uppercase; color: #000;">Laporan Keuangan</h1>
                    <h2 style="margin: 5px 0; font-size: 24px; text-transform: uppercase; color: #000;">Rumah Qur'an Mahir</h2>
                    <p style="margin: 0; font-size: 14px; color: #000;">Lokasi: ${txtLokasi} | Periode: ${txtBulan}</p>
                </div>
                <div style="width: 80px;"></div> <!-- Spacer kosong agar judul tetap pas di tengah -->
            </div>
        `;

        // 5. Buat Elemen Tanda Tangan (Footer Cetak)
        let printFooter = document.createElement("div");
        printFooter.id = "printFooter";
        printFooter.style.display = "none"; // Sembunyikan di layar normal
        printFooter.innerHTML = `
            <div style="margin-top: 50px; display: flex; justify-content: flex-end; color: #000;">
                <div style="text-align: center; width: 250px;">
                    <p style="margin: 0 0 70px 0; font-size: 14px;">......................., ${tglCetak}<br>Bendahara Rumah Qur'an Mahir,</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold; text-decoration: underline;">( .................................... )</p>
                </div>
            </div>
        `;

        // 6. Masukkan elemen ke dalam HTML
        tableContainer.insertBefore(printHeader, tableContainer.firstChild); // Pasang di atas tabel
        tableContainer.appendChild(printFooter); // Pasang di bawah tabel
        
        // 7. Buat elemen style khusus untuk mode cetak
        let printStyle = document.createElement('style');
        printStyle.innerHTML = `
            @media print {
                body { background-color: white !important; margin: 0; padding: 0; }
                
                /* Sembunyikan sidebar, topbar, dan kotak filter */
                .sidebar, .topbar { display: none !important; }
                .content-wrapper > div:nth-child(1) { display: none !important; }
                
                /* Rapikan posisi tabel ke tengah layar kertas */
                .main-content { margin-left: 0 !important; }
                .content-wrapper { padding: 0 !important; }
                .content-wrapper > div:nth-child(2) { border: none !important; padding: 0 !important; }
                
                /* Munculkan Kop Surat dan TTD HANYA saat dicetak */
                #printHeader, #printFooter { display: block !important; }
                
                /* Hitamkan semua teks tabel untuk cetak tinta */
                table th, table td { color: #000 !important; }
            }
        `;
        document.head.appendChild(printStyle);
        
        // 8. Panggil jendela cetak bawaan browser
        window.print();
        
        // 9. Bersihkan semua elemen cetakan sesaat setelah jendela print ditutup
        setTimeout(() => {
            document.head.removeChild(printStyle);
            tableContainer.removeChild(printHeader);
            tableContainer.removeChild(printFooter);
        }, 1000);
    });
}

// ==========================================
// FITUR KELOLA DATA ADMIN
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Jalankan fungsi muat data admin jika berada di halaman data_admin.html
    if (document.getElementById("tabelDataAdmin")) {
        loadDataAdmin();
    }
});

function loadDataAdmin() {
    const tbody = document.getElementById("tabelDataAdmin");
    // Teks Loading awal
    tbody.innerHTML = '<tr><td colspan="4" style="border: 1px solid #d2d2d2; padding: 20px; text-align: center; color: #605e5c;">Memuat daftar admin...</td></tr>';

    fetch(`${API_URL}?action=get_admin`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                tbody.innerHTML = "";
                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="border: 1px solid #d2d2d2; padding: 20px; text-align: center; color: #605e5c;">Belum ada data admin.</td></tr>';
                } else {
                    data.data.forEach((item, index) => {
                        let tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td style="border: 1px solid #d2d2d2; padding: 10px 12px; text-align: center; color: #323130;">${index + 1}</td>
                            <td style="border: 1px solid #d2d2d2; padding: 10px 12px; color: #323130; font-weight: 500;">${item.nama}</td>
                            <td style="border: 1px solid #d2d2d2; padding: 10px 12px; color: #605e5c;">${item.username}</td>
                            <td style="border: 1px solid #d2d2d2; padding: 10px 12px; text-align: center;">
                                <!-- TOMBOL HAPUS YANG BENAR ADA DI SINI -->
                                <button onclick="hapusAdmin('${item.username}')" style="background-color: #c00000; color: white; border: none; padding: 5px 10px; border-radius: 2px; cursor: pointer; font-size: 12px;">Hapus</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }
        })
        .catch(error => {
            console.error("Error:", error);
            tbody.innerHTML = '<tr><td colspan="4" style="border: 1px solid #d2d2d2; padding: 20px; text-align: center; color: #c00000;">Gagal memuat data.</td></tr>';
        });
}

// Form Tambah Admin
if (document.getElementById("formTambahAdmin")) {
    document.getElementById("formTambahAdmin").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const btn = document.getElementById("btnSimpanAdmin");
        const pesan = document.getElementById("pesanAdmin");
        
        btn.textContent = "Menyimpan...";
        btn.disabled = true;
        
        let formData = {
            action: "tambah_admin", // <-- Tambahkan baris ini
            nama: document.getElementById("namaAdmin").value,
            username: document.getElementById("usernameAdmin").value,
            password: document.getElementById("passwordAdmin").value
        };

        fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            pesan.style.display = "block";
            if (data.status === "success") {
                pesan.style.backgroundColor = "#e6f2eb";
                pesan.style.color = "#107c41";
                pesan.style.borderColor = "#107c41";
                pesan.textContent = data.message;
                
                document.getElementById("formTambahAdmin").reset();
                loadDataAdmin(); // Muat ulang tabel
            } else {
                pesan.style.backgroundColor = "#fde7e7";
                pesan.style.color = "#c00000";
                pesan.style.borderColor = "#c00000";
                pesan.textContent = "Gagal: " + data.message;
            }
            btn.textContent = "Simpan Admin";
            btn.disabled = false;
        })
        .catch(error => {
            console.error("Error:", error);
            pesan.style.display = "block";
            pesan.style.backgroundColor = "#fde7e7";
            pesan.style.color = "#c00000";
            pesan.textContent = "Terjadi kesalahan koneksi sistem.";
            btn.textContent = "Simpan Admin";
            btn.disabled = false;
        });
    });
}

// ==========================================
// FITUR LOGIN ADMIN
// ==========================================
if (document.getElementById("formLoginAdmin")) {
    document.getElementById("formLoginAdmin").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const btn = document.getElementById("btnLogin");
        const pesan = document.getElementById("pesanLogin");
        
        btn.textContent = "Memeriksa...";
        btn.disabled = true;
        
        // Data yang dikirim ke backend
        let formData = {
            action: "login",
            username: document.getElementById("loginUsername").value,
            password: document.getElementById("loginPassword").value
        };

        fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            pesan.style.display = "block";
            if (data.status === "success") {
                pesan.style.backgroundColor = "#e6f2eb";
                pesan.style.color = "#107c41";
                pesan.style.border = "1px solid #107c41";
                pesan.textContent = "Berhasil! Mengalihkan ke panel...";
                
                // Simpan nama admin di penyimpanan lokal browser
                localStorage.setItem("adminRQM_nama", data.nama);
                localStorage.setItem("adminRQM_isLogin", "true");
                
                // Arahkan ke dashboard admin
                setTimeout(() => {
                    window.location.href = "admin/index.html";
                }, 1000);
            } else {
                pesan.style.backgroundColor = "#fde7e7";
                pesan.style.color = "#c00000";
                pesan.style.border = "1px solid #c00000";
                pesan.textContent = data.message;
                btn.textContent = "Masuk ke Panel Admin";
                btn.disabled = false;
            }
        })
        .catch(error => {
            pesan.style.display = "block";
            pesan.style.backgroundColor = "#fde7e7";
            pesan.style.color = "#c00000";
            pesan.textContent = "Gagal terhubung ke server.";
            btn.textContent = "Masuk ke Panel Admin";
            btn.disabled = false;
        });
    });
}

// ==========================================
// CEK SESI LOGIN & TAMPILKAN NAMA ADMIN
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Cari elemen teks nama di pojok kanan atas (di dalam class user-info)
    let userInfoName = document.querySelector(".user-info strong");
    
    // Jika elemennya ada (artinya kita sedang berada di halaman panel Admin)
    if (userInfoName) {
        let isLogin = localStorage.getItem("adminRQM_isLogin");
        let namaAdmin = localStorage.getItem("adminRQM_nama");

        // Cek apakah user sudah login dengan benar
        if (isLogin === "true") {
            // Atasi masalah "undefined" jika terlanjur tersimpan di memori browser
            if (namaAdmin && namaAdmin !== "undefined" && namaAdmin !== "null") {
                userInfoName.textContent = namaAdmin;
            } else {
                userInfoName.textContent = "Admin"; // Nama default jika gagal ditarik
            }
        } else {
            // JIKA BELUM LOGIN: Tendang kembali ke halaman login!
            alert("Akses Ditolak! Anda harus login terlebih dahulu.");
            window.location.href = "../login.html";
        }
    }
});


// ==========================================
// FITUR LOGOUT (KELUAR) DENGAN POP-UP EXCEL
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Cari tombol "Keluar" di sidebar (mendukung class .logout-btn atau .text-danger)
    let logoutBtns = document.querySelectorAll(".logout-btn, .text-danger");
    
    logoutBtns.forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.preventDefault(); // Cegah pindah halaman langsung
            
            // 1. Buat elemen latar belakang gelap (Overlay)
            let modalOverlay = document.createElement("div");
            modalOverlay.id = "customLogoutModal";
            modalOverlay.style.position = "fixed";
            modalOverlay.style.top = "0";
            modalOverlay.style.left = "0";
            modalOverlay.style.width = "100%";
            modalOverlay.style.height = "100%";
            modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
            modalOverlay.style.display = "flex";
            modalOverlay.style.justifyContent = "center";
            modalOverlay.style.alignItems = "center";
            modalOverlay.style.zIndex = "9999";

            // 2. Buat elemen kotak dialog ala Excel
            let modalBox = document.createElement("div");
            modalBox.style.backgroundColor = "#fff";
            modalBox.style.width = "350px";
            modalBox.style.border = "1px solid #d2d2d2";
            modalBox.style.borderTop = "4px solid #107c41"; // Garis hijau Excel di atas
            modalBox.style.borderRadius = "2px";
            modalBox.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            modalBox.style.padding = "25px";
            modalBox.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            
            // 3. Isi kotak dialog dengan teks dan tombol
            modalBox.innerHTML = `
                <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: 600; color: #323130;">Konfirmasi Keluar</h3>
                <p style="margin-bottom: 25px; font-size: 14px; color: #605e5c;">Apakah Anda yakin ingin keluar dari Panel Admin?</p>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="btnBatalLogout" style="background-color: #fff; color: #323130; border: 1px solid #8a8886; padding: 8px 15px; border-radius: 2px; font-size: 13px; font-weight: 600; cursor: pointer; outline: none;">Batal</button>
                    <button id="btnYaLogout" style="background-color: #c00000; color: #fff; border: 1px solid #c00000; padding: 8px 15px; border-radius: 2px; font-size: 13px; font-weight: 600; cursor: pointer; outline: none;">Ya, Keluar</button>
                </div>
            `;
            
            // Masukkan kotak ke dalam overlay, dan tampilkan di layar
            modalOverlay.appendChild(modalBox);
            document.body.appendChild(modalOverlay);

            // 4. Aksi jika tombol BATAL diklik
            document.getElementById("btnBatalLogout").addEventListener("click", function() {
                document.body.removeChild(modalOverlay); // Tutup pop-up
            });

            // 5. Aksi jika tombol YA, KELUAR diklik
            document.getElementById("btnYaLogout").addEventListener("click", function() {
                // Hapus data sesi dari memori browser
                localStorage.removeItem("adminRQM_isLogin");
                localStorage.removeItem("adminRQM_nama");
                
                // Arahkan kembali ke halaman utama
                window.location.href = "../index.html";
            });
        });
    });
});

// ==========================================
// FITUR HAPUS ADMIN & SANTRI
// ==========================================
window.hapusAdmin = function(username) {
    if(confirm("Yakin ingin menghapus admin " + username + "?")) {
        fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "hapus_admin", username: username }) })
        .then(res => res.json()).then(data => {
            alert(data.message); if(data.status === "success") loadDataAdmin();
        }).catch(err => alert("Error koneksi"));
    }
}

window.hapusSantri = function(noReg) {
    if(confirm("Yakin ingin menghapus data santri dengan No. Reg " + noReg + "?")) {
        fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "hapus_santri", nomor_registrasi: noReg }) })
        .then(res => res.json()).then(data => {
            alert(data.message); if(data.status === "success") loadTabelSantri();
        }).catch(err => alert("Error koneksi"));
    }
}

// ==========================================
// TAMPILKAN TABEL SANTRI
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("tabelDataSantri")) loadTabelSantri();
});

function loadTabelSantri() {
    let tbody = document.getElementById("tabelDataSantri");
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Memuat data...</td></tr>";
    fetch(`${API_URL}?action=get_data_santri`)
    .then(res => res.json()).then(data => {
        if(data.status === "success") {
            tbody.innerHTML = "";
            data.data.forEach(item => {
                let nominal = Number(item.nominal).toLocaleString('id-ID');
                tbody.innerHTML += `<tr>
                    <td>${item.nomor_registrasi}</td><td>${item.nama_santri}</td>
                    <td>${item.lokasi}</td><td>Rp ${nominal}</td><td>${item.nomor_whatsapp}</td>
                    <td style="text-align: center;"><button onclick="hapusSantri('${item.nomor_registrasi}')" style="background-color: #c00000; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 2px;">Hapus</button></td>
                </tr>`;
            });
        }
    });
}

// ==========================================
// OTOMATISASI DROPDOWN TAHUN AJARAN TUNGGAKAN
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    let selectTahun = document.getElementById("filterTahunTunggakan");
    if (selectTahun) {
        selectTahun.innerHTML = ""; // Bersihkan opsi manual di HTML
        let thnSekarang = new Date().getFullYear();
        let blnSekarang = new Date().getMonth() + 1;
        // Jika sudah masuk Juli, berarti masuk tahun ajaran baru
        let thnMulai = (blnSekarang >= 7) ? thnSekarang : thnSekarang - 1;

        // Buat rentang tahun (1 tahun lalu sampai 2 tahun ke depan)
        for (let i = -1; i <= 2; i++) {
            let teksTahun = `${thnMulai + i}/${thnMulai + i + 1}`;
            let opt = document.createElement("option");
            opt.value = teksTahun;
            opt.textContent = teksTahun;
            if (i === 0) opt.selected = true; // Otomatis pilih tahun berjalan
            selectTahun.appendChild(opt);
        }
    }
});

// ==========================================
// FITUR TUNGGAKAN & WHATSAPP
// ==========================================
if (document.getElementById("btnCekTunggakan")) {
    document.getElementById("btnCekTunggakan").addEventListener("click", function() {
        let tbody = document.getElementById("tabelTunggakan");
        let tfoot = document.getElementById("rekapTunggakan");
        let elJml = document.getElementById("jmlSantriNunggak");
        let elTotal = document.getElementById("totalNominalNunggak");
        let btnCetak = document.getElementById("btnCetakTunggakan"); // Variabel untuk tombol cetak
        
        try {
            let lokasi = document.getElementById("filterLokasiTunggakan").value;
            let tahun = document.getElementById("filterTahunTunggakan").value;
            let bulan = document.getElementById("filterBulanTunggakan").value;
            
            if(tfoot) tfoot.style.display = "none";
            if(btnCetak) btnCetak.style.display = "none"; // Sembunyikan tombol saat mulai mencari
            
            tbody.innerHTML = "<tr><td colspan='5' style='padding: 25px; text-align:center; border: 1px solid #d2d2d2;'>Mencari data tunggakan...</td></tr>";
            
            let urlAman = `${API_URL}?action=get_tunggakan&lokasi=${encodeURIComponent(lokasi)}&bulan=${encodeURIComponent(bulan)}&tahun_ajaran=${encodeURIComponent(tahun)}&_nocache=${new Date().getTime()}`;
            
            fetch(urlAman)
            .then(res => res.json())
            .then(data => {
                if(data.status === "success") {
                    if(btnCetak) btnCetak.style.display = "inline-block"; // MUNCULKAN TOMBOL CETAK DI SINI
                    
                    tbody.innerHTML = ""; // Menghapus teks pencarian secara bersih
                    let totalNominal = 0;
                    let jmlSantri = data.data.length;

                    if(jmlSantri === 0) {
                        tbody.innerHTML = "<tr><td colspan='5' style='padding: 25px; text-align:center; color:#107c41; font-weight:bold; border: 1px solid #d2d2d2;'>Alhamdulillah, tidak ada tunggakan untuk filter ini.</td></tr>";
                    } else {
                        data.data.forEach(item => {
                            let nominalAngka = Number(item.nominal) || 0;
                            totalNominal += nominalAngka; 
                            let nominalStr = nominalAngka.toLocaleString('id-ID');
                            
                            let waMentah = item.nomor_whatsapp ? String(item.nomor_whatsapp) : "";
                            let noWA = waMentah.replace(/\D/g, "");
                            if(noWA.startsWith("0")) noWA = "62" + noWA.substring(1);
                            
                            let pesan = `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSemoga Ayah/Bunda senantiasa dalam lindungan Allah SWT. Kami dari pengurus Rumah Qur'an Mahir (RQM) memohon maaf mengganggu waktunya.\n\nKami menginformasikan bahwa untuk SPP ananda *${item.nama_santri}* pada bulan *${bulan}* senilai *Rp ${nominalStr}* saat ini belum tercatat pada sistem kami.\n\nMohon perkenan Ayah/Bunda untuk mengecek kembali. Apabila sudah melakukan pembayaran, mohon konfirmasinya agar dapat segera kami catat. Apabila belum, mohon kiranya dapat segera ditunaikan.\n\nSyukron wajazaakumullahu khairan.\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`;
                            
                            let linkWA = noWA ? `<a href="https://wa.me/${noWA}?text=${encodeURIComponent(pesan)}" target="_blank" style="background-color: #25D366; color: white; padding: 5px 10px; text-decoration: none; border-radius: 2px; font-weight: 600;">Tagih via WA</a>` : `<span style="color:#c00000; font-size:12px;">WA Kosong</span>`;

                            tbody.innerHTML += `<tr>
                                <td style="padding: 10px 12px; border: 1px solid #d2d2d2;">${item.nomor_registrasi}</td>
                                <td style="padding: 10px 12px; border: 1px solid #d2d2d2;">${item.nama_santri}</td>
                                <td style="padding: 10px 12px; border: 1px solid #d2d2d2;">${item.lokasi}</td>
                                <td style="padding: 10px 12px; border: 1px solid #d2d2d2;">Rp ${nominalStr}</td>
                                <td style="padding: 10px 12px; border: 1px solid #d2d2d2; text-align: center;">${linkWA}</td>
                            </tr>`;
                        });

                        if(tfoot) {
                            tfoot.style.display = "table-footer-group";
                            elJml.textContent = `${jmlSantri} SANTRI`;
                            elTotal.textContent = `RP ${totalNominal.toLocaleString('id-ID')}`;
                        }
                    }
                } else {
                    tbody.innerHTML = `<tr><td colspan='5' style='padding: 25px; text-align:center; color:#c00000; border: 1px solid #d2d2d2;'>Gagal: ${data.message}</td></tr>`;
                }
            })
            .catch(error => {
                tbody.innerHTML = `<tr><td colspan='5' style='padding: 25px; text-align:center; color:#c00000; border: 1px solid #d2d2d2;'>Gagal terhubung ke server. Pastikan URL di config.js benar.</td></tr>`;
            });
            
        } catch (errLokal) {
            tbody.innerHTML = `<tr><td colspan='5' style='padding: 25px; text-align:center; color:#c00000; border: 1px solid #d2d2d2;'>Error Sistem: ${errLokal.message}</td></tr>`;
        }
    });
}

// ==========================================
// FITUR CETAK / PDF DATA TUNGGAKAN
// ==========================================
if (document.getElementById("btnCetakTunggakan")) {
    document.getElementById("btnCetakTunggakan").addEventListener("click", function(e) {
        e.preventDefault();

        // 1. Ambil data teks filter
        let elLokasi = document.getElementById("filterLokasiTunggakan");
        let txtLokasi = elLokasi.options[elLokasi.selectedIndex].text;
        let txtTahun = document.getElementById("filterTahunTunggakan").value;
        let elBulan = document.getElementById("filterBulanTunggakan");
        let txtBulan = elBulan.options[elBulan.selectedIndex].text;

        let tableContainer = document.querySelector(".content-wrapper > div");

        // 2. Buat Kop Surat
        let printHeader = document.createElement("div");
        printHeader.id = "printHeaderTunggakan";
        printHeader.style.display = "none";
        printHeader.innerHTML = `
            <div style="display: flex; align-items: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 25px;">
                <img src="../assets/Foto Gedung.jpeg" style="width: 80px; height: auto; margin-right: 20px;">
                <div style="flex: 1; text-align: center;">
                    <h1 style="margin: 0; font-size: 22px; text-transform: uppercase; color: #000;">Laporan Tunggakan SPP</h1>
                    <h2 style="margin: 5px 0; font-size: 24px; text-transform: uppercase; color: #000;">Rumah Qur'an Mahir</h2>
                    <p style="margin: 0; font-size: 14px; color: #000;">Lokasi: ${txtLokasi} | Tahun Ajaran: ${txtTahun} | Bulan: ${txtBulan}</p>
                </div>
                <div style="width: 80px;"></div>
            </div>
        `;

        // 3. Buat Tanda Tangan Bawah
        const namaBulanArr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        let now = new Date();
        let tglCetak = now.getDate() + " " + namaBulanArr[now.getMonth()] + " " + now.getFullYear();

        let printFooter = document.createElement("div");
        printFooter.id = "printFooterTunggakan";
        printFooter.style.display = "none";
        printFooter.innerHTML = `
            <div style="margin-top: 50px; display: flex; justify-content: flex-end; color: #000;">
                <div style="text-align: center; width: 250px;">
                    <p style="margin: 0 0 70px 0; font-size: 14px;">......................., ${tglCetak}<br>Bendahara,</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold; text-decoration: underline;">( .................................... )</p>
                </div>
            </div>
        `;

        tableContainer.insertBefore(printHeader, tableContainer.firstChild);
        tableContainer.appendChild(printFooter);

        // 4. Modifikasi Tabel Sementara (Hilangkan Kolom WA agar PDF rapi)
        let tfootTh1 = document.querySelector("#rekapTunggakan th:nth-child(1)");
        if (tfootTh1) tfootTh1.setAttribute("colspan", "2"); 

        let printStyle = document.createElement('style');
        printStyle.innerHTML = `
            @media print {
                body { background-color: white !important; margin: 0; padding: 0; }
                .sidebar, .topbar, .user-info { display: none !important; }
                .content-wrapper > div > div:first-child { display: none !important; } /* Sembunyikan Filter */
                table th:last-child, table td:last-child { display: none !important; } /* Sembunyikan Kolom WA */
                .main-content { margin-left: 0 !important; }
                .content-wrapper { padding: 0 !important; }
                .content-wrapper > div { border: none !important; padding: 0 !important; box-shadow: none !important; }
                #printHeaderTunggakan, #printFooterTunggakan { display: block !important; }
                table th, table td { color: #000 !important; }
                #rekapTunggakan { display: table-footer-group !important; }
            }
        `;
        document.head.appendChild(printStyle);

        window.print();

        // 5. Kembalikan bentuk tabel seperti semula setelah cetak
        setTimeout(() => {
            document.head.removeChild(printStyle);
            tableContainer.removeChild(printHeader);
            tableContainer.removeChild(printFooter);
            if (tfootTh1) tfootTh1.setAttribute("colspan", "3");
        }, 1000);
    });
}

// ==========================================
// FITUR KELOLA LOKASI RQM
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("tabelDataLokasi")) {
        loadDataLokasi();
    }

    const formTambahLokasi = document.getElementById("formTambahLokasi");
    if (formTambahLokasi) {
        formTambahLokasi.addEventListener("submit", function(e) {
            e.preventDefault();

            const btn = document.getElementById("btnSimpanLokasi");
            const pesan = document.getElementById("pesanLokasi");
            const namaLokasiVal = document.getElementById("namaLokasi").value.trim();

            btn.textContent = "Menyimpan...";
            btn.disabled = true;

            fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "tambah_lokasi",
                    nama_lokasi: namaLokasiVal
                })
            })
            .then(res => res.json())
            .then(data => {
                pesan.style.display = "block";
                if (data.status === "success") {
                    pesan.style.backgroundColor = "#e6f2eb";
                    pesan.style.color = "#107c41";
                    pesan.style.border = "1px solid #107c41";
                    pesan.textContent = data.message;
                    formTambahLokasi.reset();
                    loadDataLokasi();
                } else {
                    pesan.style.backgroundColor = "#fde7e7";
                    pesan.style.color = "#c00000";
                    pesan.style.border = "1px solid #c00000";
                    pesan.textContent = "Gagal: " + data.message;
                }
                btn.textContent = "Simpan Lokasi";
                btn.disabled = false;
            })
            .catch(err => {
                pesan.style.display = "block";
                pesan.style.backgroundColor = "#fde7e7";
                pesan.style.color = "#c00000";
                pesan.textContent = "Gagal terhubung ke server.";
                btn.textContent = "Simpan Lokasi";
                btn.disabled = false;
            });
        });
    }
});

function loadDataLokasi() {
    const tbody = document.getElementById("tabelDataLokasi");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 15px; border: 1px solid #d2d2d2; color: #605e5c;">Memuat data lokasi...</td></tr>';

    fetch(`${API_URL}?action=get_lokasi&_nocache=${new Date().getTime()}`)
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            tbody.innerHTML = "";
            if (data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 15px; border: 1px solid #d2d2d2; color: #605e5c;">Belum ada data lokasi.</td></tr>';
            } else {
                data.data.forEach((item, index) => {
                    let tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td style="border: 1px solid #d2d2d2; padding: 8px 10px; text-align: center;">${index + 1}</td>
                        <td style="border: 1px solid #d2d2d2; padding: 8px 10px; font-weight: 500;">${item.nama_lokasi}</td>
                        <td style="border: 1px solid #d2d2d2; padding: 8px 10px; text-align: center;">
                            <button onclick="hapusLokasi('${item.nama_lokasi}')" style="background-color: #c00000; color: white; border: none; padding: 4px 8px; border-radius: 2px; cursor: pointer; font-size: 12px;">Hapus</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    })
    .catch(err => {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 15px; border: 1px solid #d2d2d2; color: #c00000;">Gagal memuat data lokasi.</td></tr>';
    });
}

window.hapusLokasi = function(namaLokasi) {
    if (confirm(`Yakin ingin menghapus lokasi "${namaLokasi}"?`)) {
        fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "hapus_lokasi", nama_lokasi: namaLokasi })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.status === "success") loadDataLokasi();
        })
        .catch(err => alert("Error koneksi saat menghapus lokasi"));
    }
};