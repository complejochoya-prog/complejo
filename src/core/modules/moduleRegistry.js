/**
 * Module Registry — Central list of all available modules.
 * Each module exports: { id, name, routes }
 */
import { CoreModule } from '../../modules/core';
import { AdminModule } from '../../modules/admin';
import { ReservasModule } from '../../modules/reservas';
import { BarModule } from '../../modules/bar';
import { InventarioModule } from '../../modules/inventario';
import { CajaModule } from '../../modules/caja';
import { EmpleadosModule } from '../../modules/empleados';
import { ReportesModule } from '../../modules/reportes';
import { SuperAdminModule } from '../../modules/superadmin';

const moduleRegistry = [
    CoreModule,
    AdminModule,
    ReservasModule,
    BarModule,
    InventarioModule,
    CajaModule,
    EmpleadosModule,
    ReportesModule,
    SuperAdminModule,
];

export function getModules() {
    return moduleRegistry;
}

export function getModuleById(id) {
    return moduleRegistry.find(m => m.id === id) || null;
}

export default moduleRegistry;
