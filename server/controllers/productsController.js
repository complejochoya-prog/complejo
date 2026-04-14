const Product = require("../models/Product");
const { getCache, setCache, deleteCache } = require("../services/cacheService");
const logAction = require("../services/auditService");


/**
 * Controller for managing bar products (menu).
 */

/**
 * Retrieves all products for the current business.
 */
exports.getProducts = async (req, res) => {
    try {
        const key = `productos-${req.negocioId}`;
        const cached = getCache(key);

        if (cached) {
            return res.json(cached);
        }

        const products = await Product.find({ negocioId: req.negocioId }).select("name price stock category");
        
        setCache(key, products);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos", error: error.message });
    }
};

/**
 * Creates a new product (menu item).
 */
exports.createProduct = async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            negocioId: req.negocioId
        });
        await product.save();
        
        // Invalidate cache
        const key = `productos-${req.negocioId}`;
        deleteCache(key);

        await logAction({
            usuario: req.user.email || req.user.id,
            accion: "crear producto",
            modulo: "inventario",
            negocioId: req.negocioId,
            detalle: `Producto creado: ${product.name}`
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: "Error al crear producto", error: error.message });
    }
};

/**
 * Updates a product's details (price, stock).
 */
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOneAndUpdate(
            { _id: id, negocioId: req.negocioId }, 
            req.body, 
            { new: true }
        );

        // Invalidate cache
        const key = `productos-${req.negocioId}`;
        deleteCache(key);

        await logAction({
            usuario: req.user.email || req.user.id,
            accion: "editar producto",
            modulo: "inventario",
            negocioId: req.negocioId,
            detalle: `Producto editado: ${product.name}`
        });

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar producto", error: error.message });
    }
};
