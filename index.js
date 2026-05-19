import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import router from './src/routes/bibliotheque.route.js';
import cors from 'cors';

// Configuration pour ESM (__dirname n'existe pas par défaut)
const __dirname = path.dirname(fileURLToPath(import.meta.url));


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

// Middleware pour Cross-Origin Resource Sharing (Pour les erreur html)
app.use(cors());


// Journalisation - Écrit les logs dans access.log (Modifer car je n'avais plus ma sources)
var accessLogStream = fs.createWriteStream('./access.log', { flags: 'a' })
app.use(morgan('dev', { stream: accessLogStream }))

// Route de base (user/prêt/livres)
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
    console.log("[Serveur] Démarré sur http://localhost:3000");
    console.log("[Docs] Documentation disponible sur http://localhost:3000/api/docs");
});