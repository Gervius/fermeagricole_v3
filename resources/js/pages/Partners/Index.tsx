import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import {
    partnersDestroy,
    partnersIndex,
    partnersStore,
    partnersUpdate,
} from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2,
    Download,
    Edit2,
    Plus,
    Search,
    Trash2,
    Truck,
    User,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Partner {
    id: number;
    name: string;
    type: 'customer' | 'supplier' | 'both';
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
    balance: number;
}

interface Props {
    partners: {
        data: Partner[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        type?: string;
    };
    flash?: { success?: string; error?: string };
}

export default function Index({ partners, filters, flash }: Props) {
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, reset, processing, errors, clearErrors } =
        useForm({
            name: '',
            type: 'customer',
            phone: '',
            email: '',
            address: '',
            is_active: true,
        });

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get(
            partnersIndex.url(),
            {
                search: formData.get('search'),
                type: formData.get('type'),
            },
            { preserveState: true },
        );
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (partner: Partner) => {
        clearErrors();
        setData({
            name: partner.name,
            type: partner.type,
            phone: partner.phone || '',
            email: partner.email || '',
            address: partner.address || '',
            is_active: partner.is_active,
        });
        setEditingId(partner.id);
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
            router.put(partnersUpdate.url(editingId), data as any, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            router.post(partnersStore.url(), data as any, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (partner: Partner) => {
        if (confirm(`Supprimer le partenaire "${partner.name}" ?`)) {
            router.delete(partnersDestroy.url(partner.id));
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'customer':
                return (
                    <span className="flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                        <User className="h-3 w-3" /> Client
                    </span>
                );
            case 'supplier':
                return (
                    <span className="flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                        <Truck className="h-3 w-3" /> Fournisseur
                    </span>
                );
            case 'both':
                return (
                    <span className="flex items-center gap-1 rounded-md border border-purple-100 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600">
                        <Building2 className="h-3 w-3" /> Mixte
                    </span>
                );
            default:
                return type;
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Tiers & Partenaires', href: partnersIndex.url() },
            ]}
        >
            <Head title="Gestion des Partenaires" />
            <div className="min-h-screen bg-stone-50 pb-12 font-sans">
                {/* Header */}
                <div className="border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-stone-900">
                                <Building2 className="h-6 w-6 text-stone-400" />
                                Tiers & Partenaires
                            </h1>
                            <p className="mt-1 text-sm text-stone-500">
                                Gérez vos clients, fournisseurs et leurs soldes.
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-colors hover:bg-amber-600"
                        >
                            <Plus className="h-4 w-4" /> Nouveau Partenaire
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
                    {/* Filters */}
                    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row">
                        <form
                            onSubmit={handleSearch}
                            className="flex w-full flex-1 gap-3"
                        >
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Nom, Téléphone, Email..."
                                    className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pr-4 pl-9 text-sm transition-shadow focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>
                            <select
                                name="type"
                                defaultValue={filters.type}
                                className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            >
                                <option value="">Tous les types</option>
                                <option value="customer">Clients</option>
                                <option value="supplier">Fournisseurs</option>
                                <option value="both">Mixte</option>
                            </select>
                            <button
                                type="submit"
                                className="rounded-lg border border-stone-200 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200"
                            >
                                Rechercher
                            </button>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold tracking-wider text-stone-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Nom / Contact
                                        </th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4 text-right">
                                            Solde Actuel
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {partners.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-12 text-center text-stone-500"
                                            >
                                                Aucun partenaire trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        partners.data.map((partner) => (
                                            <tr
                                                key={partner.id}
                                                className={`transition-colors hover:bg-stone-50 ${!partner.is_active ? 'opacity-50' : ''}`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="text-base font-medium text-stone-900">
                                                        {partner.name}{' '}
                                                        {!partner.is_active &&
                                                            '(Inactif)'}
                                                    </div>
                                                    <div className="mt-1 flex gap-3 text-xs text-stone-500">
                                                        {partner.phone && (
                                                            <span>
                                                                {partner.phone}
                                                            </span>
                                                        )}
                                                        {partner.email && (
                                                            <span>
                                                                {partner.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getTypeLabel(partner.type)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div
                                                        className={`inline-flex items-center rounded-full border px-3 py-1 font-bold ${partner.balance > 0 ? 'border-red-200 bg-red-50 text-red-700' : partner.balance < 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-stone-200 bg-stone-100 text-stone-600'}`}
                                                    >
                                                        {formatCurrency(
                                                            Math.abs(
                                                                partner.balance,
                                                            ),
                                                        )}
                                                        <span className="ml-1 text-[10px] font-normal tracking-wider uppercase opacity-80">
                                                            {partner.balance > 0
                                                                ? 'Dû (Débiteur)'
                                                                : partner.balance <
                                                                    0
                                                                  ? 'Avoir (Créditeur)'
                                                                  : ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <a
                                                            href={`/partners/${partner.id}/statement`}
                                                            target="_blank"
                                                            title="Télécharger le relevé (3 derniers mois)"
                                                            className="rounded-md bg-indigo-50 p-2 text-indigo-600 transition-colors hover:bg-indigo-100"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    partner,
                                                                )
                                                            }
                                                            className="rounded-md p-2 text-stone-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    partner,
                                                                )
                                                            }
                                                            className="rounded-md p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-6 py-4">
                            <h3 className="text-lg font-medium text-stone-900">
                                {editingId
                                    ? 'Modifier le partenaire'
                                    : 'Nouveau partenaire'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1 text-stone-400 hover:text-stone-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-700">
                                    Nom complet *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-lg border-stone-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-stone-700">
                                        Type de Tiers *
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) =>
                                            setData('type', e.target.value)
                                        }
                                        className="w-full rounded-lg border-stone-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                    >
                                        <option value="customer">Client</option>
                                        <option value="supplier">
                                            Fournisseur
                                        </option>
                                        <option value="both">
                                            Mixte (Les deux)
                                        </option>
                                    </select>
                                    {errors.type && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-stone-700">
                                        Téléphone
                                    </label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="+226..."
                                        className="w-full rounded-lg border-stone-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-lg border-stone-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-700">
                                    Adresse
                                </label>
                                <textarea
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    rows={2}
                                    className="w-full resize-none rounded-lg border-stone-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-600"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium text-stone-700"
                                >
                                    Compte Actif
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
                                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                                >
                                    {editingId
                                        ? 'Mettre à jour'
                                        : 'Créer le partenaire'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
