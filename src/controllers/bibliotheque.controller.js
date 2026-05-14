import * as model from '../models/bibliotheque.models.js';


// GET /livres?tous=true
export const getLivres = async (req, res) => {
    try {
        const { bibliotheque_id } = req.bibliotheque;
        const afficherTous = req.query.tous === 'true';

        const livres = await model.listerLivres(bibliotheque_id, afficherTous);
        res.status(200).json(livres);
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors de la récupération des livres" });
    }
};

// GET /livres/:id
export const getLivre = async (req, res) => {
    try {
        const { id } = req.params;
        const { bibliotheque_id } = req.bibliotheque;

        const livre = await model.trouverLivreParId(id, bibliotheque_id);

        if (!livre) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }

        res.status(200).json(livre);
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors de la récupération du détail du livre" });
    }
};

// POST /livres
export const addLivre = async (req, res) => {
    try {
        const { titre, auteur, isbn, description } = req.body;
        const { bibliotheque_id } = req.bibliotheque;

        if (!titre || !auteur || !isbn) {
            return res.status(400).json({ message: "Le titre, l'auteur et l'ISBN sont obligatoires" });
        }

        const nouveauLivre = await model.ajouterLivre(
            { titre, auteur, isbn, description }, 
            bibliotheque_id
        );
        res.status(201).json(nouveauLivre);
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors de l'ajout du livre" });
    }
};

// PUT /livres/:id
export const updateLivre = async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, auteur, isbn, description } = req.body;
        const { bibliotheque_id } = req.bibliotheque;

        const livreModifie = await model.modifierLivre(
            id, 
            { titre, auteur, isbn, description }, 
            bibliotheque_id
        );

        if (!livreModifie) {
            return res.status(404).json({ message: "Livre non trouvé ou modification impossible" });
        }

        res.status(200).json(livreModifie);
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors de la modification du livre" });
    }
};

// PATCH /livres/:id/statut
export const patchStatutLivre = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body; // 'disponible' ou 'emprunté'
        const { bibliotheque_id } = req.bibliotheque;

        if (!['disponible', 'emprunté'].includes(statut)) {
            return res.status(400).json({ message: "Statut invalide" });
        }

        const livreModifie = await model.modifierStatutLivre(id, statut, bibliotheque_id);
        
        if (!livreModifie) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }

        res.status(200).json(livreModifie);
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors du changement de statut" });
    }
};

// DELETE /livres/:id
export const delLivre = async (req, res) => {
    try {
        const { id } = req.params;
        const { bibliotheque_id } = req.bibliotheque;

        const succes = await model.supprimerLivre(id, bibliotheque_id);

        if (!succes) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }

        res.status(200).json({ message: "Livre supprimé avec succès" });
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors de la suppression du livre" });
    }
};

// --- GESTION DES PRÊTS ---

// POST /livres/:livreId/prets
export const addPret = async (req, res) => {
    try {
        const { livreId } = req.params;
        const { nom_emprunteur, date_retour_prevue } = req.body;

        if (!nom_emprunteur || !date_retour_prevue) {
            return res.status(400).json({ message: "Le nom de l'emprunteur et la date de retour sont requis" });
        }

        const nouveauPret = await model.ajouterPret(livreId, nom_emprunteur, date_retour_prevue);
        
        // Optionnel: Mettre à jour automatiquement le statut du livre en 'emprunté'
        await model.modifierStatutLivre(livreId, 'emprunté', req.bibliotheque.bibliotheque_id);

        res.status(201).json(nouveauPret);
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors de l'ajout du prêt" });
    }
};

// PATCH /prets/:id/statut
export const patchStatutPret = async (req, res) => {
    try {
        const { id } = req.params;
        const { est_termine } = req.body; // true ou false

        if (typeof est_termine !== 'boolean') {
            return res.status(400).json({ message: "Le champ est_termine doit être un booléen" });
        }

        const pretModifie = await model.modifierStatutPret(id, est_termine);

        if (!pretModifie) {
            return res.status(404).json({ message: "Prêt non trouvé" });
        }

        res.status(200).json(pretModifie);
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors de la modification du prêt" });
    }
};

export const deletePret = async (req, res) => {
    try {
        const { id } = req.params;

        const pret = await model.supprimerPret(id);

        if (!pret) {
            return res.status(404).json({ message: "Prêt non trouvé" });
        }

        res.status(200).json({ message: "Prêt supprimé avec succès" });
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors de la suppression du prêt" });
    }
};

// PUT /prets/:id
export const updatePret = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom_emprunteur, date_retour_prevue } = req.body;

        if (!nom_emprunteur || !date_retour_prevue) {
            return res.status(400).json({ message: "Le nom de l'emprunteur et la date de retour sont requis" });
        }

        const pretModifie = await model.modifierPret(id, { nom_emprunteur, date_retour_prevue });

        if (!pretModifie) {
            return res.status(404).json({ message: "Prêt non trouvé" });
        }

        res.status(200).json(pretModifie);
    } catch (erreur) {
        console.error(`Erreur 500: ${erreur.message}`);
        res.status(500).json({ message: "Erreur lors de la modification du prêt" });
    }
};