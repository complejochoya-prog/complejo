const { z } = require('zod');

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    cantidad: z.number().int().positive(),
  })).min(1),
  total: z.number().optional(), // El backend lo recalculará
  type: z.enum(['Mesa', 'Para llevar', 'Delivery', 'Comer en el complejo']),
  mesa: z.string().optional(),
  cliente: z.string().optional(),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'mercadopago']).optional().default('efectivo'),
  status: z.string().optional(),
});

const movementSchema = z.object({
  tipo: z.enum(['entrada', 'salida']),
  categoria: z.string().min(1),
  monto: z.number().positive(),
  descripcion: z.string().optional(),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'mercadopago']).optional().default('efectivo'),
  origen: z.string().optional(),
  session_id: z.string().optional(),
});

const stockUpdateSchema = z.object({
  stock: z.number().nonnegative().optional(),
  quantity: z.number().positive().optional(),
  type: z.enum(['Ingreso', 'Salida', 'Ajuste_Positivo', 'Venta', 'Pérdida']).optional(),
}).refine(data => data.stock !== undefined || (data.quantity !== undefined && data.type !== undefined), {
  message: "Debe proveer 'stock' absoluto o 'quantity' + 'type' para ajuste relativo"
});

module.exports = {
  orderSchema,
  movementSchema,
  stockUpdateSchema
};
