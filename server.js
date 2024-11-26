const express = require('express')
const cors = require('cors');
const app = express()
const port = 3000
const mysql = require("mysql2");

app.use(cors({
    origin: 'http://localhost:7319  '
}));
app.use(express.json());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MySQL",
    database: "notes_db",
});

app.get('/', (req, res) => {
    res.send('Welcome to PaulHackerPage:')
})

app.get('/notes', async (req, res) => {

    connection.connect(function (err) {
        if (err) res.send("")
        connection.query(`
      SELECT 
        *
      FROM 
        notes
    `, function (err, results) {
            if (err) res.send()
            res.send(results)
        }
        );
    })

});


app.get('/notes/:id', (req, res) => {
    const noteId = req.params.id;
    console.log(noteId)
    connection.query(
        `SELECT * FROM notes WHERE uuid = ?`,
        [noteId],
        function (err, results) {
            if (err) {
                return res.status(500).json({ message: "Error fetching notes from database." });
            }
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ message: "Note not found" });
            }
        }
    );
});

app.put('/notes/:id', (req, res) => {
    const noteId = req.params.id;
    const { title, content } = req.body;

    const query = `
        UPDATE notes
        SET title = ?, content = ?
        WHERE id = ?
    `;

    connection.query(query, [title, content, noteId], (err, results) => {
        if (err) {
            console.error('Error updating note:', err);
            return res.status(500).json({ error: 'Failed to update note' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json({ message: 'Note updated successfully' });
    });
});

app.post('/notes', (req, res) => {
    const { title, content, isFav, creationDate } = req.body;

    const query = `INSERT INTO notes (title, content, isFav, creationDate) VALUES (?,?,?,?)`;

    connection.query(query, [title, content, isFav, creationDate], (err, results) => {
        if (err) {
            console.error('Error inserting note:', err);
            return res.status(500).json({ error: 'Error inserting note' });
        }

        const lastInsertIdQuery = `SELECT uuid FROM notes WHERE uuid = LAST_INSERT_ID()`;

        connection.query(lastInsertIdQuery, (err, rows) => {
            if (err) {
                console.error('Error fetching UUID:', err);
                return res.status(500).json({ error: 'Error fetching UUID' });
            }

            if (rows.length > 0) {
                const uuid = rows[0].uuid;
                res.status(200).json({ id: uuid, message: `Note created with UUID: ${uuid}` });
            } else {
                res.status(500).json({ error: 'UUID not found for the inserted note' });
            }
        });
    });
});


app.delete('/delete/:id', (req, res) => {
    const noteId = Number(req.params.id);
    const query = `delete from notes where id = ?`
    connection.query(query, [noteId], (err, results) => {
        if (err) {
            console.error('Error deleting note:', err);
            return res.status(500).json({ error: 'Error' });
        }
        res.status(200).json({ message: 'Note deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})