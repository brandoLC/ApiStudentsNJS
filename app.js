
// Importar dependencias
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// Crear la app de Express
const app = express();

// Middleware para parsear los cuerpos de las solicitudes en formato JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Crear la conexión a la base de datos
const db = new sqlite3.Database('./students.sqlite', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Rutas de la API

// Ruta para obtener todos los estudiantes (GET)
app.get('/students', (req, res) => {
    db.all("SELECT * FROM students", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Ruta para obtener un estudiante por ID (GET)
app.get('/student/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: 'Estudiante no encontrado' });
            return;
        }
        res.json(row);
    });
});

// Ruta para agregar un nuevo estudiante (POST)
app.post('/students', (req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    const sql = `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [firstname, lastname, gender, age], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, message: 'Estudiante creado con éxito' });
    });
});

// Ruta para actualizar un estudiante (PUT)
app.put('/student/:id', (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, gender, age } = req.body;

    const sql = `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`;

    db.run(sql, [firstname, lastname, gender, age, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Estudiante no encontrado' });
            return;
        }
        res.json({ message: 'Estudiante actualizado con éxito' });
    });
});

// Ruta para eliminar un estudiante (DELETE)
app.delete('/student/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM students WHERE id = ?`;

    db.run(sql, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: 'Estudiante no encontrado' });
            return;
        }
        res.json({ message: `Estudiante con ID ${id} eliminado con éxito` });
    });
});

// Iniciar el servidor en el puerto 8001
const PORT = 8001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
