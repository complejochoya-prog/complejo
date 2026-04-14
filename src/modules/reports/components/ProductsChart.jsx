import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell
} from "recharts";

export default function ProductsChart({ data }) {
    return (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                Productos Top
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                            dataKey="producto" 
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
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ 
                                backgroundColor: '#0f172a', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                            itemStyle={{ color: '#22c55e' }}
                            formatter={(value) => [value, 'Cantidad (u)']}
                        />
                        <Bar 
                            dataKey="cantidad" 
                            radius={[6, 6, 0, 0]}
                        >
                            {
                                data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#D4AF37' : '#22c55e'} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
