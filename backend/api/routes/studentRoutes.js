const express = require('express');
const router = express.Router();
const db = require('../../config');

// Get all students
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM students');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching students:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get a specific student by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM students WHERE student_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching student by ID:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Add a new student
router.post('/', async (req, res) => {
    const { student_id, name, date_of_birth, email, phone_number, admission_year, department_id } = req.body;

    if (!student_id || !name || !date_of_birth || !email || !phone_number || !admission_year || !department_id) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({ error: 'Phone number must contain only digits' });
    }

    const formattedDateOfBirth = new Date(date_of_birth).toISOString().split('T')[0];

    try {
        const existing = await db.query('SELECT * FROM students WHERE student_id = $1', [student_id]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Student ID already exists.' });
        }

        await db.query(
            `INSERT INTO students (student_id, name, date_of_birth, email, phone_number, admission_year, department_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [student_id, name, formattedDateOfBirth, email, phone_number, admission_year, department_id]
        );

        res.status(201).json({ message: 'Student added successfully', studentId: student_id });
    } catch (error) {
        console.error("Error adding student:", error.message);
        res.status(500).json({ error: "Failed to add student." });
    }
});

// Update a student
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, date_of_birth, email, phone_number, admission_year, department_id } = req.body;

    if (!name || !date_of_birth || !email || !phone_number || !admission_year || !department_id) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({ error: 'Phone number must contain only digits' });
    }

    const formattedDateOfBirth = new Date(date_of_birth).toISOString().split('T')[0];

    try {
        const result = await db.query(
            `UPDATE students 
             SET name = $1, date_of_birth = $2, email = $3, phone_number = $4, admission_year = $5, department_id = $6 
             WHERE student_id = $7`,
            [name, formattedDateOfBirth, email, phone_number, admission_year, department_id, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error("Error updating student:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Delete a student
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM students WHERE student_id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error("Error deleting student:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
