// Variabel global untuk menyimpan kotak-kotak labirin
window.grid = [];

function generateMaze(imageDataA, ctx, cnv, cell_width) {
    // Fungsi untuk menampilkan pesan di console saja
    function tampilkanPesan(pesan) {
        console.log(pesan);
    }

    // Kelas untuk setiap kotak di labirin
    class Cell {
        constructor(i, j) {
            this.i = i; // posisi kolom
            this.j = j; // posisi baris
            this.walls = [true, true, true, true]; // tembok: atas, kanan, bawah, kiri
            this.highlight = 0; // intensitas highlight (0 = normal)
            this.h_color = { r: 240, g: 255, b: 255 }; // warna
            this.sudahTerhubung = false; // apakah sudah terhubung dengan kotak lain?
            this.sedangDicek = false; // sedang diperiksa sekarang?
            this.grupID = null; // ID grup untuk visualisasi
        }

        show() {
            const x = this.i * w;
            const y = this.j * w;

            let r, g, b;

            // Pewarnaan berdasarkan status kotak
            if (this.sedangDicek) {
                // KUNING: Sedang diperiksa apakah bisa dihubungkan
                r = 255;
                g = 255;
                b = 100;
            } else if (this.highlight > 0) {
                // HIJAU: Berhasil dihubungkan! Tembok dihapus
                r = 100;
                g = 255;
                b = 100;
            } else if (this.sudahTerhubung) {
                // BIRU MUDA: Sudah jadi bagian dari labirin
                r = 200;
                g = 230;
                b = 255;
            } else {
                // PUTIH: Belum dikunjungi
                r = 255;
                g = 255;
                b = 255;
            }

            // Gambar isi kotak
            for (let px = 1; px < w - 1; px++) {
                for (let py = 1; py < w - 1; py++) {
                    gbr_titik(imageDataA, x + px, y + py, r, g, b);
                }
            }

            // Gambar tembok (hitam jika ada, tidak digambar jika sudah dihapus)
            if (this.walls[0]) dda_line(imageDataA, x, y, x + w, y, 0, 0, 0);
            if (this.walls[1])
                dda_line(imageDataA, x + w, y, x + w, y + w, 0, 0, 0);
            if (this.walls[2])
                dda_line(imageDataA, x + w, y + w, x, y + w, 0, 0, 0);
            if (this.walls[3]) dda_line(imageDataA, x, y + w, x, y, 0, 0, 0);
        }
    }

    // Kelas untuk mengecek apakah 2 kotak sudah terhubung atau belum
    // (Disjoint Set / Union-Find)
    class DisjointSet {
        constructor(n) {
            this.parent = Array.from({ length: n }, (_, i) => i);
            this.rank = Array(n).fill(0);
        }

        // Cari induk dari grup ini
        find(x) {
            if (this.parent[x] !== x)
                this.parent[x] = this.find(this.parent[x]);
            return this.parent[x];
        }

        // Gabungkan 2 grup menjadi 1
        // Return true jika berhasil, false jika sudah terhubung
        union(x, y) {
            let rx = this.find(x);
            let ry = this.find(y);
            if (rx === ry) return false; // Sudah dalam grup yang sama
            if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
            else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
            else {
                this.parent[ry] = rx;
                this.rank[rx]++;
            }
            return true;
        }

        // Hitung jumlah grup yang masih terpisah
        hitungGrup() {
            const grupUnik = new Set();
            for (let i = 0; i < this.parent.length; i++) {
                grupUnik.add(this.find(i));
            }
            return grupUnik.size;
        }
    }

    const w = cell_width;
    const cols = 5; // 5 kolom
    const rows = 5; // 5 baris

    window.grid = [];
    const grid = window.grid;

    // Fungsi untuk mendapat index dari posisi (i,j)
    function index(i, j) {
        if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
        return i + j * cols;
    }

    // LANGKAH 1: Buat semua kotak
    tampilkanPesan(
        "╔════════════════════════════════════════════╗",
        "#333",
        true
    );
    tampilkanPesan("║  ALGORITMA KRUSKAL - PEMBUAT LABIRIN  ║", "#333", true);
    tampilkanPesan(
        "╚════════════════════════════════════════════╝",
        "#333",
        true
    );
    tampilkanPesan("");
    tampilkanPesan("=== LANGKAH 1: INISIALISASI ===", "#0066cc", true);
    tampilkanPesan("Membuat kotak-kotak labirin...", "#666");

    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
        }
    }
    tampilkanPesan(
        `✓ Berhasil membuat ${grid.length} kotak (${cols}×${rows})`,
        "#008800"
    );
    tampilkanPesan(`  Setiap kotak dikelilingi 4 tembok`, "#666");
    tampilkanPesan("");

    // LANGKAH 2: Buat daftar semua tembok yang bisa dihapus
    tampilkanPesan("=== LANGKAH 2: DAFTAR TEMBOK ===", "#0066cc", true);
    let walls = [];
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let a = index(i, j);
            if (i < cols - 1) walls.push([a, index(i + 1, j), "V"]); // Tembok vertikal
            if (j < rows - 1) walls.push([a, index(i, j + 1), "H"]); // Tembok horizontal
        }
    }
    tampilkanPesan(
        `✓ Total ada ${walls.length} tembok yang bisa dihapus`,
        "#008800"
    );
    tampilkanPesan(`  (setiap tembok menghubungkan 2 kotak)`, "#666");
    tampilkanPesan("");

    // LANGKAH 3: Acak urutan tembok
    tampilkanPesan("=== LANGKAH 3: PENGACAKAN ===", "#0066cc", true);
    walls.sort(() => Math.random() - 0.5);
    tampilkanPesan("✓ Urutan tembok sudah diacak secara random", "#008800");
    tampilkanPesan("  (ini membuat labirin jadi unik setiap kali)", "#666");
    tampilkanPesan("");

    // Fungsi untuk menghapus tembok antara 2 kotak
    function removeWall(a, b) {
        let dx = a.i - b.i;
        let dy = a.j - b.j;
        if (dx === 1) {
            a.walls[3] = false;
            b.walls[1] = false;
        } else if (dx === -1) {
            a.walls[1] = false;
            b.walls[3] = false;
        }
        if (dy === 1) {
            a.walls[0] = false;
            b.walls[2] = false;
        } else if (dy === -1) {
            a.walls[2] = false;
            b.walls[0] = false;
        }
    }

    // Fungsi untuk menggambar seluruh grid
    function drawGrid() {
        clearCanvas(255, 255, 255);

        // Kurangi highlight secara bertahap (efek fade)
        for (let c of grid) {
            if (c.highlight > 0) {
                c.highlight -= 0.1;
                if (c.highlight <= 0) {
                    c.highlight = 0;
                    c.sudahTerhubung = true;
                }
            }
        }

        // Gambar semua kotak
        for (let c of grid) {
            c.show();
        }
        ctx.putImageData(imageDataA, 0, 0);
    }

    // LANGKAH 4: Mulai algoritma Kruskal
    tampilkanPesan("=== LANGKAH 4: ALGORITMA KRUSKAL ===", "#0066cc", true);
    tampilkanPesan("LEGENDA WARNA:", "#cc6600", true);
    tampilkanPesan("🟨 KUNING = Sedang diperiksa", "#cc6600");
    tampilkanPesan("🟩 HIJAU = Tembok dihapus (berhasil terhubung)", "#cc6600");
    tampilkanPesan("🔷 BIRU = Sudah bagian dari labirin", "#cc6600");
    tampilkanPesan("⬜ PUTIH = Belum dikunjungi", "#cc6600");
    tampilkanPesan("");
    tampilkanPesan("Mulai memeriksa tembok satu per satu...", "#666");
    tampilkanPesan("─────────────────────────────────────", "#ccc");

    const ds = new DisjointSet(grid.length);
    let wallIndex = 0;
    let batchSize = 1;
    let tembok_dihapus = 0;
    let tembok_ditolak = 0;

    function animateKruskal() {
        // Reset status "sedang dicek" untuk semua kotak
        for (let c of grid) {
            c.sedangDicek = false;
        }

        // Proses tembok berikutnya
        for (
            let n = 0;
            n < batchSize && wallIndex < walls.length;
            n++, wallIndex++
        ) {
            const [aIdx, bIdx] = walls[wallIndex];
            const a = grid[aIdx];
            const b = grid[bIdx];

            // Tampilkan info tembok yang sedang diperiksa
            tampilkanPesan(
                `\n📍 Tembok #${wallIndex + 1} dari ${walls.length}:`,
                "#0066cc",
                true
            );
            tampilkanPesan(
                `   Menghubungkan kotak [${a.i},${a.j}] dan [${b.i},${b.j}]`,
                "#666"
            );

            // Tandai kotak yang sedang diperiksa (warna KUNING)
            a.sedangDicek = true;
            b.sedangDicek = true;

            // Cari grup masing-masing
            const grupA = ds.find(aIdx);
            const grupB = ds.find(bIdx);
            tampilkanPesan(
                `   Kotak [${a.i},${a.j}] ada di grup #${grupA}`,
                "#666"
            );
            tampilkanPesan(
                `   Kotak [${b.i},${b.j}] ada di grup #${grupB}`,
                "#666"
            );

            // Cek: apakah kedua kotak ini sudah terhubung?
            if (ds.union(aIdx, bIdx)) {
                // BELUM TERHUBUNG! Hapus tembok dan hubungkan
                removeWall(a, b);
                a.highlight = 1;
                b.highlight = 1;
                a.sedangDicek = false;
                b.sedangDicek = false;
                tembok_dihapus++;

                const grupSekarang = ds.hitungGrup();
                tampilkanPesan(
                    `   ✅ KEPUTUSAN: HAPUS TEMBOK!`,
                    "#008800",
                    true
                );
                tampilkanPesan(
                    `   → Grup #${grupA} dan #${grupB} digabung`,
                    "#008800"
                );
                tampilkanPesan(
                    `   → Jumlah grup terpisah: ${grupSekarang}`,
                    "#008800"
                );
            } else {
                // SUDAH TERHUBUNG! Tidak perlu hapus tembok
                tembok_ditolak++;

                tampilkanPesan(`   ❌ KEPUTUSAN: TOLAK!`, "#cc0000", true);
                tampilkanPesan(
                    `   → Sudah dalam grup yang sama (#${grupA})`,
                    "#cc0000"
                );
                tampilkanPesan(
                    `   → Menghapus tembok ini akan buat jalur melingkar`,
                    "#cc0000"
                );
            }
        }

        drawGrid();

        // Lanjut ke tembok berikutnya
        if (wallIndex < walls.length) {
            setTimeout(() => {
                requestAnimationFrame(animateKruskal);
            }, 400); // Jeda 400ms agar bisa dilihat step-by-step
        } else {
            // SELESAI!
            for (let c of grid) {
                c.sedangDicek = false;
            }

            tampilkanPesan("\n" + "═".repeat(42), "#333");
            tampilkanPesan("🎉 LABIRIN SELESAI DIBUAT! 🎉", "#006600", true);
            tampilkanPesan("═".repeat(42), "#333");
            tampilkanPesan("");
            tampilkanPesan("📊 STATISTIK AKHIR:", "#0066cc", true);
            tampilkanPesan(`   • Total kotak: ${grid.length}`, "#666");
            tampilkanPesan(`   • Tembok diperiksa: ${walls.length}`, "#666");
            tampilkanPesan(
                `   • Tembok dihapus: ${tembok_dihapus} ✓`,
                "#008800"
            );
            tampilkanPesan(
                `   • Tembok ditolak: ${tembok_ditolak} ✗`,
                "#cc0000"
            );
            tampilkanPesan(
                `   • Grup akhir: ${ds.hitungGrup()} (semua terhubung)`,
                "#666"
            );
            tampilkanPesan("");
            tampilkanPesan("💡 FAKTA MENARIK:", "#cc6600", true);
            tampilkanPesan(
                `   • Untuk ${grid.length} kotak, butuh tepat ${tembok_dihapus} tembok dihapus`,
                "#666"
            );
            tampilkanPesan(
                `   • Rumus: n-1 tembok (${grid.length}-1 = ${tembok_dihapus})`,
                "#666"
            );
            tampilkanPesan(`   • Ini adalah Minimum Spanning Tree!`, "#666");

            drawGrid();
        }
    }

    // Mulai!
    drawGrid();
    setTimeout(() => {
        animateKruskal();
    }, 1000); // Jeda 1 detik sebelum mulai
}
