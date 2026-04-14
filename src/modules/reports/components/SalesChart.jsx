import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

export default function SalesChart({ data }) {
    return (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold inline-block"></span>
                Tendencia de Ventas
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="rgba(255,255,255,0.5)" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                        />
                        <YAxis 
                            stroke="rgba(255,255,255,0.5)" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#0f172a', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                            itemStyle={{ color: '#D4AF37' }}
                            formatter={(value) => [`$${value}`, 'Ventas']}
                        />
                        <Line
                            type="monotone"
                            dataKey="ventas"
                            stroke="#D4AF37"
                            strokeWidth={3}
                            dot={{ fill: '#0f172a', stroke: '#D4AF37', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#D4AF37', stroke: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
