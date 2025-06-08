// api/index.js
const fs = require('fs');
const path = require('path');

// La ruta a tu archivo grupos.json.
// En Vercel, esto buscaría en el root del proyecto desplegado.
const GRUPOS_FILE = path.join(process.cwd(), 'grupos.json');

// Middleware para parsear JSON bodies
const bodyParser = require('body-parser');

// Importar Express para manejar las rutas (más robusto que solo http)
const express = require('express');
const app = express();

app.use(bodyParser.json()); // Para parsear application/json
app.use(bodyParser.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Simulación de lectura de grupos.json.
// IMPORTANTE: En un entorno serverless real, `grupos.json` NO sería persistente
// si se modifica directamente aquí. Este es un ejemplo para cumplir con el requisito
// de usar `grupos.json` para la API. Para persistencia real, usar una BD externa.
const getGrupos = () => {
    if (fs.existsSync(GRUPOS_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(GRUPOS_FILE, 'utf8'));
        } catch (e) {
            console.error('Error al parsear grupos.json:', e);
            return [];
        }
    }
    return [];
};

const saveGrupos = (grupos) => {
    try {
        fs.writeFileSync(GRUPOS_FILE, JSON.stringify(grupos, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error al escribir en grupos.json:', e);
        return false;
    }
};

// Ruta para publicar un nuevo grupo
app.post('/api/publish-group', (req, res) => {
    // Para mayor seguridad, puedes requerir un token secreto en los headers o body.
    // const SECRET_TOKEN = process.env.YOUR_SECRET_TOKEN;
    // if (req.headers['x-secret-token'] !== SECRET_TOKEN) {
    //     return res.status(401).json({ success: false, message: 'Unauthorized' });
    // }

    const { nombre, descripcion, tags, link } = req.body;

    // Validación básica de los campos
    if (!nombre || !descripcion || !link) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: nombre, descripcion, link.' });
    }

    // Validación básica del link
    try {
        new URL(link); // Intentar crear una URL para validar el formato
    } catch (e) {
        return res.status(400).json({ success: false, message: 'El formato del link es inválido.' });
    }

    const grupos = getGrupos();
    const nuevoGrupo = {
        id: Date.now().toString(), // ID simple basado en timestamp
        nombre: nombre,
        descripcion: descripcion,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        link: link
    };

    grupos.push(nuevoGrupo);

    if (saveGrupos(grupos)) {
        res.status(200).json({ success: true, message: 'Grupo publicado exitosamente.', group: nuevoGrupo });
    } else {
        res.status(500).json({ success: false, message: 'Error al guardar el grupo.' });
    }
});

// Ruta de ejemplo para obtener todos los grupos (útil para depuración)
app.get('/api/groups', (req, res) => {
    const grupos = getGrupos();
    res.status(200).json({ success: true, groups: grupos });
});

// Mensaje de bienvenida para la ruta raíz de la API
app.get('/api', (req, res) => {
    res.status(200).send('API de Team Forever. Usa /api/publish-group para publicar un grupo (POST) o /api/groups para verlos (GET).');
});

// Exportar la aplicación de Express para Vercel
module.exports = app;
