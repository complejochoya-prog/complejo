import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import NavbarMobile from './NavbarMobile';
import useOnlineStatus from '../../../hooks/useOnlineStatus';

export default function ClientLayout() {
    const isOnline = useOnlineStatus();

    return (
        <div className="bg-slate-950 min-h-screen text-white font-inter relative">
            {!isOnline && (
                <div className="bg-red-500/90 text-white p-2 text-center text-xs font-bold uppercase tracking-widest sticky top-0 z-[200] backdrop-blur-md">
                    Sin conexión — modo offline (Guardando cambios localmente)
                </div>
            )}
            <NavbarMobile />
            <main className="pb-24 pt-16 md:pt-0">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
