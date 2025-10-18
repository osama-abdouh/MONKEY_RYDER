const db = require("../services/db");

// Ottiene tutti i prodotti in vetrina ordinati per posizione
const getAllShowcaseProducts = async function (connection) {
  const query = `
    SELECT 
      showcase.id as showcase_id,
      showcase.product_id,
      showcase.position,
      products.name,
      products.description,
      products.price,
      products.image_path,
      products.category_id,
      categories.name as category_name,
      products.brand_id,
      brand.name as brand_name
    FROM showcase
    JOIN products ON showcase.product_id = products.id
    JOIN categories ON products.category_id = categories.id
    JOIN brand ON products.brand_id = brand.id
    ORDER BY showcase.position ASC
  `;
  const result = await db.execute(connection, query);
  return result;
};

// Aggiunge un prodotto alla vetrina
const addProductToShowcase = async function (connection, productId, position) {
  if (!position) {
    const maxPosQuery = `SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM showcase`;
    const maxPosResult = await db.execute(connection, maxPosQuery);
    position = maxPosResult[0].next_position;
  }

  const query = `
    INSERT INTO showcase (product_id, position)
    VALUES ($1, $2)
    RETURNING id, product_id, position
  `;
  const result = await db.execute(connection, query, [productId, position]);
  return result[0];
};

// Rimuove un prodotto dalla vetrina
const removeProductFromShowcase = async function (connection, showcaseId) {
  const query = `DELETE FROM showcase WHERE id = $1`;
  const result = await connection.result(query, [showcaseId]);
  return result.rowCount > 0;
};

// Rimuove un prodotto dalla vetrina tramite product_id
const removeProductFromShowcaseByProductId = async function (
  connection,
  productId
) {
  const query = `DELETE FROM showcase WHERE product_id = $1`;
  const result = await connection.result(query, [productId]);
  return result.rowCount > 0;
};

// Aggiorna la posizione di un prodotto in vetrina
const updateShowcasePosition = async function (
  connection,
  showcaseId,
  newPosition
) {
  const query = `
    UPDATE showcase 
    SET position = $2
    WHERE id = $1
    RETURNING id, product_id, position
  `;
  const result = await db.execute(connection, query, [showcaseId, newPosition]);
  return result[0];
};

// Riordina le posizioni in vetrina
const reorderShowcasePositions = async function (connection) {
  const query = `
    WITH ordered_showcase AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY position) as new_position
      FROM showcase
    )
    UPDATE showcase
    SET position = ordered_showcase.new_position
    FROM ordered_showcase
    WHERE showcase.id = ordered_showcase.id
  `;
  await db.execute(connection, query);
  return true;
};

// Scambia le posizioni di due prodotti
const swapShowcasePositions = async function (
  connection,
  showcaseId1,
  showcaseId2
) {
  const query = `
    WITH positions AS (
      SELECT id, position FROM showcase WHERE id IN ($1, $2)
    )
    UPDATE showcase s
    SET position = CASE 
      WHEN s.id = $1 THEN (SELECT position FROM positions WHERE id = $2)
      WHEN s.id = $2 THEN (SELECT position FROM positions WHERE id = $1)
    END
    WHERE s.id IN ($1, $2)
    RETURNING id, product_id, position
  `;
  const result = await db.execute(connection, query, [
    showcaseId1,
    showcaseId2,
  ]);
  return result;
};

// Verifica se un prodotto è già in vetrina
const isProductInShowcase = async function (connection, productId) {
  const query = `SELECT COUNT(*) as count FROM showcase WHERE product_id = $1`;
  const result = await db.execute(connection, query, [productId]);
  return result[0].count > 0;
};

// Ottiene il conteggio totale
const getShowcaseProductCount = async function (connection) {
  const query = `SELECT COUNT(*) as count FROM showcase`;
  const result = await db.execute(connection, query);
  return parseInt(result[0].count);
};

module.exports = {
  getAllShowcaseProducts,
  addProductToShowcase,
  removeProductFromShowcase,
  removeProductFromShowcaseByProductId,
  updateShowcasePosition,
  reorderShowcasePositions,
  swapShowcasePositions,
  isProductInShowcase,
  getShowcaseProductCount,
};
