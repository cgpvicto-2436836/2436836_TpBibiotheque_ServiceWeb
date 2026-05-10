//https://services-web-victo.github.io/notes_de_cours/deploiement/postgresql/#modification-des-requetes-preparees 
import pool from '../config/db_pg.js';
export const listerLivres = async (biblioId, tous = false) => {
    let sql = "SELECT * FROM livres WHERE bibliotheque_id = $1";
    if (!tous) sql += " AND statut = 'disponible'";
    const res = await pool.query(sql + " ORDER BY titre ASC", [biblioId]);
    return res.rows;
};

export const modifierLivre = async (id, data, biblioId) => {
    const { titre, auteur, isbn, description } = data;
    const res = await pool.query(
        "UPDATE livres SET titre = $1, auteur = $2, isbn = $3, description = $4 WHERE id = $5 AND bibliotheque_id = $6 RETURNING *",
        [titre, auteur, isbn, description, id, biblioId]
    );
    return res.rows[0];
};

export const trouverLivreParId = async (id, biblioId) => {
    const resLivre = await pool.query("SELECT * FROM livres WHERE id = $1 AND bibliotheque_id = $2", [id, biblioId]);
    if (resLivre.rows.length === 0) return null;
    const livre = resLivre.rows[0];
    const resPrets = await pool.query("SELECT *, NOT est_termine as en_cours FROM prets WHERE livre_id = $1 ORDER BY date_debut DESC", [id]);
    livre.prets = resPrets.rows;
    return livre;
};

export const ajouterLivre = async (data, biblioId) => {
    const { titre, auteur, isbn, description } = data;
    const res = await pool.query(
        "INSERT INTO livres (titre, auteur, isbn, description, bibliotheque_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [titre, auteur, isbn, description, biblioId]
    );
    return res.rows[0];
};

export const modifierStatutLivre = async (id, statut, biblioId) => {
    const res = await pool.query("UPDATE livres SET statut = $1 WHERE id = $2 AND bibliotheque_id = $3 RETURNING *", [statut, id, biblioId]);
    return res.rows[0];
};

export const ajouterPret = async (livreId, nom, dateRetour) => {
    const res = await pool.query(
        "INSERT INTO prets (livre_id, nom_emprunteur, date_retour_prevue) VALUES ($1, $2, $3) RETURNING *",
        [livreId, nom, dateRetour]
    );
    return res.rows[0];
};

export const modifierStatutPret = async (pretId, termine) => {
    const res = await pool.query("UPDATE prets SET est_termine = $1 WHERE id = $2 RETURNING *", [termine, pretId]);
    return res.rows[0];
};

export const supprimerLivre = async (id, biblioId) => {
    const res = await pool.query("DELETE FROM livres WHERE id = $1 AND bibliotheque_id = $2", [id, biblioId]);
    return res.rowCount > 0;
};

export const supprimerPret = async (id) => {
    const res = await pool.query(
        'DELETE FROM prets WHERE id = $1 RETURNING *',
        [id]
    );
    return res.rows[0];
};