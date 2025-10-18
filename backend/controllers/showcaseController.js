const db = require("../services/db");
const showcaseDAO = require("../DAO/showcaseDAO");

// Ottiene tutti i prodotti in vetrina
exports.getAllShowcaseProducts = async function (req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const showcaseProducts = await showcaseDAO.getAllShowcaseProducts(conn);
    res.json(showcaseProducts);
  } catch (error) {
    console.error(
      "controller/showcaseController.js getAllShowcaseProducts",
      error
    );
    res.status(500).json({
      message: "Failed to get showcase products",
      error: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};

// Aggiunge un prodotto alla vetrina
exports.addProductToShowcase = async function (req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const { productId, position } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Missing productId in body" });
    }

    // Verifica se il prodotto è già in vetrina
    const isInShowcase = await showcaseDAO.isProductInShowcase(conn, productId);
    if (isInShowcase) {
      return res
        .status(400)
        .json({ message: "Product is already in showcase" });
    }

    const result = await showcaseDAO.addProductToShowcase(
      conn,
      productId,
      position
    );
    res.status(201).json(result);
  } catch (error) {
    console.error(
      "controller/showcaseController.js addProductToShowcase",
      error
    );
    res.status(500).json({
      message: "Failed to add product to showcase",
      error: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};

// Rimuove un prodotto dalla vetrina tramite showcase ID
exports.removeProductFromShowcase = async function (req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const showcaseId = req.params.showcaseId;

    const result = await showcaseDAO.removeProductFromShowcase(
      conn,
      showcaseId
    );

    if (!result) {
      return res.status(404).json({ message: "Showcase entry not found" });
    }

    // Riordina le posizioni dopo la rimozione
    await showcaseDAO.reorderShowcasePositions(conn);

    res.json({ message: "Product removed from showcase", deleted: true });
  } catch (error) {
    console.error(
      "controller/showcaseController.js removeProductFromShowcase",
      error
    );
    res.status(500).json({
      message: "Failed to remove product from showcase",
      error: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};

// Rimuove un prodotto dalla vetrina tramite product ID
exports.removeProductFromShowcaseByProductId = async function (req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const productId = req.params.productId;

    const result = await showcaseDAO.removeProductFromShowcaseByProductId(
      conn,
      productId
    );

    if (!result) {
      return res.status(404).json({ message: "Product not found in showcase" });
    }

    // Riordina le posizioni dopo la rimozione
    await showcaseDAO.reorderShowcasePositions(conn);

    res.json({ message: "Product removed from showcase", deleted: true });
  } catch (error) {
    console.error(
      "controller/showcaseController.js removeProductFromShowcaseByProductId",
      error
    );
    res.status(500).json({
      message: "Failed to remove product from showcase",
      error: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};

// Aggiorna la posizione di un prodotto nella vetrina
exports.updateShowcasePosition = async function (req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const showcaseId = req.params.showcaseId;
    const { newPosition } = req.body;

    if (!newPosition || newPosition < 1) {
      return res.status(400).json({ message: "Invalid position value" });
    }

    const result = await showcaseDAO.updateShowcasePosition(
      conn,
      showcaseId,
      newPosition
    );

    if (!result) {
      return res.status(404).json({ message: "Showcase entry not found" });
    }

    res.json(result);
  } catch (error) {
    console.error(
      "controller/showcaseController.js updateShowcasePosition",
      error
    );
    res.status(500).json({
      message: "Failed to update showcase position",
      error: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};

// Riordina tutte le posizioni nella vetrina
exports.reorderShowcasePositions = async function (req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    await showcaseDAO.reorderShowcasePositions(conn);
    res.json({ message: "Showcase positions reordered successfully" });
  } catch (error) {
    console.error(
      "controller/showcaseController.js reorderShowcasePositions",
      error
    );
    res.status(500).json({
      message: "Failed to reorder showcase positions",
      error: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};

// Scambia le posizioni di due prodotti
exports.swapShowcasePositions = async function (req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const { showcaseId1, showcaseId2 } = req.body;

    if (!showcaseId1 || !showcaseId2) {
      return res.status(400).json({
        message: "Missing showcaseId1 or showcaseId2 in body",
      });
    }

    const result = await showcaseDAO.swapShowcasePositions(
      conn,
      showcaseId1,
      showcaseId2
    );
    res.json(result);
  } catch (error) {
    console.error(
      "controller/showcaseController.js swapShowcasePositions",
      error
    );
    res.status(500).json({
      message: "Failed to swap showcase positions",
      error: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};

// Verifica se un prodotto è in vetrina
exports.isProductInShowcase = async function (req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const productId = req.params.productId;

    const isInShowcase = await showcaseDAO.isProductInShowcase(conn, productId);
    res.json({ productId, inShowcase: isInShowcase });
  } catch (error) {
    console.error(
      "controller/showcaseController.js isProductInShowcase",
      error
    );
    res.status(500).json({
      message: "Failed to check if product is in showcase",
      error: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};

// Ottiene il conteggio dei prodotti in vetrina
exports.getShowcaseProductCount = async function (req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const count = await showcaseDAO.getShowcaseProductCount(conn);
    res.json({ count });
  } catch (error) {
    console.error(
      "controller/showcaseController.js getShowcaseProductCount",
      error
    );
    res.status(500).json({
      message: "Failed to get showcase product count",
      error: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};
