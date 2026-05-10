import pool from '../config/db_pg.js';

export const trouverParCourriel = async (courriel) => {
    const res = await pool.query('SELECT * FROM utilisateurs WHERE courriel = $1', [courriel]);
    return res.rows[0];
};

export const creerUtilisateur = async (courriel, passHache, cleApi, nomBiblio) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const resUser = await client.query(
            'INSERT INTO utilisateurs (courriel, mot_de_passe, cle_api) VALUES ($1, $2, $3) RETURNING id, courriel, cle_api',
            [courriel, passHache, cleApi]
        );
        const utilisateur = resUser.rows[0];
        await client.query('INSERT INTO bibliotheques (nom, utilisateur_id) VALUES ($1, $2)', [nomBiblio, utilisateur.id]);
        await client.query('COMMIT');
        return utilisateur;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally { client.release(); }
};

export const mettreAJourCleApi = async (id, nouvelleCle) => {
    const res = await pool.query('UPDATE utilisateurs SET cle_api = $1 WHERE id = $2 RETURNING cle_api', [nouvelleCle, id]);
    return res.rows[0];
};

export const validationCle = async (cle) => {
    const res = await pool.query(
        'SELECT b.id as bibliotheque_id FROM utilisateurs u JOIN bibliotheques b ON b.utilisateur_id = u.id WHERE u.cle_api = $1',
        [cle]
    );
    return res.rows[0];
};