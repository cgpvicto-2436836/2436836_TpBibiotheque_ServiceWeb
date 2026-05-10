import * as model from '../models/user.models.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const inscrire = async (req, res) => {
    try {
        const { courriel, mot_de_passe, nom_bibliotheque } = req.body;
        if (!courriel || !mot_de_passe || !nom_bibliotheque) {
            return res.status(400).json({ message: "Données manquantes" });
        }

        const hash = await bcrypt.hash(mot_de_passe, 10);
        const cle = uuidv4();
        const user = await model.creerUtilisateur(courriel, hash, cle, nom_bibliotheque);
        res.status(201).json(user);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const obtenirCleApi = async (req, res) => {
    try {
        // Lecture depuis req.query car c'est une requête GET
        const { courriel, mot_de_passe, nouvelle } = req.query;
        const regenerer = nouvelle === '1';

        if (!courriel || !mot_de_passe) {
            return res.status(400).json({ message: "Données manquantes" });
        }

        const user = await model.trouverParCourriel(courriel);

        if (!user || !(await bcrypt.compare(mot_de_passe, user.mot_de_passe))) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        if (regenerer) {
            const nouvelleCle = uuidv4();
            await model.mettreAJourCleApi(user.id, nouvelleCle);
            return res.json({ cle_api: nouvelleCle });
        }

        res.json({ cle_api: user.cle_api });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

