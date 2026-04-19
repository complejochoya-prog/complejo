import { 
    useConfig as useCentralConfig, 
    ConfigContext as CentralContext 
} from '../../../core/services/ConfigContext';

/**
 * useConfig Hook Proxy
 * Redirects to the centralized ConfigContext to avoid duplicate context issues.
 */
export function useConfig() {
    return useCentralConfig();
}

// Re-export the context too for components that need it (e.g. for Class Components or direct access)
export const ConfigContext = CentralContext;
