const express = require('express');
const router = express.Router();
const db = require('../../config');

// Get all enrollments
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM enrollments');
        res.json(result.rows); // ✅ returns all rows
    } catch (error) {
        console.error("Error fetching enrollments:", error.message);
        res.status(500).json({ error: 'Error fetching enrollments' });
    }
});

// Get a specific enrollment by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM enrollments WHERE enrollment_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching enrollment by ID:", error.message);
        res.status(500).json({ error: 'Error fetching enrollment by ID' });
    }
});

// Add a new enrollment
router.post('/', async (req, res) => {
    const { enrollment_id, student_id, course_id, enrollment_date, grade } = req.body;

    if (!enrollment_id || !student_id || !course_id || !enrollment_date || !grade) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const result = await db.query(
            `INSERT INTO enrollments (enrollment_id, student_id, course_id, enrollment_date, grade)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [enrollment_id, student_id, course_id, enrollment_date, grade]
        );

        res.status(201).json({
            message: 'Enrollment added successfully',
            enrollment: result.rows[0],
        });
    } catch (error) {
        console.error("Error adding enrollment:", error.message);
        res.status(500).json({ error: 'Failed to add enrollment' });
    }
});

// Update an enrollment
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { student_id, course_id, enrollment_date, grade } = req.body;

    if (!student_id || !course_id || !enrollment_date || !grade) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const result = await db.query(
            `UPDATE enrollments
             SET student_id = $1, course_id = $2, enrollment_date = $3, grade = $4
             WHERE enrollment_id = $5 RETURNING *`,
            [student_id, course_id, enrollment_date, grade, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        res.json({ message: 'Enrollment updated successfully', enrollment: result.rows[0] });
    } catch (error) {
        console.error("Error updating enrollment:", error.message);
        res.status(500).json({ error: 'Failed to update enrollment' });
    }
});

// Delete an enrollment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // First delete enrollments referencing this course
        await db.query('DELETE FROM enrollments WHERE course_id = $1', [id]);

        // Now delete the course itself
        const result = await db.query('DELETE FROM courses WHERE course_id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error("Error deleting course:", error.message);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

module.exports = router;
