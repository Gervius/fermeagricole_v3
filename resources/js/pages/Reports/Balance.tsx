import AppLayout from '@/layouts/app-layout';
import { reportsBalance } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { useState } from 'react';

interface BalanceLine {
    code: string;
    name: string;
    debit: number;
    credit: number;
    balance: number;
}

interface BalanceReport {
    accounts: BalanceLine[];
    total_debit: number;
    total_credit: number;
}

interface BalancePageProps {
    report: BalanceReport;
    filters: { start_date?: string; end_date?: string };
}

export default function BalanceReport({ report, filters }: BalancePageProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const applyFilters = () => {
        router.get(
            reportsBalance.url(),
            {
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        router.get(reportsBalance.url(), {}, { replace: true });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Balance générale', href: reportsBalance.url() },
            ]}
        >
            <Head title="Balance générale" />
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-stone-900">
                            Balance générale
                        </h1>
                        <a
                            href="/reports/balance/pdf"
                            target="_blank"
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                        >
                            <FileText className="h-4 w-4" />
                            Télécharger PDF
                        </a>
                    </div>

                    {/* Filtres */}
                    <div className="mb-6 flex flex-wrap items-end gap-3">
                        <div className="min-w-[180px]">
                            <label className="mb-1.5 block text-xs font-medium text-stone-500">
                                Date début
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            />
                        </div>
                        <div className="min-w-[180px]">
                            <label className="mb-1.5 block text-xs font-medium text-stone-500">
                                Date fin
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={applyFilters}
                                className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white transition-colors hover:bg-stone-800"
                            >
                                Générer
                            </button>
                            <button
                                onClick={resetFilters}
                                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* Tableau de balance */}
                    <div className="overflow-x-auto">
                        <table className="w-full border border-stone-200 text-sm">
                            <thead className="bg-stone-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-stone-600">
                                        Compte
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-stone-600">
                                        Intitulé
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-stone-600">
                                        Débit
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-stone-600">
                                        Crédit
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-stone-600">
                                        Solde
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200">
                                {report?.accounts?.map((line, idx) => (
                                    <tr key={idx} className="hover:bg-stone-50">
                                        <td className="px-4 py-2 font-mono">
                                            {line.code}
                                        </td>
                                        <td className="px-4 py-2">
                                            {line.name}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {line?.debit?.toLocaleString(
                                                'fr-FR',
                                            )}{' '}
                                            €
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {line?.credit?.toLocaleString(
                                                'fr-FR',
                                            )}{' '}
                                            €
                                        </td>
                                        <td
                                            className={`px-4 py-2 text-right font-medium ${line.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                                        >
                                            {line?.balance?.toLocaleString(
                                                'fr-FR',
                                            )}{' '}
                                            €
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-stone-50 font-medium">
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="px-4 py-2 text-right"
                                    >
                                        Totaux :
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {report?.total_debit?.toLocaleString(
                                            'fr-FR',
                                        )}{' '}
                                        €
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {report?.total_credit?.toLocaleString(
                                            'fr-FR',
                                        )}{' '}
                                        €
                                    </td>
                                    <td className="px-4 py-2 text-right">—</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {report?.accounts?.length === 0 && (
                        <p className="py-8 text-center text-stone-400">
                            Aucune écriture pour la période sélectionnée.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
