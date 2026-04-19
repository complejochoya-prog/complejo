/**
 * ConfigContext Proxy (Unificacin de Servicios)
 * Este archivo redirige las peticiones al contexto central en /src/core/services
 * para evitar duplicados en el bundle y asegurar que todo el sistema use la 
 * misma fuente de verdad (Source of Truth).
 */
export { useConfig, ConfigContext, ConfigProvider as default, ConfigProvider } from '../../../core/services/ConfigContext';
