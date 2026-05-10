import { validationCle } from "../models/user.models.js";

const authentification = async (req, res, next) => {

    if(!req.headers.authorization) {
        return res.status(401).json({ message: "Vous devez fournir une clé api" });
    }

    const cleApi = req.headers.authorization.split(' ')[1];
    try {
        const cleValide = await validationCle(cleApi);
        if(cleValide) {
            req.bibliotheque = cleValide; 
            next();
        } else {
            return res.status(401).json({ message: "Clé API invalide" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Erreur lors de la validation de la clé api" })
    }
}

export default authentification;