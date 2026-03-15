import { useToasts } from '@/components/ToastProvider';
import SettingsLayout from '@/layouts/settings/layout';
import {
    buildingsDestroy,
    buildingsIndex,
    buildingsStore,
    buildingsUpdate,
} from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Edit2, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Building {
    id: number;
    name: string;
    description: string | null;
    capacity: number | null;
}

interface Props {
    buildings: {
        data: Building[];
        current_page: number;
        last_page: number;
    };
    flash?: { success?: string; error?: string };
}

export default function Index({ buildings, flash }: Props) {
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, reset, processing, errors, clearErrors } =
        useForm({
            name: '',
            description: '',
            capacity: '',
        });

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (building: Building) => {
        clearErrors();
        setData({
            name: building.name,
            description: building.description || '',
            capacity: building.capacity ? building.capacity.toString() : '',
        });
        setEditingId(building.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure capacity is either a number or null/empty
        const payload = {
            ...data,
            capacity: data.capacity === '' ? null : parseInt(data.capacity),
        };

        if (editingId) {
            router.put(buildingsUpdate.url(editingId), payload, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            router.post(buildingsStore.url(), payload, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (building: Building) => {
        if (
            confirm(
                `Voulez-vous vraiment supprimer le bâtiment "${building.name}" ?`,
            )
        ) {
            router.delete(buildingsDestroy.url(building.id));
        }
    };

    return (
        <SettingsLayout
            breadcrumbs={[{ title: 'Bâtiments', href: buildingsIndex.url() }]}
        >
            <Head title="Gestion des Bâtiments" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-stone-900">
                            Bâtiments
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                            Gérez les espaces de votre ferme et leurs capacités.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" /> Ajouter un Bâtiment
                    </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-stone-200">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-stone-200 bg-stone-50 font-medium text-stone-500">
                            <tr>
                                <th className="px-6 py-3">Nom</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3 text-right">
                                    Capacité (Poules)
                                </th>
                                <th className="px-6 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 bg-white">
                            {buildings.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-8 text-center text-stone-500"
                                    >
                                        Aucun bâtiment configuré.
                                    </td>
                                </tr>
                            ) : (
                                buildings.data.map((building) => (
                                    <tr
                                        key={building.id}
                                        className="transition-colors hover:bg-stone-50"
                                    >
                                        <td className="flex items-center gap-3 px-6 py-4 font-medium text-stone-900">
                                            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-50 text-indigo-600">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            {building.name}
                                        </td>
                                        <td className="px-6 py-4 text-stone-600">
                                            {building.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-stone-900">
                                            {building.capacity
                                                ? building.capacity.toLocaleString(
                                                      'fr-FR',
                                                  )
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(building)
                                                    }
                                                    className="rounded p-1.5 text-stone-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(building)
                                                    }
                                                    className="rounded p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
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

            {/* Quick Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
                            <h3 className="text-lg font-medium text-stone-900">
                                {editingId
                                    ? 'Modifier le bâtiment'
                                    : 'Nouveau bâtiment'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-stone-400 hover:text-stone-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-700">
                                    Nom *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-lg border-stone-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-700">
                                    Capacité maximale (poules)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.capacity}
                                    onChange={(e) =>
                                        setData('capacity', e.target.value)
                                    }
                                    className="w-full rounded-lg border-stone-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Ex: 5000"
                                />
                                {errors.capacity && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.capacity}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-700">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={3}
                                    className="w-full resize-none rounded-lg border-stone-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t border-stone-100 pt-4">
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
                                        : 'Créer le bâtiment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SettingsLayout>
    );
}
