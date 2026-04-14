const { db, admin } = require('../utils/firebase');

const getInventario = async (req, res) => {
    const { negocioId } = req;
    const { sector, categoria } = req.query;

    try {
        let ref = db.collection(`negocios/${negocioId}/inventario`);
        
        if (sector) ref = ref.where('sector', '==', sector);
        if (categoria) ref = ref.where('categoria', '==', categoria);

        const snap = await ref.get();
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener inventario' });
    }
};

const updateStock = async (req, res) => {
    const { negocioId } = req;
    const { id } = req.params;
    const { stock, quantity, type } = req.body;

    try {
        const ref = db.doc(`negocios/${negocioId}/inventario/${id}`);
        const doc = await ref.get();

        if (!doc.exists) return res.status(404).json({ message: 'Producto no encontrado' });

        const currentStock = doc.data().stock || 0;
        let newStock = currentStock;

        if (stock !== undefined) {
             newStock = Number(stock);
        } else if (quantity !== undefined) {
             newStock = currentStock + (type === 'Ingreso' ? Number(quantity) : -Number(quantity));
        }

        if (newStock < 0) {
            return res.status(400).json({ message: 'El stock no puede ser negativo' });
        }

        await ref.update({
            stock: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, newStock });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar stock' });
    }
};

module.exports = { getInventario, updateStock };
