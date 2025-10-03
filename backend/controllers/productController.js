const db = require('../services/db');
const productDAO = require('../DAO/productDAO');

exports.getAllProducts = async (req, res) => {
    conn = await db.getConnection();
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
    conn = await db.getConnection();
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
    conn = await db.getConnection();
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
    conn = await db.getConnection();
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