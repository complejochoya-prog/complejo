const { auth } = require('../utils/firebase');

const verifyAuthToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No autorizado / Token faltante' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);
        
        req.negocioId = req.headers['x-negocio-id'] || decodedToken.negocioId;
        req.user = decodedToken;

        const isSaasRoute = req.originalUrl.includes('/api/saas');
        if (!req.negocioId && !isSaasRoute) {
            return res.status(400).json({ message: 'negocioId faltante en token o headers' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(403).json({ message: 'Token inválido' });
    }
};

const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // Always extract negocioId from header if present
    req.negocioId = req.headers['x-negocio-id'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);
        req.negocioId = req.negocioId || decodedToken.negocioId;
        req.user = decodedToken;
        next();
    } catch (error) {
        // Just continue without user if token is invalid
        next();
    }
};

module.exports = { verifyAuthToken, optionalAuth };
