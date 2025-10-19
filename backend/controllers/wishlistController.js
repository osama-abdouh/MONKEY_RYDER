const db = require("../services/db");
const wishlistDAO = require("../DAO/wishlistDAO");

exports.getWishlist = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const userId = req.user.id; // Leggi da JWT invece che da params
    const wishlist = await wishlistDAO.getWishlistByUserId(conn, userId);
    res.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.addToWishlist = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const userId = req.user.id; // Leggi da JWT
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId è richiesto" });
    }

    await wishlistDAO.AddToWishlist(conn, userId, productId);
    res.status(201).json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);

    // Gestisci duplicati
    if (error.message && error.message.includes("già presente")) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.removeFromWishlist = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const userId = req.user.id; // Leggi da JWT
    const productId = req.params.productId; // Leggi da URL params

    if (!productId) {
      return res.status(400).json({ error: "productId è richiesto" });
    }

    const removed = await wishlistDAO.RemoveFromWishlist(
      conn,
      userId,
      productId
    );

    if (!removed) {
      return res
        .status(404)
        .json({ error: "Prodotto non trovato nella wishlist" });
    }

    res.json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.isInWishlist = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const userId = req.user.id; // Leggi da JWT
    const productId = req.params.productId; // Leggi da URL params

    if (!productId) {
      return res.status(400).json({ error: "productId è richiesto" });
    }

    const exists = await wishlistDAO.isProductInWishlist(
      conn,
      userId,
      productId
    );
    res.json({ inWishlist: exists });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};
