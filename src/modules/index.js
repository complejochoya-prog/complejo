import { CoreModule } from './core';
import { BarModule } from './bar';
import { ReservasModule } from './reservas';
import { CocinaModule } from './cocina';
import { InventarioModule } from './inventario';
import { CajaModule } from './caja';
import { EmpleadosModule } from './empleados';
import { TorneosModule } from './torneos';
import { ClientesModule } from './clientes';
import { PromocionesModule } from './promociones';
import { ReportesModule } from './reportes';
import { SuperAdminModule } from './superadmin';
import { ReportsModule } from './reports';

export const SystemModules = [
    CoreModule,
    CajaModule,
    EmpleadosModule,
    InventarioModule,
    ReservasModule,
    BarModule,
    CocinaModule,
    TorneosModule,
    ClientesModule,
    PromocionesModule,
    ReportesModule,
    SuperAdminModule,
    ReportsModule
];
