import React, { useEffect } from 'react';
import { router, Head } from '@inertiajs/react';
import { Plus, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useToasts } from '@/components/ToastProvider';
import { accountsIndex, accountsCreate, accountsEdit } from '@/routes';

interface Account {
    id: number;
    code: string;
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    is_active: boolean;
    debit?: number;      // total débit (pour affichage)
    credit?: number;     // total crédit
    balance?: number;    // solde
}

interface PaginatedAccounts {
    data: Account[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

interface AccountsPageProps {
    accounts: PaginatedAccounts;
    flash?: { success?: string; error?: string };
}

export default function AccountsIndex({ accounts, flash }: AccountsPageProps) {
    const { addToast } = useToasts();

    useEffect(() => {
        if (flash?.success) addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            asset: 'Actif',
            liability: 'Passif',
            equity: 'Capitaux propres',
            revenue: 'Produits',
            expense: 'Charges',
        };
        return labels[type] || type;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Plan comptable', href: accountsIndex.url() }]}>
            <Head title="Plan comptable" />
            <div className="min-h-screen bg-stone-50 font-sans">

                <div className="bg-white border-b border-stone-200 px-8 py-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
                                Plan comptable
                            </h1>
                            <p className="text-stone-500 text-sm mt-0.5">
                                {accounts.total} compte{accounts.total !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={() => router.get(accountsCreate.url())}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau compte
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
                    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Code</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Nom</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Type</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Débit</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Crédit</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Solde</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {accounts.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center text-stone-400 text-sm">
                                                Aucun compte trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        accounts.data.map(acc => (
                                            <tr key={acc.id} className="hover:bg-stone-50 transition-colors">
                                                <td className="px-5 py-4 font-mono text-stone-900">{acc.code}</td>
                                                <td className="px-5 py-4 text-stone-900">{acc.name}</td>
                                                <td className="px-5 py-4">
                                                    <span className="px-3 py-1 rounded-full text-xs bg-stone-100 text-stone-700">
                                                        {getTypeLabel(acc.type)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-stone-600 text-right">{acc.debit?.toLocaleString('fr-FR')} €</td>
                                                <td className="px-5 py-4 text-stone-600 text-right">{acc.credit?.toLocaleString('fr-FR')} €</td>
                                                <td className={`px-5 py-4 text-right font-medium ${(acc.balance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {(acc.balance || 0).toLocaleString('fr-FR')} €
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => router.get(accountsEdit.url(acc.id))}
                                                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {accounts.last_page > 1 && (
                            <div className="border-t border-stone-100 px-5 py-4 flex items-center justify-between text-sm text-stone-500">
                                <span>Page {accounts.current_page} sur {accounts.last_page} — {accounts.total} résultats</span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={accounts.current_page === 1}
                                        onClick={() => router.get(accountsIndex.url(), { page: accounts.current_page - 1 })}
                                        className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={accounts.current_page === accounts.last_page}
                                        onClick={() => router.get(accountsIndex.url(), { page: accounts.current_page + 1 })}
                                        className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
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