import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfitChart({ data }) {
    if (!data) return null;

    return (
        <div className="bg-slate-900 border border-white/5 p-8 rounded-[48px] h-full flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter italic text-white leading-none">
                        Flujo de <span className="text-indigo-400">Caja</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ingresos vs Egresos trimestral</p>
                </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                        />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                            itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="income" 
                            stroke="#6366f1" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorIncome)" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="expense" 
                            stroke="#ef4444" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorExpense)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex gap-6 mt-8">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gastos</span>
                </div>
            </div>
        </div>
    );
}
