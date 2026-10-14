import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    ChevronLeft, Trophy, Users, Calendar, Table, 
    Target, Share2, Printer, Settings, Play, Plus, 
    Trash2, Edit3, Save, CheckCircle2, Shield, 
    AlertTriangle, Clock, MapPin, Award, X, 
    Sparkles, RefreshCw, Star, Phone, MessageCircle, FileText
} from 'lucide-react';
import { useTournament } from '../hooks/useTournament';
import { useAuth } from '../../../context/AuthContext';
import StandingsTable from '../components/StandingsTable';
import MatchCard from '../components/MatchCard';
import ScorersTable from '../components/ScorersTable';
import { 
    recalculateStandingsFromMatches, 
    recalculateScorersFromMatches, 
    recalculateCardsFromMatches 
} from '../services/tournamentService';

export default function TournamentDetail() {
    const { tournamentId, negocioId: paramsNegocioId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const negocioId = paramsNegocioId || 'giovanni';

    const { user, isAuthenticated } = useAuth();
    // Solo administradores y encargados pueden editar datos del torneo
    const isAdminRole = isAuthenticated && Boolean(
        user && ['admin', 'superadmin', 'encargado', 'admin_principal', 'administrativo'].includes(user.role)
    );
    const isAdminRoute = location.pathname.includes('/admin');
    const canEdit = isAdminRole;
    
    const { tournaments, saveDetails, loading } = useTournament(negocioId);
    
    const [tournament, setTournament] = useState(null);

    // Sincronizar pestaña inicial con ?tab= de la URL
    const getInitialTab = () => {
        const queryTab = new URLSearchParams(location.search).get('tab');
        if (queryTab && ['standings', 'matches', 'teams', 'scorers', 'awards'].includes(queryTab)) {
            return queryTab;
        }
        return 'standings';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab); // standings, matches, teams, scorers, awards
    const [standings, setStandings] = useState([]);
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [scorers, setScorers] = useState([]);
    const [tarjetas, setTarjetas] = useState([]);
    
    // Modales
    const [matchModal, setMatchModal] = useState(null); // null o match object para editar planilla
    const [teamModal, setTeamModal] = useState(null); // null o team object para alta/edición
    const [awardsModal, setAwardsModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState('');

    const showNotice = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 4000);
    };

    // Sincronizar activeTab cuando cambia el search en la URL
    useEffect(() => {
        const tabParam = new URLSearchParams(location.search).get('tab');
        if (tabParam && ['standings', 'matches', 'teams', 'scorers', 'awards'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const params = new URLSearchParams(location.search);
        params.set('tab', tabId);
        navigate({ search: params.toString() }, { replace: true });
    };

    // Cargar torneo seleccionado
    useEffect(() => {
        if (tournaments && tournaments.length > 0) {
            const found = tournaments.find(t => String(t.id) === String(tournamentId)) || tournaments[0];
            setTournament(found);
            setStandings(found.standings || []);
            setMatches(found.matches || []);
            setTeams(found.teams || []);
            setScorers(found.scorers || recalculateScorersFromMatches(found.matches || []));
            setTarjetas(found.tarjetas || recalculateCardsFromMatches(found.matches || []));
        }
    }, [tournamentId, tournaments]);

    if (loading || !tournament) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ─── Guardar partido y planilla ──────────────────────────────────────
    const handleSaveMatch = async (e) => {
        e.preventDefault();
        if (!canEdit) return;
        setSaving(true);
        try {
            const isNew = !matches.some(m => m.id === matchModal.id);
            const updatedMatches = isNew 
                ? [matchModal, ...matches]
                : matches.map(m => m.id === matchModal.id ? matchModal : m);

            // Recalcular posiciones, goleadores y tarjetas automáticamente
            const autoStandings = recalculateStandingsFromMatches(teams, updatedMatches);
            const autoScorers = recalculateScorersFromMatches(updatedMatches);
            const autoTarjetas = recalculateCardsFromMatches(updatedMatches);

            const detailsToSave = {
                matches: updatedMatches,
                standings: autoStandings.length > 0 ? autoStandings : standings,
                scorers: autoScorers.length > 0 ? autoScorers : scorers,
                tarjetas: autoTarjetas.length > 0 ? autoTarjetas : tarjetas
            };

            await saveDetails(tournament.id, detailsToSave);
            setMatches(updatedMatches);
            setStandings(detailsToSave.standings);
            setScorers(detailsToSave.scorers);
            setTarjetas(detailsToSave.tarjetas);
            setMatchModal(null);
            showNotice('¡Partido y planilla guardados con éxito!');
        } catch (err) {
            console.error(err);
            alert('Error al guardar el partido.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMatch = async (matchId) => {
        if (!canEdit) return;
        if (!window.confirm('¿Eliminar este partido del fixture?')) return;
        const updatedMatches = matches.filter(m => m.id !== matchId);
        const autoStandings = recalculateStandingsFromMatches(teams, updatedMatches);
        await saveDetails(tournament.id, { 
            matches: updatedMatches, 
            standings: autoStandings.length > 0 ? autoStandings : standings 
        });
        setMatches(updatedMatches);
        setStandings(autoStandings);
        showNotice('Partido eliminado.');
    };

    // ─── Guardar equipo ──────────────────────────────────────────────────
    const handleSaveTeam = async (e) => {
        e.preventDefault();
        if (!canEdit) return;
        setSaving(true);
        try {
            const isNew = !teams.some(t => t.id === teamModal.id);
            const teamPayload = {
                ...teamModal,
                id: teamModal.id || `eq-${Date.now()}`,
                jugadores: Array.isArray(teamModal.jugadores) 
                    ? teamModal.jugadores 
                    : (typeof teamModal.jugadores === 'string' 
                        ? teamModal.jugadores.split(',').map(j => j.trim()).filter(Boolean)
                        : [])
            };

            const updatedTeams = isNew 
                ? [...teams, teamPayload]
                : teams.map(t => t.id === teamPayload.id ? teamPayload : t);

            const autoStandings = recalculateStandingsFromMatches(updatedTeams, matches);

            await saveDetails(tournament.id, {
                teams: updatedTeams,
                equiposCount: updatedTeams.length,
                standings: autoStandings
            });

            setTeams(updatedTeams);
            setStandings(autoStandings);
            setTeamModal(null);
            showNotice('¡Equipo guardado exitosamente!');
        } catch (err) {
            console.error(err);
            alert('Error al guardar el equipo.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTeam = async (teamId, teamName) => {
        if (!canEdit) return;
        if (!window.confirm(`¿Eliminar al equipo "${teamName}" del torneo?`)) return;
        const updatedTeams = teams.filter(t => t.id !== teamId);
        const autoStandings = recalculateStandingsFromMatches(updatedTeams, matches);
        await saveDetails(tournament.id, {
            teams: updatedTeams,
            equiposCount: updatedTeams.length,
            standings: autoStandings
        });
        setTeams(updatedTeams);
        setStandings(autoStandings);
        showNotice('Equipo eliminado del torneo.');
    };

    // ─── Recalcular todo a mano ──────────────────────────────────────────
    const handleRecalculateAll = async () => {
        if (!canEdit) return;
        const autoStandings = recalculateStandingsFromMatches(teams, matches);
        const autoScorers = recalculateScorersFromMatches(matches);
        const autoTarjetas = recalculateCardsFromMatches(matches);
        await saveDetails(tournament.id, {
            standings: autoStandings,
            scorers: autoScorers,
            tarjetas: autoTarjetas
        });
        setStandings(autoStandings);
        setScorers(autoScorers);
        setTarjetas(autoTarjetas);
        showNotice('¡Tabla de posiciones y estadísticas recalculadas!');
    };

    // ─── Guardar Cuadro de Honor / Premios ────────────────────────────────
    const handleSaveAwards = async (e) => {
        e.preventDefault();
        if (!canEdit) return;
        setSaving(true);
        try {
            await saveDetails(tournament.id, {
                campeon: tournament.campeon,
                subcampeon: tournament.subcampeon,
                goleador: tournament.goleador,
                mejorJugador: tournament.mejorJugador,
                mejorArquero: tournament.mejorArquero,
                vallaMenosVencida: tournament.vallaMenosVencida,
            });
            setAwardsModal(false);
            showNotice('¡Cuadro de honor y premiaciones actualizados!');
        } catch (err) {
            console.error(err);
            alert('Error al guardar premiaciones.');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'standings', label: 'Posiciones', icon: Table, count: standings.length },
        { id: 'matches', label: 'Fixture / Partidos', icon: Calendar, count: matches.length },
        { id: 'teams', label: 'Equipos y Planteles', icon: Users, count: teams.length },
        { id: 'scorers', label: 'Goleadores y Tarjetas', icon: Target, count: scorers.length },
        { id: 'awards', label: 'Cuadro de Honor', icon: Award, count: null },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header del Torneo */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => navigate(isAdminRoute ? `/${negocioId}/admin/torneos` : `/${negocioId}/torneos`)}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest w-fit"
                    >
                        <ChevronLeft size={16} /> {isAdminRoute ? 'Volver al panel de torneos' : 'Volver a torneos'}
                    </button>

                    {isAdminRole && (
                        isAdminRoute ? (
                            <button
                                onClick={() => navigate(`/${negocioId}/torneos/${tournament.id}?tab=${activeTab}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-500/20 transition-all"
                                title="Ver vista pública para clientes"
                            >
                                <Share2 size={12} /> Ver Vista Pública
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/${negocioId}/admin/torneos/${tournament.id}?tab=${activeTab}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider hover:bg-amber-500/20 transition-all"
                                title="Ir al panel de administración del torneo"
                            >
                                <Shield size={12} /> Panel de Administración
                            </button>
                        )
                    )}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                                <Trophy size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                                    {tournament.nombre}
                                </h1>
                                <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">
                                    {tournament.formato} · {tournament.sede || 'Complejo Deportivo'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                                {teams.length} Equipos Inscriptos
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
                                {matches.filter(m => m.estado === 'finalizado').length} de {matches.length} Partidos Jugados
                            </span>
                            {tournament.campeon && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                                    <CheckCircle2 size={13} /> Campeón: {tournament.campeon}
                                </span>
                            )}
                            {tournament.mejorJugador && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
                                    <Award size={13} /> MVP: {tournament.mejorJugador}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Acciones principales de administración - solo administradores */}
                    {canEdit && (
                        <div className="flex flex-wrap items-center gap-3">
                            <button 
                                onClick={handleRecalculateAll}
                                className="bg-slate-900 border border-white/10 px-4 py-3.5 rounded-2xl text-slate-300 hover:text-white hover:border-indigo-500 transition-all text-xs font-black uppercase tracking-wider flex items-center gap-2"
                                title="Recalcular tabla de posiciones automáticamente con los partidos finalizados"
                            >
                                <RefreshCw size={15} /> Recalcular Tablas
                            </button>
                            <button 
                                onClick={() => setAwardsModal(true)}
                                className="bg-amber-600/20 text-amber-400 border border-amber-500/30 px-5 py-3.5 rounded-2xl flex items-center gap-2 font-black uppercase tracking-wider text-xs hover:bg-amber-500 hover:text-white transition-all shadow-lg"
                            >
                                <Award size={16} /> Premiaciones
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {notification && (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-bold animate-in fade-in">
                    <CheckCircle2 size={18} />
                    <span>{notification}</span>
                </div>
            )}

            {/* Pestañas de Navegación */}
            <div className="flex gap-2 border-b border-white/5 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3.5 text-[11px] font-black uppercase tracking-widest border-b-2 -mb-px transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'border-indigo-500 text-white' 
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                        {tab.count !== null && (
                            <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[9px]">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ─── Pestaña 1: TABLA DE POSICIONES ─────────────────────────────────── */}
            {activeTab === 'standings' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Tabla actualizada en tiempo real según los resultados cargados
                        </p>
                        {canEdit && (
                            <button 
                                onClick={() => {
                                    const newTeam = { id: `eq-${Date.now()}`, nombre: '', logo: '', capitan: '', telefono: '', color: '#3b82f6', jugadores: [] };
                                    setTeamModal(newTeam);
                                }}
                                className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Agregar Equipo
                            </button>
                        )}
                    </div>
                    <StandingsTable standings={standings} />
                </div>
            )}

            {/* ─── Pestaña 2: FIXTURE Y PARTIDOS ──────────────────────────────────── */}
            {activeTab === 'matches' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                                Fixture y Partidos
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Fechas, horarios, canchas asignadas y resultados oficiales
                            </p>
                        </div>
                        {canEdit && (
                            <button 
                                onClick={() => {
                                    setMatchModal({
                                        id: `m_${Date.now()}`,
                                        jornada: `Fecha ${matches.length + 1}`,
                                        fecha: new Date().toISOString().split('T')[0],
                                        hora: '20:00',
                                        cancha: 'Cancha 1 (Fútbol 5)',
                                        local: teams[0]?.nombre || '',
                                        visitante: teams[1]?.nombre || '',
                                        localLogo: teams[0]?.logo || '',
                                        visitanteLogo: teams[1]?.logo || '',
                                        goles_local: null,
                                        goles_visitante: null,
                                        estado: 'pendiente',
                                        goleadores: [],
                                        amarillas: [],
                                        rojas: [],
                                        mvp: '',
                                        mejorArquero: '',
                                        notas: ''
                                    });
                                }}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                            >
                                <Plus size={16} /> Programar Partido
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {matches.map(m => (
                            <MatchCard 
                                key={m.id} 
                                match={m} 
                                isAdmin={canEdit}
                                onEditMatch={canEdit ? (match) => setMatchModal({ ...match }) : null} 
                            />
                        ))}
                    </div>

                    {matches.length === 0 && (
                        <div className="p-12 glass-premium rounded-[32px] border border-white/5 text-center text-slate-500 uppercase tracking-widest text-xs font-bold">
                            {canEdit 
                                ? 'No hay partidos programados todavía. Hacé clic en "Programar Partido" para armar el fixture.' 
                                : 'No hay partidos programados todavía para este torneo.'}
                        </div>
                    )}
                </div>
            )}

            {/* ─── Pestaña 3: EQUIPOS Y PLANTELES ─────────────────────────────────── */}
            {activeTab === 'teams' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                                Equipos Participantes
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {teams.length} equipos confirmados
                            </p>
                        </div>
                        {canEdit && (
                            <button 
                                onClick={() => {
                                    setTeamModal({
                                        id: `eq-${Date.now()}`,
                                        nombre: '',
                                        logo: '',
                                        capitan: '',
                                        telefono: '',
                                        color: '#3b82f6',
                                        jugadores: []
                                    });
                                }}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                            >
                                <Plus size={16} /> Cargar Equipo
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map(t => {
                            const digits = (t.telefono || '').replace(/[^0-9]/g, '');
                            return (
                                <div key={t.id} className="glass-premium p-6 rounded-3xl border border-white/5 space-y-4 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                {t.logo ? (
                                                    <img 
                                                        src={t.logo} 
                                                        alt={t.nombre} 
                                                        className="w-12 h-12 rounded-2xl object-cover border border-white/10 shrink-0 bg-slate-950" 
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div 
                                                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-lg"
                                                        style={{ backgroundColor: t.color || '#3b82f6' }}
                                                    >
                                                        {(t.nombre || 'E').slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-base font-black text-white uppercase italic">{t.nombre}</h4>
                                                    {t.capitan && (
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            Cap: {t.capitan}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {canEdit && t.telefono && (
                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                <Phone size={13} className="text-emerald-400" />
                                                <span>{t.telefono}</span>
                                            </div>
                                        )}

                                        {/* Jugadores */}
                                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">
                                                Plantel ({t.jugadores?.length || 0} jugadores)
                                            </span>
                                            {t.jugadores?.length > 0 ? (
                                                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                                                    {t.jugadores.join(' · ')}
                                                </p>
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">Sin jugadores cargados</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botones de acción - solo administración */}
                                    {canEdit && (
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <button 
                                                onClick={() => setTeamModal({ ...t })} 
                                                className="p-2 bg-slate-900 border border-white/5 rounded-lg text-indigo-400 hover:text-indigo-300 text-xs font-black uppercase flex items-center gap-1.5"
                                            >
                                                <Edit3 size={13} /> Editar
                                            </button>
                                            <div className="flex gap-2">
                                                {digits && (
                                                    <a 
                                                        href={`https://wa.me/${digits}?text=${encodeURIComponent(`Hola ${t.capitan || ''}, te contactamos de la organización del torneo.`)}`}
                                                        target="_blank" rel="noreferrer"
                                                        className="p-2 bg-slate-900 border border-white/5 rounded-lg text-emerald-400 hover:text-emerald-300"
                                                        title="WhatsApp al Delegado"
                                                    >
                                                        <MessageCircle size={14} />
                                                    </a>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteTeam(t.id, t.nombre)}
                                                    className="p-2 bg-slate-900 border border-white/5 rounded-lg text-rose-400 hover:text-rose-300"
                                                    title="Eliminar Equipo"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {teams.length === 0 && (
                        <div className="p-12 glass-premium rounded-[32px] border border-white/5 text-center text-slate-500 uppercase tracking-widest text-xs font-bold">
                            {canEdit 
                                ? 'Todavía no hay equipos cargados. Hacé clic en "Cargar Equipo" para empezar.'
                                : 'Todavía no hay equipos registrados para este torneo.'}
                        </div>
                    )}
                </div>
            )}

            {/* ─── Pestaña 4: GOLEADORES Y TARJETAS ──────────────────────────────── */}
            {activeTab === 'scorers' && (
                <div className="space-y-6">
                    <ScorersTable 
                        scorers={scorers} 
                        tarjetas={tarjetas} 
                        mejorJugador={tournament.mejorJugador}
                        mejorArquero={tournament.mejorArquero}
                    />
                </div>
            )}

            {/* ─── Pestaña 5: CUADRO DE HONOR ───────────────────────────────────── */}
            {activeTab === 'awards' && (
                <div className="glass-premium p-8 rounded-[40px] border border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
                                <Award size={24} className="text-amber-400" /> Cuadro de Honor y Premiaciones
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">
                                Reconocimientos oficiales del torneo
                            </p>
                        </div>
                        {canEdit && (
                            <button 
                                onClick={() => setAwardsModal(true)}
                                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg"
                            >
                                Editar Premiaciones
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-950/60 rounded-3xl border border-amber-500/20 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                                🏆 Campeón del Torneo
                            </span>
                            <p className="text-2xl font-black italic uppercase text-white">
                                {tournament.campeon || 'Por definirse'}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-950/60 rounded-3xl border border-slate-500/20 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block">
                                🥈 Subcampeón
                            </span>
                            <p className="text-2xl font-black italic uppercase text-white">
                                {tournament.subcampeon || 'Por definirse'}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-950/60 rounded-3xl border border-indigo-500/20 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">
                                ⚽ Goleador Estrella
                            </span>
                            <p className="text-2xl font-black italic uppercase text-white">
                                {tournament.goleador || 'Por definirse'}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-950/60 rounded-3xl border border-purple-500/20 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block">
                                ⭐ Mejor Jugador (MVP)
                            </span>
                            <p className="text-2xl font-black italic uppercase text-white">
                                {tournament.mejorJugador || 'Por definirse'}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-950/60 rounded-3xl border border-emerald-500/20 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                                🧤 Mejor Arquero
                            </span>
                            <p className="text-2xl font-black italic uppercase text-white">
                                {tournament.mejorArquero || 'Por definirse'}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-950/60 rounded-3xl border border-cyan-500/20 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                                🛡 Valla Menos Vencida
                            </span>
                            <p className="text-2xl font-black italic uppercase text-white">
                                {tournament.vallaMenosVencida || 'Por definirse'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════
                MODAL 1: PLANILLA DEL PARTIDO / CARGAR RESULTADO
               ═════════════════════════════════════════════════════════════════════ */}
            {canEdit && matchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-[36px] w-full max-w-3xl my-8 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                    Planilla Oficial del Partido
                                </span>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                    {matchModal.local || 'Local'} vs {matchModal.visitante || 'Visitante'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setMatchModal(null)} 
                                className="p-2 text-slate-500 hover:text-white rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveMatch} className="space-y-6">
                            {/* Fecha, Hora, Cancha y Jornada */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jornada / Fase</label>
                                    <input 
                                        type="text" 
                                        value={matchModal.jornada || ''} 
                                        onChange={e => setMatchModal({ ...matchModal, jornada: e.target.value })}
                                        placeholder="Ej: Fecha 1" 
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha</label>
                                    <input 
                                        type="date" 
                                        value={matchModal.fecha || ''} 
                                        onChange={e => setMatchModal({ ...matchModal, fecha: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hora</label>
                                    <input 
                                        type="time" 
                                        value={matchModal.hora || ''} 
                                        onChange={e => setMatchModal({ ...matchModal, hora: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cancha Asignada</label>
                                    <input 
                                        type="text" 
                                        value={matchModal.cancha || ''} 
                                        onChange={e => setMatchModal({ ...matchModal, cancha: e.target.value })}
                                        placeholder="Ej: Cancha 1" 
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white" 
                                    />
                                </div>
                            </div>

                            {/* Equipos y Marcador */}
                            <div className="p-6 bg-slate-950/70 rounded-3xl border border-white/5 space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">
                                    Equipos y Marcador Final
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                                    <div className="sm:col-span-2 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-slate-500">Equipo Local</label>
                                        <select 
                                            value={matchModal.local || ''} 
                                            onChange={e => {
                                                const sel = teams.find(t => t.nombre === e.target.value);
                                                setMatchModal({ ...matchModal, local: e.target.value, localLogo: sel?.logo || '' });
                                            }}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white"
                                        >
                                            <option value="">Seleccionar Local</option>
                                            {teams.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-center gap-2">
                                        <input 
                                            type="number" min="0" 
                                            value={matchModal.goles_local ?? ''} 
                                            onChange={e => setMatchModal({ ...matchModal, goles_local: e.target.value === '' ? null : parseInt(e.target.value) })}
                                            placeholder="0"
                                            className="w-14 bg-slate-900 border border-white/10 rounded-xl py-2.5 text-center text-lg font-black text-white"
                                        />
                                        <span className="text-slate-600 font-bold">-</span>
                                        <input 
                                            type="number" min="0" 
                                            value={matchModal.goles_visitante ?? ''} 
                                            onChange={e => setMatchModal({ ...matchModal, goles_visitante: e.target.value === '' ? null : parseInt(e.target.value) })}
                                            placeholder="0"
                                            className="w-14 bg-slate-900 border border-white/10 rounded-xl py-2.5 text-center text-lg font-black text-white"
                                        />
                                    </div>

                                    <div className="sm:col-span-2 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-slate-500">Equipo Visitante</label>
                                        <select 
                                            value={matchModal.visitante || ''} 
                                            onChange={e => {
                                                const sel = teams.find(t => t.nombre === e.target.value);
                                                setMatchModal({ ...matchModal, visitante: e.target.value, visitanteLogo: sel?.logo || '' });
                                            }}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white"
                                        >
                                            <option value="">Seleccionar Visitante</option>
                                            {teams.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Estado del partido:</label>
                                    <select 
                                        value={matchModal.estado || 'pendiente'} 
                                        onChange={e => setMatchModal({ ...matchModal, estado: e.target.value })}
                                        className="bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-bold"
                                    >
                                        <option value="pendiente">Pendiente / Programado</option>
                                        <option value="en_curso">En Vivo / En Juego</option>
                                        <option value="finalizado">Finalizado (Suma a la tabla)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Goleadores del Partido */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                        <Target size={14} /> Goleadores del Partido
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            const current = matchModal.goleadores || [];
                                            setMatchModal({
                                                ...matchModal,
                                                goleadores: [...current, { jugador: '', equipo: matchModal.local || '', goles: 1 }]
                                            });
                                        }}
                                        className="text-[10px] font-bold uppercase text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Agregar Goleador
                                    </button>
                                </div>
                                {(matchModal.goleadores || []).map((g, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input 
                                            type="text" 
                                            placeholder="Nombre del Jugador" 
                                            value={g.jugador}
                                            onChange={e => {
                                                const next = [...matchModal.goleadores];
                                                next[idx].jugador = e.target.value;
                                                setMatchModal({ ...matchModal, goleadores: next });
                                            }}
                                            className="flex-1 bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white"
                                        />
                                        <select 
                                            value={g.equipo}
                                            onChange={e => {
                                                const next = [...matchModal.goleadores];
                                                next[idx].equipo = e.target.value;
                                                setMatchModal({ ...matchModal, goleadores: next });
                                            }}
                                            className="w-40 bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white"
                                        >
                                            <option value={matchModal.local}>{matchModal.local || 'Local'}</option>
                                            <option value={matchModal.visitante}>{matchModal.visitante || 'Visitante'}</option>
                                        </select>
                                        <input 
                                            type="number" min="1" 
                                            value={g.goles || 1}
                                            onChange={e => {
                                                const next = [...matchModal.goleadores];
                                                next[idx].goles = parseInt(e.target.value) || 1;
                                                setMatchModal({ ...matchModal, goleadores: next });
                                            }}
                                            className="w-16 bg-slate-950 border border-white/10 rounded-xl py-2 px-2 text-center text-xs text-white"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setMatchModal({
                                                    ...matchModal,
                                                    goleadores: matchModal.goleadores.filter((_, i) => i !== idx)
                                                });
                                            }}
                                            className="p-2 text-slate-500 hover:text-rose-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Tarjetas Amarillas y Rojas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Amarillas */}
                                <div className="space-y-3 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                                            <span className="w-2.5 h-3.5 bg-amber-400 rounded-xs inline-block" /> Tarjetas Amarillas
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const current = matchModal.amarillas || [];
                                                setMatchModal({
                                                    ...matchModal,
                                                    amarillas: [...current, { jugador: '', equipo: matchModal.local || '' }]
                                                });
                                            }}
                                            className="text-[9px] font-bold uppercase text-amber-400 hover:underline"
                                        >
                                            + Agregar
                                        </button>
                                    </div>
                                    {(matchModal.amarillas || []).map((a, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input 
                                                type="text" placeholder="Jugador amonestado" 
                                                value={a.jugador}
                                                onChange={e => {
                                                    const next = [...matchModal.amarillas];
                                                    next[idx].jugador = e.target.value;
                                                    setMatchModal({ ...matchModal, amarillas: next });
                                                }}
                                                className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-1.5 px-2.5 text-xs text-white"
                                            />
                                            <select 
                                                value={a.equipo}
                                                onChange={e => {
                                                    const next = [...matchModal.amarillas];
                                                    next[idx].equipo = e.target.value;
                                                    setMatchModal({ ...matchModal, amarillas: next });
                                                }}
                                                className="w-28 bg-slate-900 border border-white/10 rounded-xl py-1.5 px-2 text-[10px] text-white"
                                            >
                                                <option value={matchModal.local}>{matchModal.local}</option>
                                                <option value={matchModal.visitante}>{matchModal.visitante}</option>
                                            </select>
                                            <button 
                                                type="button" 
                                                onClick={() => setMatchModal({ ...matchModal, amarillas: matchModal.amarillas.filter((_, i) => i !== idx) })}
                                                className="p-1 text-slate-500 hover:text-rose-400"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Rojas */}
                                <div className="space-y-3 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-rose-400 flex items-center gap-1.5">
                                            <span className="w-2.5 h-3.5 bg-rose-500 rounded-xs inline-block" /> Tarjetas Rojas (Expulsados)
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const current = matchModal.rojas || [];
                                                setMatchModal({
                                                    ...matchModal,
                                                    rojas: [...current, { jugador: '', equipo: matchModal.local || '' }]
                                                });
                                            }}
                                            className="text-[9px] font-bold uppercase text-rose-400 hover:underline"
                                        >
                                            + Agregar
                                        </button>
                                    </div>
                                    {(matchModal.rojas || []).map((r, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input 
                                                type="text" placeholder="Jugador expulsado" 
                                                value={r.jugador}
                                                onChange={e => {
                                                    const next = [...matchModal.rojas];
                                                    next[idx].jugador = e.target.value;
                                                    setMatchModal({ ...matchModal, rojas: next });
                                                }}
                                                className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-1.5 px-2.5 text-xs text-white"
                                            />
                                            <select 
                                                value={r.equipo}
                                                onChange={e => {
                                                    const next = [...matchModal.rojas];
                                                    next[idx].equipo = e.target.value;
                                                    setMatchModal({ ...matchModal, rojas: next });
                                                }}
                                                className="w-28 bg-slate-900 border border-white/10 rounded-xl py-1.5 px-2 text-[10px] text-white"
                                            >
                                                <option value={matchModal.local}>{matchModal.local}</option>
                                                <option value={matchModal.visitante}>{matchModal.visitante}</option>
                                            </select>
                                            <button 
                                                type="button" 
                                                onClick={() => setMatchModal({ ...matchModal, rojas: matchModal.rojas.filter((_, i) => i !== idx) })}
                                                className="p-1 text-slate-500 hover:text-rose-400"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Destacados: MVP y Mejor Arquero */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                                        <Award size={14} /> Mejor Jugador del Partido (MVP)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={matchModal.mvp || ''} 
                                        onChange={e => setMatchModal({ ...matchModal, mvp: e.target.value })}
                                        placeholder="Ej: M. Ruben (Los Pibes FC)" 
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                                        <Shield size={14} /> Mejor Arquero del Partido
                                    </label>
                                    <input 
                                        type="text" 
                                        value={matchModal.mejorArquero || ''} 
                                        onChange={e => setMatchModal({ ...matchModal, mejorArquero: e.target.value })}
                                        placeholder="Ej: Franco Armani" 
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white" 
                                    />
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                {matches.some(m => m.id === matchModal.id) ? (
                                    <button 
                                        type="button"
                                        onClick={() => handleDeleteMatch(matchModal.id)}
                                        className="p-3 text-rose-400 hover:text-rose-300 text-xs font-bold uppercase flex items-center gap-1"
                                    >
                                        <Trash2 size={15} /> Eliminar Partido
                                    </button>
                                ) : <div />}

                                <div className="flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setMatchModal(null)} 
                                        className="px-6 py-3.5 bg-slate-950 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={saving} 
                                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                                    >
                                        <Save size={16} /> Guardar Planilla
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════
                MODAL 2: CARGAR / EDITAR EQUIPO Y PLANTEL
               ═════════════════════════════════════════════════════════════════════ */}
            {canEdit && teamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-[36px] w-full max-w-xl my-8 p-6 sm:p-8 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                    {teamModal.id && teams.some(t => t.id === teamModal.id) ? 'Editar Equipo' : 'Nuevo Equipo'}
                                </span>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                    {teamModal.nombre || 'Datos del Equipo'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setTeamModal(null)} 
                                className="p-2 text-slate-500 hover:text-white rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTeam} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nombre del Equipo *</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={teamModal.nombre} 
                                    onChange={e => setTeamModal({ ...teamModal, nombre: e.target.value })}
                                    placeholder="Ej: Los Pibes FC"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">URL del Escudo / Logo del Equipo</label>
                                <input 
                                    type="url" 
                                    value={teamModal.logo || ''} 
                                    onChange={e => setTeamModal({ ...teamModal, logo: e.target.value })}
                                    placeholder="https://images.unsplash.com/... o enlace directo a imagen"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                                {teamModal.logo && (
                                    <div className="pt-2 flex items-center gap-3">
                                        <img src={teamModal.logo} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-white/10 bg-slate-950" />
                                        <span className="text-xs text-slate-400">Previsualización de escudo</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capitán / Delegado</label>
                                    <input 
                                        type="text" 
                                        value={teamModal.capitan || ''} 
                                        onChange={e => setTeamModal({ ...teamModal, capitan: e.target.value })}
                                        placeholder="Ej: Nicolás Gómez"
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp / Teléfono</label>
                                    <input 
                                        type="tel" 
                                        value={teamModal.telefono || ''} 
                                        onChange={e => setTeamModal({ ...teamModal, telefono: e.target.value })}
                                        placeholder="Ej: 11 2233-4455"
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Color Representativo</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="color" 
                                        value={teamModal.color || '#3b82f6'} 
                                        onChange={e => setTeamModal({ ...teamModal, color: e.target.value })}
                                        className="w-12 h-10 bg-transparent cursor-pointer rounded-lg border-0"
                                    />
                                    <span className="text-xs text-slate-400">Color de camiseta / escudo</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Plantel de Jugadores (separados por coma)
                                </label>
                                <textarea 
                                    rows={3}
                                    value={Array.isArray(teamModal.jugadores) ? teamModal.jugadores.join(', ') : (teamModal.jugadores || '')} 
                                    onChange={e => setTeamModal({ ...teamModal, jugadores: e.target.value })}
                                    placeholder="N. Gómez, M. Ruben, F. Armani, L. Paredes, E. Buendía..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button 
                                    type="button" 
                                    onClick={() => setTeamModal(null)}
                                    className="px-6 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                                >
                                    <Save size={16} /> Guardar Equipo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════
                MODAL 3: CUADRO DE HONOR Y PREMIACIONES
               ═════════════════════════════════════════════════════════════════════ */}
            {canEdit && awardsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-[36px] w-full max-w-xl my-8 p-6 sm:p-8 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                                    Premiación Oficial
                                </span>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                    Editar Cuadro de Honor
                                </h3>
                            </div>
                            <button 
                                onClick={() => setAwardsModal(false)} 
                                className="p-2 text-slate-500 hover:text-white rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAwards} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-amber-400">Equipo Campeón</label>
                                <input 
                                    type="text" 
                                    value={tournament.campeon || ''} 
                                    onChange={e => setTournament({ ...tournament, campeon: e.target.value })}
                                    placeholder="Nombre del equipo campeón"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">Equipo Subcampeón</label>
                                <input 
                                    type="text" 
                                    value={tournament.subcampeon || ''} 
                                    onChange={e => setTournament({ ...tournament, subcampeon: e.target.value })}
                                    placeholder="Nombre del equipo subcampeón"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Goleador del Torneo</label>
                                <input 
                                    type="text" 
                                    value={tournament.goleador || ''} 
                                    onChange={e => setTournament({ ...tournament, goleador: e.target.value })}
                                    placeholder="Ej: M. Ruben (8 goles)"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Mejor Jugador del Torneo (MVP)</label>
                                <input 
                                    type="text" 
                                    value={tournament.mejorJugador || ''} 
                                    onChange={e => setTournament({ ...tournament, mejorJugador: e.target.value })}
                                    placeholder="Ej: Carlos Tevez (Real Bañil)"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Mejor Arquero del Torneo</label>
                                <input 
                                    type="text" 
                                    value={tournament.mejorArquero || ''} 
                                    onChange={e => setTournament({ ...tournament, mejorArquero: e.target.value })}
                                    placeholder="Ej: Franco Armani (Los Pibes FC)"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Valla Menos Vencida</label>
                                <input 
                                    type="text" 
                                    value={tournament.vallaMenosVencida || ''} 
                                    onChange={e => setTournament({ ...tournament, vallaMenosVencida: e.target.value })}
                                    placeholder="Ej: Los Pibes FC (3 goles en contra)"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button 
                                    type="button" 
                                    onClick={() => setAwardsModal(false)}
                                    className="px-6 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center gap-2"
                                >
                                    <Save size={16} /> Guardar Cuadro de Honor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
