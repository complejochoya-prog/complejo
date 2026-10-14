import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Users, CheckCircle2, Clock, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import {
    subscribeInscripciones,
    subscribeCursos,
    subscribeProfesores,
    findCourseForStudent,
} from '../services/escuelaService';
import AlumnosTab from '../components/AlumnosTab';
import CursosTab from '../components/CursosTab';
import ProfesoresTab from '../components/ProfesoresTab';

export default function EscuelaAdmin() {
    const { negocioId } = useParams();
    const [tab, setTab] = useState('alumnos');
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const unsubs = [
            subscribeInscripciones(negocioId, setStudents),
            subscribeCursos(negocioId, setCourses),
            subscribeProfesores(negocioId, setTeachers),
        ];
        return () => unsubs.forEach(u => u && u());
    }, [negocioId]);

    // Cantidad de alumnos activos por curso (id de curso → n)
    const enrolledByCourse = useMemo(() => {
        const map = {};
        students.forEach(s => {
            if (s.status === 'inactive') return;
            const c = findCourseForStudent(s, courses);
            if (c) map[c.id] = (map[c.id] || 0) + 1;
        });
        return map;
    }, [students, courses]);

    const activeStudents = students.filter(s => s.status !== 'inactive');
    const stats = [
        { label: 'Alumnos activos', value: activeStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Al día', value: activeStudents.filter(s => s.payment === 'paid').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Cuotas pendientes', value: activeStudents.filter(s => s.payment === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'En deuda', value: activeStudents.filter(s => s.payment === 'overdue').length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    const tabs = [
        { id: 'alumnos', label: 'Alumnos', icon: Users, count: students.length },
        { id: 'cursos', label: 'Cursos', icon: BookOpen, count: courses.length },
        { id: 'profesores', label: 'Profesores', icon: GraduationCap, count: teachers.length },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                    Gestión <span className="text-blue-500">Escuela</span>
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    Alumnos, cursos y profesores
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(stat => (
                    <div key={stat.label} className="glass-premium p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white italic">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 border-b border-white/5 overflow-x-auto">
                {tabs.map(t => (
                    <button
                        key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-5 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 -mb-px transition-all whitespace-nowrap ${
                            tab === t.id ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <t.icon size={15} /> {t.label}
                        <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[9px]">{t.count}</span>
                    </button>
                ))}
            </div>

            {tab === 'alumnos' && (
                <AlumnosTab negocioId={negocioId} students={students} courses={courses} enrolledByCourse={enrolledByCourse} />
            )}
            {tab === 'cursos' && (
                <CursosTab negocioId={negocioId} courses={courses} teachers={teachers} students={students} enrolledByCourse={enrolledByCourse} />
            )}
            {tab === 'profesores' && (
                <ProfesoresTab negocioId={negocioId} teachers={teachers} courses={courses} />
            )}
        </div>
    );
}
