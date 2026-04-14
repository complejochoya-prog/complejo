import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Trophy, Users, Calendar, Table, 
    Target, Share2, Printer, Settings, Play 
} from 'lucide-react';
import { useTournament } from '../hooks/useTournament';
import StandingsTable from '../components/StandingsTable';
import MatchCard from '../components/MatchCard';
import ScorersTable from '../components/ScorersTable';
import { useLocation } from 'react-router-dom';
import { Save, AlertCircle, Plus, Trash2 as TrashIcon, CheckCircle2 } from 'lucide-react';


export default function TournamentDetail() {
    const { tournamentId, negocioId } = useParams();
    const navigate = useNavigate();
    const { tournaments, getStandings, getMatches, getScorers } = useTournament(negocioId);
    
    const [tournament, setTournament] = useState(null);
    const [activeTab, setActiveTab] = useState('standings'); // standings, matches, scorers
    const [standings, setStandings] = useState([]);
    const [matches, setMatches] = useState([]);
    const [scorers, setScorers] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const isAdminMode = location.pathname.includes('/admin/');
    const { saveDetails } = useTournament(negocioId);
    
    const [isManaging, setIsManaging] = useState(false);
    const [manageData, setManageData] = useState({
        campeon: '',
        goleador: '',
        standings: [],
        matches: [],
        scorers: []
    });


    useEffect(() => {
        const loadTournamentData = async () => {
            if (tournaments.length > 0) {
                const found = tournaments.find(t => t.id === tournamentId);
                setTournament(found);
                
                try {
                    const [s, m, sc] = await Promise.all([
                        getStandings(tournamentId),
                        getMatches(tournamentId),
                        getScorers(tournamentId)
                    ]);
                    setStandings(s);
                    setMatches(m);
                    setScorers(sc);
                } catch (err) {
                    console.error("Error loading tournament details:", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadTournamentData();
    }, [tournamentId, tournaments]);

    const handleOpenManage = () => {
        setManageData({
            campeon: tournament.campeon || '',
            goleador: tournament.goleador || '',
            standings: [...standings],
            matches: [...matches],
            scorers: [...scorers]
        });
        setIsManaging(true);
    };

    const handleSaveManage = async () => {
        const success = await saveDetails(tournamentId, manageData);
        if (success) {
            setIsManaging(false);
        }
    };


    if (loading || !tournament) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: 'standings', label: 'Posiciones', icon: Table },
        { id: 'matches', label: 'Fixture / Resultados', icon: Calendar },
        { id: 'scorers', label: 'Goleadores', icon: Target },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Nav & Header */}
            <div className="flex flex-col gap-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest w-fit"
                >
                    <ChevronLeft size={16} /> Volver a torneos
                </button>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                <Trophy size={24} />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                                {tournament.nombre}
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
                                Formato: {tournament.formato}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                                {tournament.equipos} Equipos Participando
                            </span>
                            {tournament.campeon && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Campeón: {tournament.campeon}
                                </span>
                            )}
                            {tournament.goleador && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1">
                                    <Target size={12} /> Goleador: {tournament.goleador}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="bg-slate-900 border border-white/10 p-4 rounded-2xl text-slate-400 hover:text-white transition-colors" title="Exportar / Imprimir">
                            <Printer size={20} />
                        </button>
                        <button className="bg-slate-900 border border-white/10 p-4 rounded-2xl text-slate-400 hover:text-white transition-colors" title="Compartir Resultados">
                            <Share2 size={20} />
                        </button>
                        {isAdminMode && (
                            <button 
                                onClick={handleOpenManage}
                                className="bg-indigo-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
                            >
                                <Settings size={18} /> Gestionar Datos
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center p-1.5 bg-slate-950 border border-white/5 rounded-3xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {activeTab === 'standings' && <StandingsTable standings={standings} />}
                    
                    {activeTab === 'matches' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-4 italic">Resultados Recientes y Próximos</h3>
                                <button className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:underline">Generar Fecha</button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {matches.map(m => (
                                    <MatchCard key={m.id} match={m} onSetResult={(match) => console.log("Set result for", match.id)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'scorers' && (
                        <div className="hidden lg:block">
                            <ScorersTable scorers={scorers} />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Public Screen Integration Widget */}
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 opacity-5 blur-sm overflow-hidden pointer-events-none">
                            <Play size={120} className="text-emerald-500" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Pantalla en Vivo
                        </h4>
                        <p className="text-white font-black italic uppercase text-lg leading-tight mb-4">Transmitir tabla a pantallas TV del complejo</p>
                        <button className="w-full bg-slate-950 border border-white/10 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all">
                            <Play size={14} fill="currentColor" /> Proyectar ahora
                        </button>
                    </div>

                    <div className="lg:hidden">
                        <ScorersTable scorers={scorers} />
                    </div>

                    {/* Quick Stats Sidebar */}
                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[32px] space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 border-b border-white/5 pb-4 italic">Información Progresiva</h4>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-1">Mejor Defensa</span>
                                <span className="text-sm font-black text-white italic uppercase">Los Pibes FC (3 GC)</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-1">Mejor Ataque</span>
                                <span className="text-sm font-black text-white italic uppercase">Los Pibes FC (15 GF)</span>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-1">Próxima Fecha</span>
                                <span className="text-sm font-black text-indigo-400 italic uppercase">Viernes 20 de Marzo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Management Modal */}
            {isManaging && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950/20">
                            <div>
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Gestionar Torneo</h3>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Panel de administración de resultados y estadísticas</p>
                            </div>
                            <button 
                                onClick={() => setIsManaging(false)} 
                                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft size={24} className="rotate-90" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Champions & Scorers */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Trophy size={14} /> Campeón del Torneo
                                    </label>
                                    <input 
                                        type="text"
                                        value={manageData.campeon}
                                        onChange={e => setManageData({...manageData, campeon: e.target.value})}
                                        placeholder="Nombre del equipo campeón"
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Target size={14} /> Goleador del Torneo
                                    </label>
                                    <input 
                                        type="text"
                                        value={manageData.goleador}
                                        onChange={e => setManageData({...manageData, goleador: e.target.value})}
                                        placeholder="Nombre del goleador estrella"
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-amber-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Standings Management */}
                            <div className="pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Table size={14} /> Tabla de Posiciones
                                    </h4>
                                    <button 
                                        onClick={() => setManageData({
                                            ...manageData, 
                                            standings: [...manageData.standings, { pos: manageData.standings.length + 1, equipo: '', pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]
                                        })}
                                        className="text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 hover:bg-indigo-500/10 px-4 py-2 rounded-xl transition-all"
                                    >
                                        <Plus size={12} strokeWidth={3} /> Agregar Equipo
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {manageData.standings.map((s, idx) => (
                                        <div key={idx} className="flex gap-3 items-center bg-slate-950/50 p-3 rounded-2xl border border-white/5 group">
                                            <input 
                                                type="number" value={s.pos} className="w-12 bg-transparent text-center font-black text-xs text-slate-500"
                                                onChange={e => {
                                                    const newS = [...manageData.standings];
                                                    newS[idx].pos = parseInt(e.target.value);
                                                    setManageData({...manageData, standings: newS});
                                                }}
                                            />
                                            <input 
                                                type="text" placeholder="Nombre Equipo" value={s.equipo} className="flex-1 bg-transparent font-bold text-sm text-white outline-none"
                                                onChange={e => {
                                                    const newS = [...manageData.standings];
                                                    newS[idx].equipo = e.target.value;
                                                    setManageData({...manageData, standings: newS});
                                                }}
                                            />
                                            <div className="flex items-center gap-2">
                                                {['pj', 'pg', 'pe', 'pp', 'pts'].map(field => (
                                                    <div key={field} className="flex flex-col items-center">
                                                        <span className="text-[8px] font-black uppercase text-slate-600 mb-1">{field}</span>
                                                        <input 
                                                            type="number" value={s[field]} className="w-10 bg-slate-900 rounded-lg text-center text-xs font-bold py-1"
                                                            onChange={e => {
                                                                const newS = [...manageData.standings];
                                                                newS[idx][field] = parseInt(e.target.value);
                                                                setManageData({...manageData, standings: newS});
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newS = manageData.standings.filter((_, i) => i !== idx);
                                                    setManageData({...manageData, standings: newS});
                                                }}
                                                className="w-8 h-8 rounded-xl bg-transparent text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <TrashIcon size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fixture Management */}
                            <div className="pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Calendar size={14} /> Fixture / Partidos
                                    </h4>
                                    <button 
                                        onClick={() => setManageData({
                                            ...manageData, 
                                            matches: [...manageData.matches, { id: `m_${Date.now()}`, fecha: '', hora: '', local: '', visitante: '', goles_local: null, goles_visitante: null, estado: 'pendiente' }]
                                        })}
                                        className="text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 hover:bg-indigo-500/10 px-4 py-2 rounded-xl transition-all"
                                    >
                                        <Plus size={12} strokeWidth={3} /> Agregar Partido
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {manageData.matches.map((m, idx) => (
                                        <div key={idx} className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 flex flex-wrap lg:flex-nowrap gap-4 items-center group">
                                            <div className="flex flex-col gap-2 min-w-[120px]">
                                                <input type="date" value={m.fecha} onChange={e => {
                                                    const newM = [...manageData.matches]; newM[idx].fecha = e.target.value; setManageData({...manageData, matches: newM});
                                                }} className="bg-slate-900 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-400 outline-none" />
                                                <input type="time" value={m.hora} onChange={e => {
                                                    const newM = [...manageData.matches]; newM[idx].hora = e.target.value; setManageData({...manageData, matches: newM});
                                                }} className="bg-slate-900 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-400 outline-none" />
                                            </div>
                                            
                                            <div className="flex-1 flex items-center justify-between gap-4 font-black italic uppercase text-xs">
                                                <input type="text" placeholder="Local" value={m.local} onChange={e => {
                                                    const newM = [...manageData.matches]; newM[idx].local = e.target.value; setManageData({...manageData, matches: newM});
                                                }} className="flex-1 bg-transparent text-right outline-none text-white focus:text-indigo-400" />
                                                
                                                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-white/5">
                                                    <input type="number" value={m.goles_local ?? ''} onChange={e => {
                                                        const newM = [...manageData.matches]; newM[idx].goles_local = e.target.value === '' ? null : parseInt(e.target.value); setManageData({...manageData, matches: newM});
                                                    }} className="w-8 bg-transparent text-center text-white" />
                                                    <span className="text-[10px] text-slate-600 font-bold">-</span>
                                                    <input type="number" value={m.goles_visitante ?? ''} onChange={e => {
                                                        const newM = [...manageData.matches]; newM[idx].goles_visitante = e.target.value === '' ? null : parseInt(e.target.value); setManageData({...manageData, matches: newM});
                                                    }} className="w-8 bg-transparent text-center text-white" />
                                                </div>

                                                <input type="text" placeholder="Visitante" value={m.visitante} onChange={e => {
                                                    const newM = [...manageData.matches]; newM[idx].visitante = e.target.value; setManageData({...manageData, matches: newM});
                                                }} className="flex-1 bg-transparent text-left outline-none text-white focus:text-indigo-400" />
                                            </div>

                                            <select 
                                                value={m.estado} 
                                                onChange={e => {
                                                    const newM = [...manageData.matches]; newM[idx].estado = e.target.value; setManageData({...manageData, matches: newM});
                                                }}
                                                className="bg-slate-900 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-indigo-400 border border-white/5 outline-none"
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="en_curso">En vivo</option>
                                                <option value="finalizado">Finalizado</option>
                                            </select>

                                            <button 
                                                onClick={() => {
                                                    const newM = manageData.matches.filter((_, i) => i !== idx);
                                                    setManageData({...manageData, matches: newM});
                                                }}
                                                className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 items-center justify-center flex hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/5 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-3 text-slate-500">
                                <AlertCircle size={16} />
                                <p className="text-[9px] font-bold uppercase tracking-widest">Los cambios se verán reflejados inmediatamente para todos los usuarios</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setIsManaging(false)}
                                    className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSaveManage}
                                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    <Save size={16} /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
