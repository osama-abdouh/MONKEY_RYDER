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

module.exports = { 
  getAllProducts,
  getProductsByCategory,
  getProductsByCategoryName
};