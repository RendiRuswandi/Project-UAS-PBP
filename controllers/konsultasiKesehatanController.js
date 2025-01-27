const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /konsultasiKarir - Membuat janji konsultasi bimbingan pra kerja baru
router.post('/karir', async (req, res) => {
    const { id_pelamar, id_mentor, jadwal_konsultasi } = req.body;

    if (!id_pelamar || !id_mentor || !jadwal_konsultasi) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    try {
        await db.promise().query(
            `
            INSERT INTO janji_konsultasi (id_pelamar, id_mentor, jadwal_konsultasi) 
            VALUES (?, ?, ?)
            `,
            [id_pelamar, id_mentor, jadwal_konsultasi]
        );
        res.status(201).json({ message: 'Janji konsultasi bimbingan pra kerja berhasil dibuat' });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /konsultasiKarir - Mengambil daftar janji konsultasi untuk pelamar tertentu
router.get('/karir', async (req, res) => {
    const { id_pelamar } = req.query;

    if (!id_pelamar) {
        return res.status(400).json({ message: 'ID pelamar harus disertakan!' });
    }

    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                jk.id,
                jk.id_pelamar,
                p.nama AS nama_pelamar,
                jk.id_mentor,
                m.nama AS nama_mentor,
                jk.jadwal_konsultasi,
                jk.status,
                jk.dibuat_pada
            FROM janji_konsultasi jk
            JOIN pelamar p ON jk.id_pelamar = p.id
            JOIN mentor m ON jk.id_mentor = m.id
            WHERE jk.id_pelamar = ?
            `,
            [id_pelamar]
        );
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching career consultations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /konsultasiKarir/{id} - Mengambil detail janji konsultasi berdasarkan ID
router.get('/karir/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                jk.id,
                jk.id_pelamar,
                p.nama AS nama_pelamar,
                jk.id_mentor,
                m.nama AS nama_mentor,
                jk.jadwal_konsultasi,
                jk.status,
                jk.dibuat_pada
            FROM janji_konsultasi jk
            JOIN pelamar p ON jk.id_pelamar = p.id
            JOIN mentor m ON jk.id_mentor = m.id
            WHERE jk.id = ?
            `,
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Janji konsultasi tidak ditemukan!' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error fetching consultation details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /konsultasiKarir/{id} - Mengupdate janji konsultasi bimbingan pra kerja
router.put('/karir/:id', async (req, res) => {
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

        res.status(200).json({ message: 'Janji konsultasi bimbingan pra kerja berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating consultation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE /konsultasiKarir/{id} - Menghapus janji konsultasi bimbingan pra kerja
router.delete('/karir/:id', async (req, res) => {
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

        res.status(200).json({ message: 'Janji konsultasi bimbingan pra kerja berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting consultation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
