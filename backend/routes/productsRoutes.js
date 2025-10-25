const express = require("express");
const productController = require("../controllers/productController");
const db = require("../services/db");
const fileUploadMiddleware = require("../middleware/fileUploadMiddleware");

const router = express.Router();

router.get("/search", productController.searchProducts);
router.get("/products", productController.getAllProducts);
router.post("/products", productController.createProduct);
router.get("/products/:id", productController.getProductByID);
router.get(
  "/products/category/:categoryId",
  productController.getProductsByCategory
);
router.get(
  "/products/category/name/:categoryName",
  productController.getProductsByCategoryName
);
router.get("/products/by-vehicle/:vehicleId", productController.getProductsByVehicle);
router.get("/categories", productController.getAllCategories);
router.post("/categories", productController.createCategory);
router.delete("/categories/:id", productController.deleteCategory);
router.post(
  "/categories/:id/image",
  fileUploadMiddleware,
  productController.uploadCategoryImage
);
router.get("/brands", productController.getAllBrands);
router.post("/brands", productController.createBrand);
router.delete("/brands/:id", productController.deleteBrand);
router.post(
  "/products/:productId/increment-sales",
  productController.incrementSales
);
router.get("/products/push", productController.getPushProducts);
router.get("/products/count-less", productController.countLessProducts);
router.delete("/products/:id", productController.deleteProduct);
router.put("/products/:id", productController.updateProduct);
router.post(
  "/products/:id/image",
  fileUploadMiddleware,
  productController.uploadProductImage
);

module.exports = router;
