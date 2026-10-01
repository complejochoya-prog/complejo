/**
 * Helper para generación de imágenes con IA basadas en el nombre y categoría del producto.
 * Analiza gastronómicamente el nombre del producto para construir un prompt ultra-realista.
 */

export function generateProductPrompt(nombre = '', categoria = '') {
    const n = (nombre || '').toLowerCase();
    const c = (categoria || '').toLowerCase();

    let styleContext = "gourmet restaurant food photography, delicious culinary presentation, studio lighting, dark modern aesthetic, shallow depth of field, 8k resolution, Michelin star dining style";

    if (
        n.includes('parrilla') || n.includes('parrillada') || n.includes('asado') || 
        n.includes('carne') || n.includes('bife') || n.includes('costillar') || 
        n.includes('vacio') || n.includes('entraña') || n.includes('chorizo') || 
        n.includes('morcilla') || c.includes('carne') || c.includes('parrilla')
    ) {
        styleContext = "gourmet Argentine barbecue steakhouse, sizzling premium grilled cuts of meat on rustic wooden cutting board, smoky charcoal embers glow in dark background, fresh rosemary sprig and coarse sea salt, ultra realistic mouth-watering culinary photography";
    } else if (n.includes('burger') || n.includes('hamburguesa') || c.includes('burger')) {
        styleContext = "mouth-watering artisan smash burger, double juicy grilled beef patty, melted gooey cheddar cheese, crispy bacon strips, fresh crisp lettuce and heirloom tomato, toasted brioche bun, side of crispy golden french fries, moody gastrobar atmospheric lighting";
    } else if (n.includes('pizza') || c.includes('pizza')) {
        styleContext = "artisan Neapolitan pizza with blistered charred crispy crust, hot melted bubbling mozzarella cheese pull, rich San Marzano tomato sauce, fresh fragrant basil leaves, extra virgin olive oil drizzle, wood-fired brick oven ambiance in background";
    } else if (n.includes('lomo') || n.includes('lomito') || n.includes('sandwich') || n.includes('baguette')) {
        styleContext = "gourmet Argentine lomito sandwich, tender grilled beef steak, melted cheese, sunny-side fried egg, crispy bacon, ham, fresh lettuce and tomato in warm crusty artisan ciabatta bread, wooden board presentation";
    } else if (n.includes('pasta') || n.includes('ravioles') || n.includes('fideos') || n.includes('sorrentinos') || n.includes('ñoquis') || c.includes('pasta')) {
        styleContext = "authentic Italian gourmet pasta dish, rich savory artisanal sauce, freshly grated parmesan cheese falling over, fresh basil leaves, served in elegant matte black restaurant ceramic bowl";
    } else if (n.includes('taco') || n.includes('quesadilla') || n.includes('nacho') || c.includes('taco')) {
        styleContext = "vibrant street-style Mexican tacos, seasoned grilled meat, diced white onions, fresh cilantro, lime wedges, creamy guacamole, salsa verde, warm corn tortillas, colorful festive presentation";
    } else if (n.includes('papas') || n.includes('fritas') || n.includes('papas con queso') || c.includes('papas')) {
        styleContext = "mound of extra crispy golden french fries, drenched in hot melted rich cheddar cheese sauce, crispy smoked bacon bits, chopped fresh green scallions, dark gastrobar appetizer styling";
    } else if (n.includes('ensalada') || n.includes('salad') || c.includes('ensalada')) {
        styleContext = "fresh vibrant gourmet salad bowl, crisp mixed artisan greens, sweet cherry tomatoes, sliced creamy avocado, grilled marinated chicken breast, delicate balsamic reduction drizzle";
    } else if (
        n.includes('fernet') || n.includes('cocktail') || n.includes('trago') || 
        n.includes('gin') || n.includes('mojito') || n.includes('vodka') || 
        n.includes('whisky') || n.includes('aperol') || n.includes('campari') || 
        n.includes('negroni') || n.includes('margarita') || c.includes('trago')
    ) {
        styleContext = "handcrafted artisan cocktail in luxury crystal glassware, crystal clear carved ice sphere, fresh citrus twist garnish, botanical sprig, condensation droplets on glass, atmospheric dimly lit cocktail lounge background with warm bokeh";
    } else if (n.includes('cerveza') || n.includes('beer') || n.includes('ipa') || n.includes('pinta') || n.includes('stout') || c.includes('cerveza')) {
        styleContext = "chilled craft beer in heavy glass pint, thick creamy foam head, frosty condensation droplets, warm rustic tavern ambient lighting";
    } else if (n.includes('cafe') || n.includes('café') || n.includes('cappuccino') || n.includes('latte') || n.includes('espresso') || c.includes('cafeteria')) {
        styleContext = "artisanal specialty coffee cup with intricate swan latte art, roasted coffee beans scattered on slate board, soft warm cozy coffee house ambient glow";
    } else if (n.includes('torta') || n.includes('postre') || n.includes('helado') || n.includes('flan') || n.includes('chocotorta') || n.includes('volcan') || c.includes('postre') || c.includes('torta')) {
        styleContext = "decadent pastry dessert slice, rich chocolate fudge drizzle, fresh ripe red berries, dusting of powdered sugar, elegant fine dining plating";
    } else if (n.includes('licuado') || n.includes('jugo') || n.includes('smoothie') || c.includes('licuado')) {
        styleContext = "fresh tropical fruit smoothie in tall frosted glass, colorful fruit skewers garnish, ice cubes, vibrant bright refreshing cafe lighting";
    } else if (n.includes('gaseosa') || n.includes('coca') || n.includes('sprite') || n.includes('agua') || c.includes('bebida')) {
        styleContext = "refreshing cold drink in crystal glass filled with clear ice cubes, fresh lemon slice, sparkling carbonated fizz bubbles, bar counter lighting";
    }

    return `commercial food photography of ${nombre}, ${styleContext}`;
}

/**
 * Genera la URL de Pollinations IA a partir del nombre y la categoría
 */
export function buildProductAIImageUrl(nombre = '', categoria = '') {
    if (!nombre) return '';
    const prompt = generateProductPrompt(nombre, categoria);
    const randomSeed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=600&nologo=true&seed=${randomSeed}`;
}

/**
 * Carga de forma asíncrona la imagen generada por IA para asegurar que esté lista en caché del navegador
 */
export function preloadAIImage(url) {
    return new Promise((resolve, reject) => {
        if (!url) return reject(new Error('No URL provided'));
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(url); // Resolver igual con fallback para no bloquear lote
        img.src = url;
    });
}
