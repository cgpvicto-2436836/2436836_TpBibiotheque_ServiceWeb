import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import router from './src/routes/bibliotheque.route.js';
import cors from 'cors';

// Configuration pour ESM (__dirname n'existe pas par défaut)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chargement de la documentation OpenAPI
const swaggerDocument = JSON.parse(fs.readFileSync('./src/config/documentation.json', 'utf8'));

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de Swagger UI
const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Bibliothèque - Documentation"
};

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour Cross-Origin Resource Sharing (les erreur html)
app.use(cors());


// Journalisation (Morgan) - Écrit les logs dans access.log
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan(':date[clf] => :method :url :status - :response-time ms', { stream: accessLogStream }));
app.use(morgan('dev'));

// Route de base
app.get('/api', (req, res) => {
    res.json({ message: "Bienvenue sur l'API de gestion de la bibliothèque !" });
});


app.use('/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerOptions)
);

app.use('/api', router);


// Gestion des routes non trouvées (404)
app.use((req, res) => {
    res.status(404).json({ message: "Route non trouvée" });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `[Serveur] Démarré sur http://localhost:${PORT}`);
    console.log(`\x1b[36m%s\x1b[0m`, `[Docs] Documentation disponible sur http://localhost:${PORT}/api/docs`);
});