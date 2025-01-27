const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',       
  user: 'root',
  password: '',           
  database: 'konsultasi_karir' // Mengubah nama database agar sesuai dengan tema baru
});

connection.connect((err) => {
  if (err) {
    console.error('Kesalahan koneksi ke database: ', err);
    return;
  }
  console.log('Koneksi ke database jasa pencari lowongan pekerjaan dan konsultasi bimbingan pra kerja berhasil!');
});

module.exports = connection;