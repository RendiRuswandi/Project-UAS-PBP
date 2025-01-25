const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /rekam_medis - Membuat Rekam Medis Baru
router.post('/rekam_medis', async (req, res) => {
    const { id_pengguna, deskripsi } = req.body;

    if (!id_pengguna || !deskripsi) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    try {
        await db.promise().query(
            `
            INSERT INTO rekam_medis (id_pengguna, deskripsi) 
            VALUES (?, ?)
            `,
            [id_pengguna, deskripsi]
        );
        res.status(201).json({ message: 'Rekam medis berhasil dibuat' });
    } catch (error) {
        console.error('Error creating rekam medis:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /rekam_medis - Mengambil Semua Rekam Medis
router.get('/rekam_medis', async (req, res) => {
    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                rm.id,
                rm.id_pengguna,
                p.nama AS nama_pengguna,
                rm.deskripsi,
                rm.dibuat_pada
            FROM rekam_medis rm
            JOIN pengguna p ON rm.id_pengguna = p.id
            `
        );
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching rekam medis:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /rekam_medis/{id} - Mengambil Detail Rekam Medis
router.get('/rekam_medis/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                rm.id,
                rm.id_pengguna,
                p.nama AS nama_pengguna,
                rm.deskripsi,
                rm.dibuat_pada
            FROM rekam_medis rm
            JOIN pengguna p ON rm.id_pengguna = p.id
            WHERE rm.id = ?
            `,
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Rekam medis tidak ditemukan!' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error fetching rekam medis details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /rekam_medis/{id} - Memperbarui Rekam Medis
router.put('/rekam_medis/:id', async (req, res) => {
    const { id } = req.params;
    const { deskripsi } = req.body;

    if (!deskripsi) {
        return res.status(400).json({ message: 'Field deskripsi harus disertakan!' });
    }

    try {
        const [result] = await db.promise().query(
            `
            UPDATE rekam_medis 
            SET deskripsi = ?
            WHERE id = ?
            `,
            [deskripsi, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rekam medis tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Rekam medis berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating rekam medis:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE /rekam_medis/{id} - Menghapus Rekam Medis
router.delete('/rekam_medis/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.promise().query(
            `
            DELETE FROM rekam_medis WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rekam medis tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Rekam medis berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting rekam medis:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
