const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /pembayaran - Membuat pembayaran untuk layanan bimbingan pra kerja
router.post('/pembayaran', async (req, res) => {
    const { id_konsultasi_karir, jumlah, status } = req.body;

    if (!id_konsultasi_karir || !jumlah) {
        return res.status(400).json({ message: 'Field id_konsultasi_karir dan jumlah harus diisi!' });
    }

    try {
        await db.promise().query(
            `
            INSERT INTO pembayaran (id_konsultasi_karir, jumlah, status) 
            VALUES (?, ?, ?)
            `,
            [id_konsultasi_karir, jumlah, status || 'tertunda']
        );
        res.status(201).json({ message: 'Pembayaran untuk konsultasi bimbingan pra kerja berhasil dibuat' });
    } catch (error) {
        console.error('Error creating pembayaran:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /pembayaran - Mengambil semua pembayaran layanan bimbingan pra kerja
router.get('/pembayaran', async (req, res) => {
    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                p.id,
                p.id_konsultasi_karir,
                p.jumlah,
                p.status,
                p.dibuat_pada
            FROM pembayaran p
            JOIN janji_konsultasi jk ON p.id_konsultasi_karir = jk.id
            `
        );
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching pembayaran:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /pembayaran/{id} - Mengambil detail pembayaran berdasarkan ID
router.get('/pembayaran/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.promise().query(
            `
            SELECT 
                p.id,
                p.id_konsultasi_karir,
                p.jumlah,
                p.status,
                p.dibuat_pada
            FROM pembayaran p
            JOIN janji_konsultasi jk ON p.id_konsultasi_karir = jk.id
            WHERE p.id = ?
            `,
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Pembayaran tidak ditemukan!' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error fetching pembayaran details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /pembayaran/{id} - Memperbarui pembayaran layanan bimbingan pra kerja
router.put('/pembayaran/:id', async (req, res) => {
    const { id } = req.params;
    const { jumlah, status } = req.body;

    if (!jumlah && !status) {
        return res.status(400).json({ message: 'Field jumlah atau status harus disertakan!' });
    }

    try {
        const [result] = await db.promise().query(
            `
            UPDATE pembayaran 
            SET jumlah = COALESCE(?, jumlah), 
                status = COALESCE(?, status)
            WHERE id = ?
            `,
            [jumlah, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pembayaran tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Pembayaran berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating pembayaran:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE /pembayaran/{id} - Menghapus pembayaran layanan bimbingan pra kerja
router.delete('/pembayaran/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.promise().query(
            `
            DELETE FROM pembayaran WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pembayaran tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Pembayaran berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting pembayaran:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
