const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /lowongan - Membuat Lowongan Pekerjaan Baru
router.post('/lowongan', async (req, res) => {
    const { id_perusahaan, deskripsi } = req.body;

    if (!id_perusahaan || !deskripsi) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    try {
        await db.promise().query(
            `
            INSERT INTO lowongan (id_perusahaan, deskripsi) 
            VALUES (?, ?)
            `,
            [id_perusahaan, deskripsi]
        );
        res.status(201).json({ message: 'Lowongan pekerjaan berhasil dibuat' });
    } catch (error) {
        console.error('Error creating job listing:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /lowongan - Mengambil Semua Lowongan Pekerjaan
router.get('/lowongan', async (req, res) => {
    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                lp.id,
                lp.id_perusahaan,
                p.nama AS nama_perusahaan,
                lp.deskripsi,
                lp.dibuat_pada
            FROM lowongan_pekerjaan lp
            JOIN perusahaan p ON lp.id_perusahaan = p.id
            `
        );
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching job listings:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /lowongan/{id} - Mengambil Detail Lowongan Pekerjaan
router.get('/lowongan/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                lp.id,
                lp.id_perusahaan,
                p.nama AS nama_perusahaan,
                lp.deskripsi,
                lp.dibuat_pada
            FROM lowongan_pekerjaan lp
            JOIN perusahaan p ON lp.id_perusahaan = p.id
            WHERE lp.id = ?
            `,
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Lowongan pekerjaan tidak ditemukan!' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /lowongan/{id} - Memperbarui Lowongan Pekerjaan
router.put('/lowongan/:id', async (req, res) => {
    const { id } = req.params;
    const { deskripsi } = req.body;

    if (!deskripsi) {
        return res.status(400).json({ message: 'Field deskripsi harus disertakan!' });
    }

    try {
        const [result] = await db.promise().query(
            `
            UPDATE lowongan
            SET deskripsi = ?
            WHERE id = ?
            `,
            [deskripsi, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Lowongan pekerjaan tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Lowongan pekerjaan berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating job listing:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE /lowongan/{id} - Menghapus Lowongan Pekerjaan
router.delete('/lowongan/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.promise().query(
            `
            DELETE FROM lowongan WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Lowongan pekerjaan tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Lowongan pekerjaan berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting job listing:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
