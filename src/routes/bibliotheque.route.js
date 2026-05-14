import express from 'express';
import * as biblioCtrl from '../controllers/bibliotheque.controller.js';
import * as userCtrl from '../controllers/user.controller.js';
import authentification from '../middlewares/auth.middleware.js';
const router = express.Router();

// Routes publiques
router.post('/usagers', userCtrl.inscrire);
router.get('/usagers/cle', userCtrl.obtenirCleApi);

// Routes protégées
router.use(authentification);
router.get('/livres', biblioCtrl.getLivres);
router.get('/livres/:id', biblioCtrl.getLivre);
router.put('/livres/:id', biblioCtrl.updateLivre);
router.post('/livres', biblioCtrl.addLivre);
router.patch('/livres/:id/statut', biblioCtrl.patchStatutLivre);
router.delete('/livres/:id', biblioCtrl.delLivre);

// Gestion des prêts
router.post('/livres/:livreId/prets', biblioCtrl.addPret);
router.patch('/prets/:id/statut', biblioCtrl.patchStatutPret);
router.put('/prets/:id', updatePret);
router.delete('/prets/:id', biblioCtrl.deletePret);

export default router;