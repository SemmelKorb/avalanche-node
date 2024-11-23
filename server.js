const express = require('express')
const cors = require('cors');
const app = express()
const port = 3000
const mysql = require("mysql2");

app.use(cors({
    origin: 'http://localhost:5173'
}));


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
    const recipeId = Number(req.params.id);

    connection.query(
        `SELECT * FROM notes WHERE id = ?`,
        [recipeId],
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})