const db = require('../services/db');

const getAllProducts = async function (connection) {
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
  `;
  const result = await db.execute(connection, query);
  return result;
};

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
}

// Funzione per incrementare il contatore vendite
const incrementSalesCount = async function (connection, productId, quantity = 1) {
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
  return { id: r.id, name: r.name, category: r.category, quantity: r.quantity != null ? Number(r.quantity) : null };
};

module.exports = {
  getAllCategories,
  getAllProducts,
  getProductsByCategory,
  getPushProducts,
  incrementSalesCount,
  getProductsByCategoryName,
  countLessProducts
};