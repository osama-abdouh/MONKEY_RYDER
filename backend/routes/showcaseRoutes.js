const express = require("express");
const showcaseController = require("../controllers/showcaseController");

const router = express.Router();

// GET - Ottiene tutti i prodotti in vetrina
router.get("/showcase", showcaseController.getAllShowcaseProducts);

// GET - Ottiene il conteggio dei prodotti in vetrina
router.get("/showcase/count", showcaseController.getShowcaseProductCount);

// GET - Verifica se un prodotto è in vetrina
router.get(
  "/showcase/check/:productId",
  showcaseController.isProductInShowcase
);

// POST - Aggiunge un prodotto alla vetrina
router.post("/showcase", showcaseController.addProductToShowcase);

// PATCH - Aggiorna la posizione di un prodotto
router.patch(
  "/showcase/:showcaseId/position",
  showcaseController.updateShowcasePosition
);

// PATCH - Scambia le posizioni di due prodotti
router.patch("/showcase/swap", showcaseController.swapShowcasePositions);

// PATCH - Riordina tutte le posizioni
router.patch("/showcase/reorder", showcaseController.reorderShowcasePositions);

// DELETE - Rimuove un prodotto dalla vetrina tramite showcase ID
router.delete(
  "/showcase/:showcaseId",
  showcaseController.removeProductFromShowcase
);

// DELETE - Rimuove un prodotto dalla vetrina tramite product ID
router.delete(
  "/showcase/product/:productId",
  showcaseController.removeProductFromShowcaseByProductId
);

module.exports = router;
