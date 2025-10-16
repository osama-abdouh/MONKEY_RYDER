const db = require("../services/db");

// GetAll functions
const getAllProducts = async function (connection) {
  const query = `
    SELECT 
      products.id,
      products.name,
      products.description,
      products.price,
      products.category_id,
      categories.name as category_name,
      products.brand_id,
      brand.name as brand_name
    FROM products 
    JOIN categories ON products.category_id = categories.id
    JOIN brand ON products.brand_id = brand.id
  `;
  const result = await db.execute(connection, query);
  return result;
};
const getAllCategories = async function (connection) {
  const query = `
    SELECT 
      categories.id,
      categories.name,
      categories.image
    FROM categories
  `;
  const result = await db.execute(connection, query);
  return result;
};
const getAllBrands = async function (connection) {
  const query = `
    SELECT
      brand.id,
      brand.name    
    FROM brand
  `;
  const result = await db.execute(connection, query);
  return result;
};

// GetBy functions
const getProductsByCategory = async function (connection, categoryId) {
  const query = `
    SELECT 
      products.id,
      products.name,
      products.description,
      products.price,
      products.category_id,
      categories.name as category_name
    FROM products 
    JOIN categories ON products.category_id = categories.id
    WHERE products.category_id = $1
  `;
  const result = await db.execute(connection, query, [categoryId]);
  return result;
};
const getProductsByCategoryName = async function (connection, categoryName) {
  const query = `
    SELECT 
      products.id,
      products.name,
      products.description,
      products.price,
      products.category_id,
      categories.name as category_name
    FROM products 
    JOIN categories ON products.category_id = categories.id
    WHERE LOWER(categories.name) = LOWER($1)
  `;
  const result = await db.execute(connection, query, [categoryName]);
  return result;
};

const searchProducts = async function (connection, filter = {}) {
  const { searchTerm, category, brand, minPrice, maxPrice } = filter;

  const conditions = [];
  const params = [];
  let paramCount = 1;

  // Base query
  let query = `
    SELECT p.*, c.name as category_name, b.name as brand_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN brand b ON p.brand_id = b.id
  `;

  // Add search term condition
  if (searchTerm) {
    conditions.push(`(LOWER(p.name) LIKE LOWER($${paramCount}))`);
    params.push(`%${searchTerm}%`);
    paramCount++;
  }

  // Add category condition
  if (category) {
    conditions.push(`p.category_id = $${paramCount}`);
    params.push(category);
    paramCount++;
  }

  // Add brand condition
  if (brand) {
    conditions.push(`p.brand_id = $${paramCount}`);
    params.push(brand);
    paramCount++;
  }

  // Add price range conditions
  if (minPrice !== undefined && minPrice !== null) {
    conditions.push(`p.price >= $${paramCount}`);
    params.push(minPrice);
    paramCount++;
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    conditions.push(`p.price <= $${paramCount}`);
    params.push(maxPrice);
    paramCount++;
  }

  // Combine all conditions into the query
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  console.log("=== QUERY COSTRUITA ===");
  console.log("SQL:", query);
  console.log("PARAMS:", params);
  console.log("CONDITIONS:", conditions);

  const result = await db.execute(connection, query, params);

  console.log("=== RISULTATO DAO ===");
  console.log("Numero righe:", result.length);

  return result;
};

// Funzione per incrementare il contatore vendite
const incrementSalesCount = async function (
  connection,
  productId,
  quantity = 1
) {
  const query = `
    UPDATE products 
    SET 
      sales_count = sales_count + $2,
      last_sold_date = NOW()
    WHERE id = $1
    RETURNING sales_count
  `;
  const result = await db.execute(connection, query, [productId, quantity]);
  return result[0];
};

const getPushProducts = async function (connection, limit = 9) {
  const query = `
    SELECT
      products.id,
      products.name,
      products.description,
      products.price,
      products.category_id,
      products.sales_count,
      categories.name as category_name
    FROM products
    JOIN categories ON products.category_id = categories.id
    WHERE products.sales_count > 0  -- Solo prodotti venduti almeno una volta
    ORDER BY products.sales_count DESC  -- Ordinati per più venduti
    LIMIT $1
  `;

  const result = await db.execute(connection, query, [limit]);
  return result;
};

const countLessProducts = async function (connection) {
  // Return the product with the lowest availability assuming a `quantity` column
  const query = `
    SELECT p.id, p.name, p.quantity AS quantity, c.name AS category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.quantity ASC NULLS LAST
    LIMIT 1
  `;
  const result = await db.execute(connection, query);
  if (!result || result.length === 0) return null;
  const r = result[0];
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    quantity: r.quantity != null ? Number(r.quantity) : null,
  };
};

const createCategory = async function (connection, payload) {
  // Build dynamic insert from payload keys (exclude auto/system columns)
  const deny = new Set(["id", "created_at", "updated_at"]);
  const keys = Object.keys(payload || {}).filter(
    (k) => !deny.has(String(k).toLowerCase())
  );
  if (keys.length === 0) {
    throw new Error("No valid fields provided for category");
  }
  const colsSql = keys.join(", ");
  const params = keys.map((k) => payload[k]);
  const valuesSql = keys.map((_, i) => `$${i + 1}`).join(", ");
  const query = `INSERT INTO categories (${colsSql}) VALUES (${valuesSql}) RETURNING id, name, image`;
  const result = await db.execute(connection, query, params);
  return result && result[0] ? result[0] : null;
};

const deleteCategory = async function (connection, id) {
  const query = `DELETE FROM categories WHERE id = $1`;
  // pg-promise .any returns []; use rowCount via connection.result
  const result = await connection.result(query, [id]);
  return result.rowCount > 0;
};

const createProduct = async function (connection, payload) {
  // exclude auto/system columns; accept rest from dynamic form
  const deny = new Set(["id", "created_at", "updated_at"]);
  const keys = Object.keys(payload || {}).filter(
    (k) => !deny.has(String(k).toLowerCase())
  );
  if (keys.length === 0) {
    throw new Error("No valid fields provided for product");
  }
  const colsSql = keys.join(", ");
  const params = keys.map((k) => payload[k]);
  const valuesSql = keys.map((_, i) => `$${i + 1}`).join(", ");
  const query = `INSERT INTO products (${colsSql}) VALUES (${valuesSql}) RETURNING id, name, description, price, category_id`;
  const result = await db.execute(connection, query, params);
  return result && result[0] ? result[0] : null;
};

const deleteProduct = async function (connection, id) {
  const query = `DELETE FROM products WHERE id = $1`;
  const result = await connection.result(query, [id]);
  return result.rowCount > 0;
};

module.exports = {
  getAllCategories,
  getAllProducts,
  getAllBrands,
  getProductsByCategory,
  getPushProducts,
  searchProducts,
  incrementSalesCount,
  getProductsByCategoryName,
  countLessProducts,
  createCategory,
  deleteCategory,
  createProduct,
  deleteProduct,
};
