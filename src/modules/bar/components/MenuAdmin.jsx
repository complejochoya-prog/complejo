import React, { useEffect, useState } from "react";
import { getProducts, createProduct } from "../services/productsService";

/**
 * MenuAdmin: Administrative interface to manage bar products, prices, and stock.
 */
export default function MenuAdmin() {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCrear() {
        if (!name || !price) return alert("Completa nombre y precio");
        
        try {
            await createProduct({
                name,
                price: Number(price),
                stock: 100, // Initial default stock
                category: "bar"
            });
            setName("");
            setPrice("");
            loadProducts();
        } catch (error) {
            alert("Error al crear producto");
        }
    }

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', backgroundColor: '#f7fafc', minHeight: '100vh' }}>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ color: '#2d3748', margin: 0 }}>Menú del Bar</h1>
                <p style={{ color: '#718096', marginTop: '5px' }}>Gestiona los productos, precios e inventario del bar.</p>
            </div>

            <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '15px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                marginBottom: '40px',
                border: '1px solid #e2e8f0'
            }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>Añadir Nuevo Producto</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <input
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e0', flex: 2, minWidth: '200px' }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Hamburguesa con Papas"
                    />
                    <input
                        type="number"
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e0', flex: 1 }}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Precio"
                    />
                    <button 
                        onClick={handleCrear}
                        style={{
                            backgroundColor: '#3182ce',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        + Crear Producto
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {products.map(p => (
                    <div key={p._id} style={{ 
                        backgroundColor: 'white', 
                        padding: '25px', 
                        borderRadius: '15px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                            <h4 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem' }}>{p.name}</h4>
                            <span style={{ 
                                backgroundColor: p.stock < 10 ? '#fff5f5' : '#f0fff4',
                                color: p.stock < 10 ? '#c53030' : '#2f855a',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                Stock: {p.stock}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#2b6cb0', fontSize: '1.4rem' }}>
                                ${p.price.toLocaleString()}
                            </span>
                            <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>{p.category}</span>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '100px', color: '#a0aec0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🥪</div>
                    <p>El menú está vacío. ¡Empieza a crear productos!</p>
                </div>
            )}
        </div>
    );
}
