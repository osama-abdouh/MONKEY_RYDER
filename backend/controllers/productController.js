const db = require("../services/db");
const productDAO = require("../DAO/productDAO");
const path = require("path");

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

exports.getProductByID = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const productId = req.params.id;
    const rows = await productDAO.getProductsByID(conn, productId);
    const product = Array.isArray(rows) ? rows[0] ?? null : rows;
    if (!product) {
      return res.status(404).json({ error: "Prodotto non trovato" });
    }
    res.json(product);
  } catch (error) {
    console.error("Errore nel recupero del prodotto:", error);
    res.status(500).json({ error: "Errore nel recupero del prodotto" });
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

    // Prepara i filtri
    const filters = {
      searchTerm: search || null,
      category: category || null,
      brand: brand || null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    };

    // Chiama il DAO per la ricerca
    const results = await productDAO.searchProducts(conn, filters);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

// gestione immagini prodotti
exports.uploadProductImage = async (req, res) => {
  let conn = await db.getConnection();

  try {
    const productId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Salva il percorso relativo: public/images/filename.jpg
    const imagePath = `public/images/${req.file.filename}`;

    await productDAO.updateImagePath(conn, productId, imagePath);

    res.json({
      message: "Product image uploaded successfully",
      imagePath: imagePath,
    });
  } catch (error) {
    console.error("Error uploading product image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.uploadCategoryImage = async (req, res) => {
  let conn = await db.getConnection();

  try {
    const categoryId = req.params.id;

    console.log("=== UPLOAD CATEGORY IMAGE ===");
    console.log("Category ID:", categoryId);
    console.log("File:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Salva il percorso relativo: public/images/filename.jpg
    const imagePath = `public/images/${req.file.filename}`;
    console.log("Image path:", imagePath);

    await productDAO.updateCategoryImage(conn, categoryId, imagePath);

    res.json({
      message: "Category image uploaded successfully",
      imagePath: imagePath,
    });
  } catch (error) {
    console.error("Error uploading category image:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  } finally {
    if (conn) conn.done();
  }
};

exports.updateProduct = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const productId = req.params.id;
    const payload = req.body;

    const keys = Object.keys(payload).filter(
      (k) =>
        ![
          "id",
          "created_at",
          "updated_at",
          "category_name",
          "brand_name",
        ].includes(k.toLowerCase())
    );

    if (keys.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const params = [...keys.map((k) => payload[k]), productId];

    const query = `
      UPDATE products 
      SET ${setClauses}
      WHERE id = $${params.length}
      RETURNING *
    `;

    const result = await db.execute(conn, query, params);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product: result[0] });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
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

exports.getProductsByVehicle = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const vehicleId = req.params.vehicleId;
    const products = await productDAO.getProductsByVehicle(conn, vehicleId);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by vehicle:", error);
exports.createBrand = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const payload = req.body || {};
    const created = await productDAO.createBrand(conn, payload);
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

exports.deleteBrand = async (req, res) => {
  let conn = await db.getConnection();
  try {
    const id = req.params.id;
    const deleted = await productDAO.deleteBrand(conn, id);
    if (deleted) return res.json({ success: true, id: Number(id) });
    return res.status(404).json({ success: false, message: "Brand not found" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};

    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) conn.done();
  }
};
