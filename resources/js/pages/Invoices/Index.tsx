import React, { useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { 
    FileText, Plus, Search, ChevronLeft, ChevronRight, 
    CheckCircle2, AlertCircle, Clock, CreditCard, Wallet, AlertTriangle 
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useToasts } from '@/components/ToastProvider';
import { invoicesIndex, invoicesCreate, invoicesShow } from '@/routes';

interface Invoice {
    id: number;
    number: string;
    customer_name: string;
    date: string;
    due_date: string | null;
    total: number;
    remaining_amount: number;
    status: 'draft' | 'sent' | 'paid' | 'partial' | 'cancelled';
    payment_status: 'unpaid' | 'partial' | 'paid';
    is_overdue: boolean;
    created_by: string;
}

interface PageProps {
    invoices: {
        data: Invoice[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: { search?: string; payment_status?: string };
    stats: {
        total_revenue: number;
        total_collected: number;
        total_receivable: number;
        overdue_count: number;
    };
    flash?: { success?: string; error?: string };
}

const STATUS_META = {
    draft: { label: 'Brouillon', classes: 'bg-slate-100 text-slate-700' },
    sent: { label: 'Envoyée', classes: 'bg-blue-100 text-blue-700' },
    paid: { label: 'Soldée', classes: 'bg-emerald-100 text-emerald-700' },
    partial: { label: 'Partielle', classes: 'bg-amber-100 text-amber-700' },
    cancelled: { label: 'Annulée', classes: 'bg-red-100 text-red-700' },
};

const PAYMENT_META = {
    unpaid: { label: 'Non payé', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
    partial: { label: 'Partiel', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
    paid: { label: 'Payé', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

export default function Index({ invoices, filters, stats, flash }: PageProps) {
    const { addToast } = useToasts();

    useEffect(() => {
        if (flash?.success) addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get(invoicesIndex.url(), { search: formData.get('search'), payment_status: formData.get('status') }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Facturation', href: invoicesIndex.url() }]}>
            <Head title="Facturation et Créances" />
            <div className="min-h-screen bg-stone-50 font-sans pb-12">

                {/* ── Header ── */}
                <div className="bg-white border-b border-stone-200 px-8 py-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight flex items-center gap-2">
                                <FileText className="w-6 h-6 text-stone-400" />
                                Facturation & Créances
                            </h1>
                            <p className="text-stone-500 text-sm mt-1">Gérez vos factures et encaissements Mobile Money.</p>
                        </div>
                        <Link
                            href={invoicesCreate.url()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> Nouvelle Facture
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">

                    {/* ── Dashboard Créances (KPIs) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            title="Chiffre d'Affaires" 
                            value={stats.total_revenue} 
                            icon={<CreditCard className="w-5 h-5 text-indigo-500" />} 
                            bgClass="bg-indigo-50 border-indigo-100"
                        />
                        <StatCard 
                            title="Montant Encaissé" 
                            value={stats.total_collected} 
                            icon={<Wallet className="w-5 h-5 text-emerald-500" />} 
                            bgClass="bg-emerald-50 border-emerald-100"
                            textColor="text-emerald-700"
                        />
                        <StatCard 
                            title="Reste à Encaisser" 
                            value={stats.total_receivable} 
                            icon={<AlertCircle className="w-5 h-5 text-amber-500" />} 
                            bgClass="bg-amber-50 border-amber-100"
                            textColor="text-amber-700"
                        />
                        <StatCard 
                            title="Factures en Retard" 
                            value={stats.overdue_count} 
                            isCurrency={false}
                            icon={<AlertTriangle className="w-5 h-5 text-red-500" />} 
                            bgClass="bg-red-50 border-red-100"
                            textColor="text-red-700"
                        />
                    </div>

                    {/* ── Filters & Search ── */}
                    <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-3 w-full">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="N° Facture, Client..."
                                    className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                />
                            </div>
                            <select
                                name="status"
                                defaultValue={filters.payment_status}
                                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Tous les paiements</option>
                                <option value="paid">Soldées</option>
                                <option value="partial">Paiement partiel</option>
                                <option value="unpaid">Non payées</option>
                            </select>
                            <button type="submit" className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors">
                                Filtrer
                            </button>
                        </form>
                    </div>

                    {/* ── Table ── */}
                    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50 text-stone-500 text-xs uppercase tracking-wider font-semibold">
                                        <th className="px-6 py-4">N° Facture</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Montant Total</th>
                                        <th className="px-6 py-4 text-right">Reste à payer</th>
                                        <th className="px-6 py-4 text-center">Paiement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {invoices.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                                                Aucune facture trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.data.map((invoice) => {
                                            const pm = PAYMENT_META[invoice.payment_status];
                                            const sm = STATUS_META[invoice.status];
                                            
                                            return (
                                                <tr key={invoice.id} className="hover:bg-stone-50 transition-colors group">
                                                    <td className="px-6 py-4 cursor-pointer" onClick={() => router.get(invoicesShow.url(invoice.id))}>
                                                        <span className="font-semibold text-indigo-600 group-hover:text-indigo-800 transition-colors">{invoice.number}</span>
                                                        <div className="mt-1">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${sm.classes}`}>
                                                                {sm.label}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-stone-900">{invoice.customer_name}</td>
                                                    <td className="px-6 py-4 text-stone-600">
                                                        <div>{invoice.date}</div>
                                                        {invoice.due_date && (
                                                            <div className={`text-xs mt-1 flex items-center gap-1 ${invoice.is_overdue ? 'text-red-600 font-medium' : 'text-stone-400'}`}>
                                                                <Clock className="w-3 h-3" />
                                                                Éch: {invoice.due_date}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-stone-900">
                                                        {invoice.total.toLocaleString('fr-FR')} FCFA
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-stone-700">
                                                        {invoice.remaining_amount.toLocaleString('fr-FR')} FCFA
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => router.get(invoicesShow.url(invoice.id))}>
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${pm.classes}`}>
                                                                    {invoice.payment_status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                                    {pm.label}
                                                                </span>
                                                                {invoice.is_overdue && (
                                                                    <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5">
                                                                        <AlertTriangle className="w-3 h-3" /> EN RETARD
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <a 
                                                                href={`/invoices/${invoice.id}/pdf`} 
                                                                target="_blank" 
                                                                className="text-stone-400 hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-50 rounded"
                                                                title="Télécharger la facture en PDF"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <FileText className="w-5 h-5" />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {invoices.last_page > 1 && (
                            <div className="border-t border-stone-100 px-6 py-4 flex items-center justify-between text-sm text-stone-500 bg-white">
                                <span>Page {invoices.current_page} sur {invoices.last_page}</span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={invoices.current_page === 1}
                                        onClick={() => router.get(invoicesIndex.url(), { page: invoices.current_page - 1 }, { preserveState: true })}
                                        className="p-1.5 rounded-md border border-stone-200 hover:bg-stone-50 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={invoices.current_page === invoices.last_page}
                                        onClick={() => router.get(invoicesIndex.url(), { page: invoices.current_page + 1 }, { preserveState: true })}
                                        className="p-1.5 rounded-md border border-stone-200 hover:bg-stone-50 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ title, value, isCurrency = true, icon, bgClass, textColor = "text-stone-900" }: { title: string, value: number, isCurrency?: boolean, icon: React.ReactNode, bgClass: string, textColor?: string }) {
    return (
        <div className={`p-5 rounded-2xl border ${bgClass} shadow-sm relative overflow-hidden`}>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-sm font-medium text-stone-600 mb-1">{title}</p>
                    <h3 className={`text-2xl font-bold tracking-tight ${textColor}`}>
                        {isCurrency ? `${value.toLocaleString('fr-FR')} FCFA` : value.toLocaleString('fr-FR')}
                    </h3>
                </div>
                <div className="p-2 bg-white/60 rounded-xl backdrop-blur-sm">
                    {icon}
                </div>
            </div>
        </div>
    );
}