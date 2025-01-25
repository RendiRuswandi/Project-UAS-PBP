const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /konsultasiKesehatan - Membuat janji konsultasi baru
router.post('/konsultasi', async (req, res) => {
    const { id_pengguna, id_dokter, jadwal_konsultasi } = req.body;

    if (!id_pengguna || !id_dokter || !jadwal_konsultasi) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    try {
        await db.promise().query(
            `
            INSERT INTO janji_konsultasi (id_pengguna, id_dokter, jadwal_konsultasi) 
            VALUES (?, ?, ?)
            `,
            [id_pengguna, id_dokter, jadwal_konsultasi]
        );
        res.status(201).json({ message: 'Janji konsultasi berhasil dibuat' });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /konsultasiKesehatan - Mengambil daftar janji konsultasi untuk pengguna tertentu
router.get('/konsultasi', async (req, res) => {
    const { id_pengguna } = req.query; // ID pengguna diambil dari query parameter

    if (!id_pengguna) {
        return res.status(400).json({ message: 'ID pengguna harus disertakan!' });
    }

    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                jk.id,
                jk.id_pengguna,
                p.nama AS nama_pengguna,
                jk.id_dokter,
                d.nama AS nama_dokter,
                jk.jadwal_konsultasi,
                jk.status,
                jk.dibuat_pada
            FROM janji_konsultasi jk
            JOIN pengguna p ON jk.id_pengguna = p.id
            JOIN pengguna d ON jk.id_dokter = d.id
            WHERE jk.id_pengguna = ?
            `,
            [id_pengguna]
        );
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching konsultasiKesehatan:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /konsultasiKesehatan/{id} - Mengambil detail janji konsultasi berdasarkan ID
router.get('/konsultasi/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                jk.id,
                jk.id_pengguna,
                p.nama AS nama_pengguna,
                jk.id_dokter,
                d.nama AS nama_dokter,
                jk.jadwal_konsultasi,
                jk.status,
                jk.dibuat_pada
            FROM janji_konsultasi jk
            JOIN pengguna p ON jk.id_pengguna = p.id
            JOIN pengguna d ON jk.id_dokter = d.id
            WHERE jk.id = ?
            `,
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Janji konsultasi tidak ditemukan!' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error fetching appointment details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /konsultasiKesehatan/{id} - Mengupdate janji konsultasi (misalnya mengubah jadwal)
router.put('/konsultasi/:id', async (req, res) => {
    const { id } = req.params;
    const { jadwal_konsultasi, status } = req.body;

    if (!jadwal_konsultasi && !status) {
        return res.status(400).json({ message: 'Field jadwal_konsultasi atau status harus disertakan!' });
    }

    try {
        const [result] = await db.promise().query(
            `
            UPDATE janji_konsultasi
            SET jadwal_konsultasi = COALESCE(?, jadwal_konsultasi), 
                status = COALESCE(?, status)
            WHERE id = ?
            `,
            [jadwal_konsultasi, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Janji konsultasi tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Janji konsultasi berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE /konsultasiKesehatan/{id} - Menghapus janji konsultasi
router.delete('/konsultasi/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.promise().query(
            `
            DELETE FROM janji_konsultasi WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Janji konsultasi tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Janji konsultasi berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
