const express = require('express');
const router = express.Router();
const db = require('../../config'); // PostgreSQL Pool

// Get all instructors
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM instructors');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching instructors:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get an instructor by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM instructors WHERE instructor_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching instructor:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Add a new instructor
router.post('/', async (req, res) => {
    const { name, email, phone_number, hire_date, department_id } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO instructors (name, email, phone_number, hire_date, department_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING instructor_id`,
            [name, email, phone_number, hire_date, department_id]
        );
        res.status(201).json({ message: 'Instructor added', instructorId: result.rows[0].instructor_id });
    } catch (error) {
        console.error("Error adding instructor:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Update an instructor
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone_number, hire_date, department_id } = req.body;

    try {
        const result = await db.query(
            `UPDATE instructors SET 
                name = $1, email = $2, phone_number = $3, hire_date = $4, department_id = $5 
             WHERE instructor_id = $6`,
            [name, email, phone_number, hire_date, department_id, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        res.json({ message: 'Instructor updated' });
    } catch (error) {
        console.error("Error updating instructor:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Delete an instructor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM instructors WHERE instructor_id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor deleted' });
    } catch (error) {
        console.error("Error deleting instructor:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
