const express =require('express');
const productController = require('../controllers/productController');
const db = require('../services/db');

const router = express.Router();

router.get('/search', productController.searchProducts);
router.get('/products', productController.getAllProducts);
router.post('/products', productController.createProduct);
router.get('/products/category/:categoryId', productController.getProductsByCategory);
router.get('/products/category/name/:categoryName', productController.getProductsByCategoryName);
router.get('/categories', productController.getAllCategories);
router.post('/categories', productController.createCategory);
router.delete('/categories/:id', productController.deleteCategory);
router.get('/brands', productController.getAllBrands);
router.post('/products/:productId/increment-sales', productController.incrementSales);
router.get('/products/push', productController.getPushProducts);
router.get('/products/count-less', productController.countLessProducts); 
router.delete('/products/:id', productController.deleteProduct);


// Query per ottenere la struttura del proprio database
router.get('/db-structure', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const query = `
      SELECT table_name, column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `;
    const result = await db.execute(connection, query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await db.closeConnection(connection);
  }
});


module.exports = router;

