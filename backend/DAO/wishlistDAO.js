const db = require("../services/db");

const getWishlistByUserId = async function (connection, userId) {
  const query = `
    SELECT 
      wishlist.product_id AS id,
      products.name,
      products.description,
      products.price,
      products.quantity,
      products.category_id,
      products.brand_id,
      products.image_path,
      categories.name AS category_name,
      brand.name AS brand_name
    FROM wishlist
    JOIN products ON wishlist.product_id = products.id
    LEFT JOIN categories ON products.category_id = categories.id
    LEFT JOIN brand ON products.brand_id = brand.id
    WHERE wishlist.user_id = $1
    ORDER BY wishlist.added_at DESC
  `;
  const result = await db.execute(connection, query, [userId]);
  return result;
};

const AddToWishlist = async function (connection, userId, productId) {
  const query = `
    INSERT INTO wishlist (user_id, product_id)
    VALUES ($1, $2)
  `;
  const result = await db.execute(connection, query, [userId, productId]);
  return result;
};

const RemoveFromWishlist = async function (connection, userId, productId) {
  const query = `
    DELETE FROM wishlist
    WHERE user_id = $1 AND product_id = $2
  `;
  const result = await db.execute(connection, query, [userId, productId]);
  return result;
};

const isProductInWishlist = async function (connection, userId, productId) {
  const query = `
    SELECT 1
    FROM wishlist
    WHERE user_id = $1 AND product_id = $2
    LIMIT 1
  `;
  const result = await db.execute(connection, query, [userId, productId]);
  return result && result.length > 0;
};

module.exports = {
  getWishlistByUserId,
  AddToWishlist,
  RemoveFromWishlist,
  isProductInWishlist,
};
