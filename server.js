const express = require('express')
const cors = require('cors');
const app = express()
const port = 3000
const mysql = require("mysql2");

app.use(cors({
    origin: 'http://localhost:5173'
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
    const noteId = Number(req.params.id);

    connection.query(
        `SELECT * FROM notes WHERE id = ?`,
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

app.put('/updateNote/:id', (req, res) => {
    const noteId = Number(req.params.id);
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

app.post('/addNote', (req, res) => {
    const { title, content, datetime } = req.body;

    const query = `insert into notes (title, content, creationDate) value (?,?,?)`
    connection.query(query, [title, content, datetime], (err, results) => {
        if (err) {
            console.error('Error updating note:', err);
            return res.status(500).json({ error: 'Error' });
        }
        res.status(200).json({ message: 'Note added successfully' });
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})