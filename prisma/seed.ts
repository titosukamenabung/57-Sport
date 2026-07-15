import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🔄 Memulai proses seeding dari Excel asli...');

  // 1. Load File Excel
  const excelPath = path.join(__dirname, 'data_master.xlsx');
  const workbook = XLSX.readFile(excelPath);

  // ==========================================
  // 1. SEED DATA KRITERIA (Sheet: Kriteria_SPK)
  // ==========================================
  if (workbook.SheetNames.includes('Kriteria_SPK')) {
    const sheetKriteria = workbook.Sheets['Kriteria_SPK'];
    const dataKriteria: any[] = XLSX.utils.sheet_to_json(sheetKriteria);

    console.log(`📌 Mengimpor ${dataKriteria.length} Kriteria...`);
    for (const row of dataKriteria) {
      
      // REVISI: Lewati jika baris kosong atau baris total (tidak punya kode atau sifat)
      if (!row.kode || !row.sifat) {
        console.log(`⏭️ Melewati baris non-kriteria / total...`);
        continue;
      }

      const kriteriaExist = await prisma.kriteria.findFirst({
        where: { kode: row.kode }
      });

      if (kriteriaExist) {
        await prisma.kriteria.update({
          where: { id: kriteriaExist.id },
          data: {
            namaKriteria: row.kriteria,
            atribut: row.sifat.toLowerCase(), 
            bobotDefault: parseFloat(row.bobot_kepentingan || 0),
          }
        });
      } else {
        await prisma.kriteria.create({
          data: {
            kode: row.kode,
            namaKriteria: row.kriteria,
            atribut: row.sifat.toLowerCase(),
            bobotDefault: parseFloat(row.bobot_kepentingan || 0),
          },
        });
      }
    }
  }

  // ==========================================
  // 2. SEED DATA MERK & MOTOR (Sheet: Master_Motor)
  // ==========================================
  if (workbook.SheetNames.includes('Master_Motor')) {
    const sheetMotor = workbook.Sheets['Master_Motor'];
    const dataMotor: any[] = XLSX.utils.sheet_to_json(sheetMotor);

    console.log(`📌 Mengimpor ${dataMotor.length} Motor & Merk...`);

    let adminUser = await prisma.user.findFirst();
    if (!adminUser) {
      console.log('⚠️ User tidak ditemukan, membuat user admin default untuk relasi motor...');
      adminUser = await prisma.user.create({
        data: {
          nama: "Admin SPK",
          email: "admin@spk.com",
          password: "adminpassword",
          role: "admin"
        }
      });
    }

    for (const row of dataMotor) {
      // REVISI: Lewati jika baris data motor kosong atau tidak punya nama motor
      if (!row.jenis_motor) continue;

      const namaMerkRaw = row.merk ? String(row.merk).trim() : 'Lainnya';
      
      let merkDb = await prisma.merk.findFirst({
        where: { namaMerk: { equals: namaMerkRaw, mode: 'insensitive' } }
      });

      if (!merkDb) {
        merkDb = await prisma.merk.create({
          data: { namaMerk: namaMerkRaw }
        });
      }

      await prisma.motor.create({
        data: {
          namaMotor: row.jenis_motor,
          tipe: row.jenis_motor || '-', 
          warna: row.warna || '-',
          transmisi: 'Otomatis', 
          deskripsi: row.catatan || 'Tidak ada deskripsi',
          foto: row.foto_url || 'default.jpg',
          status: row.status === 'ready' ? 'tersedia' : 'habis',
          harga: parseFloat(row.harga_estimasi || 0),
          cc: parseInt(row.cc || 0),
          tahunMotor: parseInt(row.tahun || 0),
          efisiensiBbm: parseFloat(row.efisiensi_bbm || 0),
          masaPajakStnk: parseInt(row.masa_pajak_bulan || 0),
          kondisiFisik: parseFloat(row.kondisi_fisik || 0),
          userId: adminUser.id,
          merkId: merkDb.id
        },
      });
    }
  }

  console.log('✅ Seeding data master selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });