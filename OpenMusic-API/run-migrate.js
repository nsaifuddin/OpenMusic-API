const dotenv = require('dotenv');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('-------------------------------------------------------------');
console.log('Memulai run-migrate.js...');
console.log('Direktori kerja saat ini (tempat skrip dijalankan - process.cwd()):', process.cwd());
const envPath = path.resolve(process.cwd(), '.env');
console.log('Mencari file .env di path absolut:', envPath);

if (fs.existsSync(envPath)) {
  console.log('STATUS: File .env DITEMUKAN di path tersebut.');
} else {
  console.error('KRITIS: File .env TIDAK DITEMUKAN di path:', envPath);
  console.error('Pastikan file .env ada di direktori utama proyek Anda (sejajar dengan package.json).');
  console.error('-------------------------------------------------------------');
  process.exit(1);
}
console.log('-------------------------------------------------------------');
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.error('-------------------------------------------------------------');
  console.error('KRITIS: Gagal memuat atau mem-parse isi file .env!');
  console.error('Detail Error:', dotenvResult.error);
  console.error('Periksa encoding file (harus UTF-8 tanpa BOM) dan tidak ada karakter aneh.');
  console.error('-------------------------------------------------------------');
  process.exit(1);
}

console.log('-------------------------------------------------------------');
console.log('DEBUGGING VARIABEL LINGKUNGAN YANG DIMUAT OLEH dotenv:');
if (dotenvResult.parsed && Object.keys(dotenvResult.parsed).length > 0) {
  console.log('Variabel yang berhasil di-parse dari .env:', dotenvResult.parsed);
} else {
  console.error('KRITIS: Tidak ada variabel yang berhasil di-parse dari .env!');
  console.error('Ini berarti isi file .env mungkin kosong, semua barisnya adalah komentar, atau formatnya salah.');
  console.error('Pastikan formatnya adalah NAMA_VARIABEL=NILAI dan tidak ada spasi ekstra di sekitar =.');
}
console.log('---');
console.log('Mencoba membaca variabel PG* secara spesifik dari process.env SETELAH dotenv.config():');
console.log('process.env.PGUSER:', process.env.PGUSER);
console.log('process.env.PGHOST:', process.env.PGHOST);
console.log('process.env.PGPASSWORD:', process.env.PGPASSWORD ? '[NILAI PASSWORD ADA]' : process.env.PGPASSWORD);
console.log('process.env.PGDATABASE:', process.env.PGDATABASE);
console.log('process.env.PGPORT:', process.env.PGPORT);
console.log('-------------------------------------------------------------');

if (!process.env.PGUSER || !process.env.PGHOST || !process.env.PGDATABASE || !process.env.PGPORT) {
  console.error('-------------------------------------------------------------');
  console.error('KRITIS: Satu atau lebih variabel PG* (PGUSER, PGHOST, PGDATABASE, PGPORT) masih tidak terdefinisi di process.env!');
  console.error('Ini terjadi SETELAH mencoba memuat dari .env. Periksa kembali isi file .env Anda dengan SANGAT TELITI.');
  console.error('-------------------------------------------------------------');
  process.exit(1);
}

const migrateArgs = process.argv.slice(2).join(' ');
try {
  const nodePgMigratePath = path.join('node_modules', '.bin', 'node-pg-migrate');
  const command = `${nodePgMigratePath} -m ./migrations ${migrateArgs}`;

  console.log(`Menjalankan migrasi: ${command}`);
  execSync(command, { stdio: 'inherit' });
  console.log('Migrasi berhasil dijalankan.');
} catch (_error) {
  console.error('Terjadi kegagalan saat menjalankan migrasi.');
  process.exit(1);
}