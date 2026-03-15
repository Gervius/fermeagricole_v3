import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import { journalVouchersPost, journalVouchersUpdate } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    FileEdit,
    Plus,
    Save,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Account {
    id: number;
    code: string;
    name: string;
}

interface JournalEntry {
    id?: number;
    account_id: number;
    debit: number;
    credit: number;
    description: string;
    account?: Account;
}

interface JournalVoucher {
    id: number;
    voucher_number: string | null;
    status: 'draft' | 'posted';
    date: string;
    description: string;
    entries: JournalEntry[];
    creator?: { name: string };
    created_at: string;
}

interface Props {
    draftVouchers: {
        data: JournalVoucher[];
        current_page: number;
        last_page: number;
    };
    accounts: Account[];
    flash?: { success?: string; error?: string; message?: string };
}

export default function Review({ draftVouchers, accounts, flash }: Props) {
    const { addToast } = useToasts();
    const [editingVoucherId, setEditingVoucherId] = useState<number | null>(
        null,
    );

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error || flash?.message)
            addToast({
                message: (flash.error || flash.message) as string,
                type: 'error',
            });
    }, [flash]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Révision Comptable', href: '/accounting/review' },
            ]}
        >
            <Head title="Révision Comptable" />

            <div className="min-h-screen bg-stone-50 py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-900">
                            <FileEdit className="h-6 w-6 text-indigo-600" />
                            Écritures en attente de validation
                        </h1>
                        <p className="mt-1 text-sm text-stone-500">
                            Vérifiez, modifiez les ventilations, et validez les
                            écritures brouillons pour les poster dans le Grand
                            Livre.
                        </p>
                    </div>

                    {draftVouchers.data.length === 0 ? (
                        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm">
                            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
                            <h3 className="text-lg font-medium text-stone-900">
                                Tout est à jour !
                            </h3>
                            <p className="mt-1 text-stone-500">
                                Il n'y a aucune écriture comptable en attente de
                                révision.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {draftVouchers.data.map((voucher) => (
                                <VoucherCard
                                    key={voucher.id}
                                    voucher={voucher}
                                    accounts={accounts}
                                    isEditing={editingVoucherId === voucher.id}
                                    onEdit={() =>
                                        setEditingVoucherId(voucher.id)
                                    }
                                    onCancel={() => setEditingVoucherId(null)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function VoucherCard({
    voucher,
    accounts,
    isEditing,
    onEdit,
    onCancel,
}: {
    voucher: JournalVoucher;
    accounts: Account[];
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
}) {
    const { data, setData, put, processing, reset } = useForm({
        description: voucher.description,
        entries: voucher.entries.map((e) => ({
            id: e.id,
            account_id: e.account_id,
            debit: parseFloat(e.debit.toString()),
            credit: parseFloat(e.credit.toString()),
            description: e.description,
        })),
    });

    const [isPosting, setIsPosting] = useState(false);

    const totalDebit = data.entries.reduce(
        (sum, e) => sum + Number(e.debit || 0),
        0,
    );
    const totalCredit = data.entries.reduce(
        (sum, e) => sum + Number(e.credit || 0),
        0,
    );
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put(journalVouchersUpdate.url(voucher.id), {
            onSuccess: () => onCancel(),
        });
    };

    const handlePost = () => {
        if (
            !confirm(
                'Êtes-vous sûr de vouloir poster cette écriture définitivement ? Elle ne pourra plus être modifiée.',
            )
        )
            return;
        setIsPosting(true);
        router.post(
            journalVouchersPost.url(voucher.id),
            {},
            {
                onFinish: () => setIsPosting(false),
            },
        );
    };

    const addEntry = () => {
        setData('entries', [
            ...data.entries,
            {
                account_id: accounts[0]?.id || 0,
                debit: 0,
                credit: 0,
                description: data.description,
            },
        ]);
    };

    const removeEntry = (index: number) => {
        const newEntries = [...data.entries];
        newEntries.splice(index, 1);
        setData('entries', newEntries);
    };

    if (!isEditing) {
        return (
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <div className="flex items-start justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
                    <div>
                        <div className="mb-1 flex items-center gap-3">
                            <span className="rounded bg-amber-100 px-2.5 py-1 text-xs font-bold tracking-wider text-amber-800 uppercase">
                                Brouillon
                            </span>
                            <span className="text-sm font-medium text-stone-500">
                                Date:{' '}
                                {new Date(voucher.date).toLocaleDateString(
                                    'fr-FR',
                                )}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-stone-900">
                            {voucher.description}
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEdit}
                            className="rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
                        >
                            Modifier
                        </button>
                        <button
                            onClick={handlePost}
                            disabled={isPosting}
                            className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                        >
                            <CheckCircle className="h-4 w-4" /> Poster
                        </button>
                    </div>
                </div>
                <div className="px-6 py-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-100 text-left text-stone-500">
                                <th className="pb-2 font-medium">Compte</th>
                                <th className="pb-2 font-medium">
                                    Libellé ligne
                                </th>
                                <th className="pb-2 text-right font-medium">
                                    Débit
                                </th>
                                <th className="pb-2 text-right font-medium">
                                    Crédit
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {voucher.entries.map((entry, idx) => (
                                <tr key={entry.id || idx}>
                                    <td className="py-3 font-medium text-stone-900">
                                        {entry.account?.code} -{' '}
                                        {entry.account?.name}
                                    </td>
                                    <td className="py-3 text-stone-600">
                                        {entry.description}
                                    </td>
                                    <td className="py-3 text-right font-medium text-stone-900">
                                        {Number(entry.debit) > 0
                                            ? Number(
                                                  entry.debit,
                                              ).toLocaleString('fr-FR')
                                            : '-'}
                                    </td>
                                    <td className="py-3 text-right font-medium text-stone-900">
                                        {Number(entry.credit) > 0
                                            ? Number(
                                                  entry.credit,
                                              ).toLocaleString('fr-FR')
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-stone-200 bg-stone-50 font-bold">
                                <td
                                    colSpan={2}
                                    className="px-2 py-3 text-right"
                                >
                                    Total
                                </td>
                                <td className="py-3 text-right text-indigo-700">
                                    {totalDebit.toLocaleString('fr-FR')}
                                </td>
                                <td className="py-3 text-right text-indigo-700">
                                    {totalCredit.toLocaleString('fr-FR')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    }

    // Vue Édition
    return (
        <form
            onSubmit={handleSave}
            className="overflow-hidden rounded-xl border-2 border-indigo-200 bg-white shadow-md ring-4 ring-indigo-50"
        >
            <div className="border-b border-indigo-100 bg-indigo-50/50 px-6 py-4">
                <div className="mb-4">
                    <label className="mb-1 block text-xs font-medium text-stone-600">
                        Libellé de l'écriture
                    </label>
                    <input
                        type="text"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                    />
                </div>
            </div>

            <div className="overflow-x-auto px-6 py-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-left text-stone-500">
                            <th className="w-1/3 pb-2 font-medium">Compte</th>
                            <th className="w-1/3 pb-2 font-medium">Libellé</th>
                            <th className="w-1/6 pb-2 text-right font-medium">
                                Débit
                            </th>
                            <th className="w-1/6 pb-2 text-right font-medium">
                                Crédit
                            </th>
                            <th className="w-10 pb-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {data.entries.map((entry, idx) => (
                            <tr key={idx}>
                                <td className="py-2 pr-2">
                                    <select
                                        value={entry.account_id}
                                        onChange={(e) => {
                                            const newEntries = [
                                                ...data.entries,
                                            ];
                                            newEntries[idx].account_id =
                                                parseInt(e.target.value);
                                            setData('entries', newEntries);
                                        }}
                                        className="w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        {accounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.code} - {acc.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        value={entry.description}
                                        onChange={(e) => {
                                            const newEntries = [
                                                ...data.entries,
                                            ];
                                            newEntries[idx].description =
                                                e.target.value;
                                            setData('entries', newEntries);
                                        }}
                                        className="w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={entry.debit}
                                        onChange={(e) => {
                                            const newEntries = [
                                                ...data.entries,
                                            ];
                                            newEntries[idx].debit =
                                                parseFloat(e.target.value) || 0;
                                            if (newEntries[idx].debit > 0)
                                                newEntries[idx].credit = 0;
                                            setData('entries', newEntries);
                                        }}
                                        className="w-full rounded-md border-stone-300 text-right shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </td>
                                <td className="py-2 pl-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={entry.credit}
                                        onChange={(e) => {
                                            const newEntries = [
                                                ...data.entries,
                                            ];
                                            newEntries[idx].credit =
                                                parseFloat(e.target.value) || 0;
                                            if (newEntries[idx].credit > 0)
                                                newEntries[idx].debit = 0;
                                            setData('entries', newEntries);
                                        }}
                                        className="w-full rounded-md border-stone-300 text-right shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </td>
                                <td className="py-2 text-right">
                                    <button
                                        type="button"
                                        onClick={() => removeEntry(idx)}
                                        className="p-1 text-stone-400 transition-colors hover:text-red-500"
                                        disabled={data.entries.length <= 2}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={5} className="py-3">
                                <button
                                    type="button"
                                    onClick={addEntry}
                                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                    <Plus className="h-4 w-4" /> Ajouter une
                                    ligne
                                </button>
                            </td>
                        </tr>
                        <tr className="border-t border-stone-200 bg-stone-50 font-bold">
                            <td colSpan={2} className="px-2 py-3 text-right">
                                Total
                            </td>
                            <td
                                className={`py-3 text-right ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}
                            >
                                {totalDebit.toLocaleString('fr-FR')}
                            </td>
                            <td
                                className={`py-3 pl-2 text-right ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}
                            >
                                {totalCredit.toLocaleString('fr-FR')}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                {!isBalanced && (
                    <p className="mt-2 flex items-center justify-end gap-1 text-sm font-medium text-red-500">
                        <XCircle className="h-4 w-4" /> L'écriture n'est pas
                        équilibrée (Différence:{' '}
                        {Math.abs(totalDebit - totalCredit).toLocaleString(
                            'fr-FR',
                        )}
                        )
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-3 border-t border-stone-200 bg-stone-50 px-6 py-4">
                <button
                    type="button"
                    onClick={() => {
                        reset();
                        onCancel();
                    }}
                    className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={processing || !isBalanced}
                    className="flex items-center gap-2 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Save className="h-4 w-4" /> Enregistrer les modifications
                </button>
            </div>
        </form>
    );
}
