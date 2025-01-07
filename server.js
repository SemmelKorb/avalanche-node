const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:7319'
}));
app.use(express.json());

const pool = new Pool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'yttrium',
    port: 5432
});

app.get('/', (req, res) => {
    res.send('Welcome to PaulHackerPage:');
});

app.get('/notes/:offset', async (req, res) => {
    const page = req.params.offset * 25
    console.log()
    try {
        const { rows } = await pool.query('SELECT * FROM notes OFFSET $1 LIMIT 25', [page]);
        res.send(rows);
    } catch (err) {
        console.log(err)
        res.status(500).send('Error fetching notes from database');
    }
});

app.get('/notesPinned', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM notes WHERE isFav = 1')
        res.send(rows);
    } catch (err) {
        res.status(500).send('Error returning favourite notes');
    }
});

app.get('/note/:id', async (req, res) => {
    const noteId = req.params.id;
    try {
        const { rows } = await pool.query('SELECT * FROM notes WHERE id = $1', [noteId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error fetching note from database' });
    }
});

app.put('/note/:id', async (req, res) => {
    const noteId = req.params.id;
    const { title, content } = req.body;

    try {
        const { rowCount } = await pool.query(
            'UPDATE notes SET title = $1, content = $2 WHERE id = $3',
            [title, content, noteId]
        );
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json({ message: 'Note updated successfully' });
    } catch (err) {
        console.error('Error updating note:', err);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.post('/note', async (req, res) => {
    const { title, content, isFav, creationDate } = req.body;

    try {
        const { rows } = await pool.query(
            'INSERT INTO notes (title, content, isFav, creationDate) VALUES ($1, $2, $3, $4) RETURNING id',
            [title, content, isFav, creationDate]
        );
        const id = rows[0].id;
        const creationdate = rows[0].creationDate
        res.status(200).json({ id: id, creationDate: creationdate, message: `Note created with ID: ${id}` });
    } catch (err) {
        console.error('Error inserting note:', err);
        res.status(500).json({ error: 'Error inserting note' });
    }
});

app.delete('/delete/:id', async (req, res) => {
    const noteId = req.params.id;

    try {
        const { rowCount } = await pool.query('DELETE FROM notes WHERE uuid = $1', [noteId]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
