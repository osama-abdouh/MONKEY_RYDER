const db = require('../services/db');
const productDAO = require('../DAO/productDAO');

exports.getAllProducts = async (req, res) => {
    let conn = await db.getConnection();
    try {
    const products = await productDAO.getAllProducts(conn);
    res.json(products);
    } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    } finally {
    if (conn) conn.done();
    }
}

exports.getProductsByCategory = async (req, res) => {
    let conn = await db.getConnection();
    try {
    const categoryId = req.params.categoryId;
    const products = await productDAO.getProductsByCategory(conn, categoryId);
    res.json(products);
    } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    } finally {
    if (conn) conn.done();
    }
}

exports.getProductsByCategoryName = async (req, res) => {
    let conn = await db.getConnection();
    try {
    const categoryName = req.params.categoryName;
    const products = await productDAO.getProductsByCategoryName(conn, categoryName);
    res.json(products);
    } catch (error) {
    console.error('Error fetching products by category name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    } finally {
    if (conn) conn.done();
    }
}

exports.getAllCategories = async (req, res) => {
    let conn = await db.getConnection();
    try {
        const categories = await productDAO.getAllCategories(conn);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (conn) conn.done();
    }
}

exports.incrementSales = async (req, res) => {
    let conn = await db.getConnection();
    try {
        const productId = req.params.productId;
        const quantity = req.body.quantity || 1;
        const result = await productDAO.incrementSalesCount(conn, productId, quantity);
        res.json({ 
            message: 'Sales count updated', 
            productId: productId, 
            newSalesCount: result.sales_count 
        });
    } catch (error) {
        console.error('Error incrementing sales count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
        console.error('Error fetching push products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (conn) conn.done();
    }
}