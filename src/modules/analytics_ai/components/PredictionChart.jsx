import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PredictionChart({ data = [] }) {
    if (!data.length) return null;

    // Custom Tooltip function for native look
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="font-bold text-white uppercase tracking-tight">{entry.name}:</span>
                            <span className="font-black italic text-white/90">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full min-h-[300px] mt-4 z-10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                        dataKey="dia" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgb(100, 116, 139)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
                        dy={10} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgb(100, 116, 139)', fontSize: 10, fontWeight: 900 }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: 'rgb(100, 116, 139)' }} 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="real" 
                        name="Ocupación Real" 
                        stroke="#6366f1" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} 
                        activeDot={{ r: 6, fill: '#818cf8', strokeWidth: 0 }} 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="prediccion" 
                        name="IA Predicción" 
                        stroke="#10b981" 
                        strokeWidth={4} 
                        strokeDasharray="5 5" 
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} 
                        activeDot={{ r: 6, fill: '#34d399', strokeWidth: 0 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
