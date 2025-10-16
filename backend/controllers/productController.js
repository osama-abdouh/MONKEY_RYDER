const db = require("../services/db");
const productDAO = require("../DAO/productDAO");

exports.getAllProducts = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const products = await productDAO.getAllProducts(conn);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};
exports.getAllBrands = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const brands = await productDAO.getAllBrands(conn);
    res.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};
exports.getAllCategories = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const categories = await productDAO.getAllCategories(conn);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.getProductsByCategory = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const categoryId = req.params.categoryId;
    const products = await productDAO.getProductsByCategory(conn, categoryId);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.getProductsByCategoryName = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const categoryName = req.params.categoryName;
    const products = await productDAO.getProductsByCategoryName(
      conn,
      categoryName
    );
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category name:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.searchProducts = async (req, res) => {
  let conn = await db.getConnection();
  try {

    const { search, category, brand, minPrice, maxPrice } = req.query;

    console.log("=== SEARCH PARAMS RICEVUTI ===");
    console.log("search:", search);
    console.log("category:", category);
    console.log("brand:", brand);
    console.log("minPrice:", minPrice);
    console.log("maxPrice:", maxPrice);

    // Prepara i filtri
    const filters = {
      searchTerm: search || null,
      category: category || null,
      brand: brand || null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    };

    console.log("=== FILTERS PREPARATI ===", filters);

    // Chiama il DAO per la ricerca
    const results = await productDAO.searchProducts(conn, filters);

    console.log("=== RISULTATI ===");
    console.log("Numero prodotti trovati:", results.length);
    console.log("Primi 2 risultati:", results.slice(0, 2));

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.incrementSales = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const productId = req.params.productId;
    const quantity = req.body.quantity || 1;
    const result = await productDAO.incrementSalesCount(
      conn,
      productId,
      quantity
    );
    res.json({
      message: "Sales count updated",
      productId: productId,
      newSalesCount: result.sales_count,
    });
  } catch (error) {
    console.error("Error incrementing sales count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.getPushProducts = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const limit = req.query.limit || 9;
    const products = await productDAO.getPushProducts(conn, limit);
    res.json(products);
  } catch (error) {
    console.error("Error fetching push products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.countLessProducts = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const product = await productDAO.countLessProducts(conn);
    res.json(product);
  } catch (error) {
    console.error("Error fetching product with least quantity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.createCategory = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const payload = req.body || {};
    const created = await productDAO.createCategory(conn, payload);
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.deleteCategory = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const id = req.params.id;
    const deleted = await productDAO.deleteCategory(conn, id);
    if (deleted) return res.json({ success: true, id: Number(id) });
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.createProduct = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const payload = req.body || {};
    const created = await productDAO.createProduct(conn, payload);
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.deleteProduct = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const id = req.params.id;
    const deleted = await productDAO.deleteProduct(conn, id);
    if (deleted) return res.json({ success: true, id: Number(id) });
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};
