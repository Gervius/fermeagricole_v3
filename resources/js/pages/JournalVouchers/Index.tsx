import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import { journalVoucherShow, journalVouchersIndex } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

interface JournalEntryLine {
    id: number;
    account_code: string;
    account_name: string;
    debit: number;
    credit: number;
    description: string | null;
}
interface JournalVoucher {
    id: number;
    voucher_number: string;
    date: string; // Y-m-d
    description: string | null;
    source_type: string; // ex: App\Models\EggSale
    source_id: number;
    created_by: string;
    created_at: string; // d/m/Y H:i
    entries: JournalEntryLine[]; // chargé seulement dans show
    entries_count?: number; // pour l'index
}

interface PaginatedVouchers {
    data: JournalVoucher[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

interface VouchersPageProps {
    vouchers: PaginatedVouchers;
    filters: { start_date?: string; end_date?: string };
    flash?: { success?: string; error?: string };
}

interface VoucherShowPageProps {
    voucher: JournalVoucher & { entries: JournalEntryLine[] };
}

export default function JournalVouchersIndex({
    vouchers,
    filters,
    flash,
}: VouchersPageProps) {
    const { addToast } = useToasts();
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const applyFilters = () => {
        router.get(
            journalVouchersIndex.url(),
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
        router.get(journalVouchersIndex.url(), {}, { replace: true });
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Pièces comptables',
                    href: journalVouchersIndex.url(),
                },
            ]}
        >
            <Head title="Pièces comptables" />
            <div className="min-h-screen bg-stone-50 font-sans">
                <div className="border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto max-w-7xl">
                        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                            Pièces comptables
                        </h1>
                        <p className="mt-0.5 text-sm text-stone-500">
                            {vouchers.total} pièce
                            {vouchers.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
                    {/* Filtres par date */}
                    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
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
                                Filtrer
                            </button>
                            <button
                                onClick={resetFilters}
                                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            N° Pièce
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Date
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Description
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Source
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Nb lignes
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Créé par
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {vouchers.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-5 py-12 text-center text-sm text-stone-400"
                                            >
                                                Aucune pièce trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        vouchers?.data?.map((v) => (
                                            <tr
                                                key={v.id}
                                                className="transition-colors hover:bg-stone-50"
                                            >
                                                <td className="px-5 py-4 font-mono text-stone-900">
                                                    {v.voucher_number}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="flex items-center gap-1.5 text-stone-600">
                                                        <Calendar className="h-3.5 w-3.5 text-stone-400" />
                                                        {new Date(
                                                            v.date,
                                                        ).toLocaleDateString(
                                                            'fr-FR',
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="max-w-xs truncate px-5 py-4 text-stone-600">
                                                    {v.description || '-'}
                                                </td>
                                                <td className="px-5 py-4 text-xs text-stone-600">
                                                    {v.source_type
                                                        .split('\\')
                                                        .pop()}{' '}
                                                    #{v.source_id}
                                                </td>
                                                <td className="px-5 py-4 text-center text-stone-600">
                                                    {v.entries_count}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {v.created_by}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        onClick={() =>
                                                            router.get(
                                                                journalVoucherShow.url(
                                                                    v.id,
                                                                ),
                                                            )
                                                        }
                                                        className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                        title="Voir"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {vouchers.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
                                <span>
                                    Page {vouchers.current_page} sur{' '}
                                    {vouchers.last_page} — {vouchers.total}{' '}
                                    résultats
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={vouchers.current_page === 1}
                                        onClick={() =>
                                            router.get(
                                                journalVouchersIndex.url(),
                                                {
                                                    ...filters,
                                                    page:
                                                        vouchers.current_page -
                                                        1,
                                                },
                                            )
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        disabled={
                                            vouchers.current_page ===
                                            vouchers.last_page
                                        }
                                        onClick={() =>
                                            router.get(
                                                journalVouchersIndex.url(),
                                                {
                                                    ...filters,
                                                    page:
                                                        vouchers.current_page +
                                                        1,
                                                },
                                            )
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-4 w-4" />
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
