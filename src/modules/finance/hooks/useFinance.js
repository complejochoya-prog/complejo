import { useState, useEffect } from 'react';
import { fetchFinanceSummary, fetchExpenses, fetchInvoices, recordExpense } from '../services/financeService';

export function useFinance(negocioId) {
    const [summary, setSummary] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!negocioId) return;
        loadData();
    }, [negocioId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [summaryData, expensesData, invoicesData] = await Promise.all([
                fetchFinanceSummary(negocioId),
                fetchExpenses(negocioId),
                fetchInvoices(negocioId)
            ]);
            setSummary(summaryData);
            setExpenses(expensesData);
            setInvoices(invoicesData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addExpense = async (data) => {
        try {
            const res = await recordExpense(negocioId, data);
            if (res.success) {
                await loadData();
            }
            return res;
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    return {
        summary,
        expenses,
        invoices,
        loading,
        error,
        addExpense,
        refresh: loadData
    };
}
