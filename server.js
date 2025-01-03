const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { json } = require('body-parser');
require('dotenv').config();

const app = express();
const pool = new Pool({
    user: process.env.VITE_USER,
    host: process.env.VITE_HOST,
    database: process.env.VITE_DATABASE,
    password: process.env.VITE_PASSWORD,
    port: process.env.VITE_PORT,
});


app.use(cors({
    origin: [
      'http://localhost:5173',
      'https://mini-to-do-app.netlify.app/'  // Tu dominio de Netlify
    ],
    credentials: true
  }));
app.use(json());

// Ruta para obtener todas las tareas
app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al obtener tareas');
    }
});

// Ruta para agregar una nueva tarea
app.post('/todos', async (req, res) => {
    const { task } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO todos (task) VALUES ($1) RETURNING *',
            [task]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al agregar tarea');
    }
});

// Ruta para actualizar el estado de una tarea
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE todos SET status = $1 WHERE id = $2', [status, id]);
        res.send('Tarea actualizada');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al actualizar tarea');
    }
});

// Ruta para eliminar una tarea
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM todos WHERE id = $1', [id]);
        res.send('Tarea eliminada');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al eliminar tarea');
    }
});

const PORT =  3001;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
