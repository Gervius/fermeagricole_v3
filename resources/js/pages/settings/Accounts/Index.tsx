import { useToasts } from '@/components/ToastProvider';
import SettingsLayout from '@/layouts/settings/layout';
import { formatCurrency } from '@/lib/utils';
import {
    accountsDestroy,
    accountsIndex,
    accountsStore,
    accountsUpdate,
} from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Account {
    id: number;
    code: string;
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    is_active: boolean;
    debit?: number; // total débit (pour affichage)
    credit?: number; // total crédit
    balance?: number; // solde
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

    // États pour la modale
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, reset, processing, errors, clearErrors } =
        useForm({
            code: '',
            name: '',
            type: 'asset' as Account['type'],
            is_active: true,
        });

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            asset: 'Actif',
            liability: 'Passif',
            equity: 'Capitaux propres',
            revenue: 'Produits (Revenus)',
            expense: 'Charges (Dépenses)',
        };
        return labels[type] || type;
    };

    // Gestion de la modale
    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (account: Account) => {
        clearErrors();
        setData({
            code: account.code,
            name: account.name,
            type: account.type,
            is_active: account.is_active,
        });
        setEditingId(account.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            router.put(accountsUpdate.url(editingId), data as any, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            router.post(accountsStore.url(), data as any, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (account: Account) => {
        if (
            confirm(
                `Supprimer le compte comptable "${account.code} - ${account.name}" ?`,
            )
        ) {
            router.delete(accountsDestroy.url(account.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <SettingsLayout
            breadcrumbs={[
                { title: 'Plan comptable', href: accountsIndex.url() },
            ]}
        >
            <Head title="Plan comptable" />
            <div className="rounded-xl bg-white">
                <div className="border-b border-stone-200 px-8 py-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-stone-900">
                                <BookOpen className="h-6 w-6 text-stone-400" />
                                Plan comptable
                            </h1>
                            <p className="mt-0.5 text-sm text-stone-500">
                                {accounts.total} compte
                                {accounts.total !== 1 ? 's' : ''} enregistré
                                {accounts.total !== 1 ? 's' : ''} (Norme
                                SYSCOHADA)
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                        >
                            <Plus className="h-4 w-4" />
                            Nouveau compte
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
                    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Code
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Intitulé
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Type
                                        </th>
                                        <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Débit Cumulé
                                        </th>
                                        <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Crédit Cumulé
                                        </th>
                                        <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Solde Actuel
                                        </th>
                                        <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {accounts.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-5 py-12 text-center text-sm text-stone-400"
                                            >
                                                Aucun compte trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        accounts.data.map((acc) => (
                                            <tr
                                                key={acc.id}
                                                className={`transition-colors hover:bg-stone-50 ${!acc.is_active ? 'opacity-50' : ''}`}
                                            >
                                                <td className="px-5 py-4 font-mono font-bold text-indigo-600">
                                                    {acc.code}
                                                </td>
                                                <td className="px-5 py-4 font-medium text-stone-900">
                                                    {acc.name}{' '}
                                                    {!acc.is_active &&
                                                        '(Inactif)'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-700">
                                                        {getTypeLabel(acc.type)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right text-stone-600">
                                                    {formatCurrency(
                                                        acc.debit || 0,
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right text-stone-600">
                                                    {formatCurrency(
                                                        acc.credit || 0,
                                                    )}
                                                </td>
                                                <td
                                                    className={`px-5 py-4 text-right font-bold ${(acc.balance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                                                >
                                                    {formatCurrency(
                                                        acc.balance || 0,
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    acc,
                                                                )
                                                            }
                                                            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    acc,
                                                                )
                                                            }
                                                            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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
                            <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
                                <span>
                                    Page {accounts.current_page} sur{' '}
                                    {accounts.last_page} — {accounts.total}{' '}
                                    résultats
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={accounts.current_page === 1}
                                        onClick={() =>
                                            router.get(accountsIndex.url(), {
                                                page: accounts.current_page - 1,
                                            })
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        disabled={
                                            accounts.current_page ===
                                            accounts.last_page
                                        }
                                        onClick={() =>
                                            router.get(accountsIndex.url(), {
                                                page: accounts.current_page + 1,
                                            })
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

            {/* Modal Ajout/Modification */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-6 py-4">
                            <h3 className="text-lg font-medium text-stone-900">
                                {editingId
                                    ? 'Modifier le compte'
                                    : 'Nouveau compte comptable'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1 text-stone-400 hover:text-stone-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="mb-1 block text-sm font-medium text-stone-700">
                                        Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        className="w-full rounded-lg border-stone-300 font-mono focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Ex: 411"
                                        required
                                    />
                                    {errors.code && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-stone-700">
                                        Intitulé du compte *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="w-full rounded-lg border-stone-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Ex: Clients"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-700">
                                    Nature (Type) *
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) =>
                                        setData(
                                            'type',
                                            e.target.value as Account['type'],
                                        )
                                    }
                                    className="w-full rounded-lg border-stone-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="asset">
                                        Actif (Trésorerie, Créances, Stocks...)
                                    </option>
                                    <option value="liability">
                                        Passif (Dettes, Fournisseurs...)
                                    </option>
                                    <option value="equity">
                                        Capitaux Propres
                                    </option>
                                    <option value="revenue">
                                        Produits (Ventes, Gains...)
                                    </option>
                                    <option value="expense">
                                        Charges (Achats, Frais...)
                                    </option>
                                </select>
                                {errors.type && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium text-stone-700"
                                >
                                    Compte Actif (Visible dans les écritures)
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-stone-100 pt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {editingId
                                        ? 'Mettre à jour'
                                        : 'Créer le compte'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SettingsLayout>
    );
}
