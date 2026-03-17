import { useToasts } from '@/components/ToastProvider';
import { ActionButton } from '@/components/action-button-made';
import SettingsLayout from '@/layouts/settings/layout';
import { unitsCreate, unitsDestroy, unitsEdit, unitsIndex } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

// Types pour les unités
interface Unit {
    id: number;
    name: string;
    symbol: string;
    type: 'mass' | 'volume' | 'unit';
    base_unit_name?: string | null;
    conversion_factor?: number | null;
}

interface PaginatedUnits {
    data: Unit[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

interface PageProps {
    units: PaginatedUnits;
    baseUnits?: Unit[]; // pour les formulaires de création/édition
    flash?: { success?: string; error?: string };
}

export default function UnitsIndex({ units, flash }: PageProps) {
    const { addToast } = useToasts();

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const handleDelete = (unit: Unit) => {
        if (!confirm(`Supprimer l'unité "${unit.name}" ?`)) return;
        router.delete(unitsDestroy.url(unit.id));
    };

    return (
        <SettingsLayout
            breadcrumbs={[
                { title: 'Unités de mesure', href: unitsIndex.url() },
            ]}
        >
            <Head title="Unités de mesure" />
            <div className="rounded-xl bg-white">
                <div className="border-b border-stone-200 px-8 py-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                                Unités de mesure
                            </h1>
                            <p className="mt-0.5 text-sm text-stone-500">
                                {units.total} unité
                                {units.total !== 1 ? 's' : ''} au total
                            </p>
                        </div>
                        <button
                            onClick={() => router.get(unitsCreate.url())}
                            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvelle unité
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
                                            Nom
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Symbole
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Type
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Unité de base
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Facteur conversion
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {units.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-5 py-12 text-center text-sm text-stone-400"
                                            >
                                                Aucune unité trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        units.data.map((unit) => (
                                            <tr
                                                key={unit.id}
                                                className="transition-colors hover:bg-stone-50"
                                            >
                                                <td className="px-5 py-4 font-medium text-stone-900">
                                                    {unit.name}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {unit.symbol}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {unit.type === 'mass'
                                                        ? 'Masse'
                                                        : unit.type === 'volume'
                                                          ? 'Volume'
                                                          : 'Unité'}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {unit.base_unit_name || '-'}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {unit.conversion_factor ||
                                                        '-'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <ActionButton
                                                            icon={
                                                                <Edit2 className="h-4 w-4" />
                                                            }
                                                            title="Modifier"
                                                            colorClass="hover:text-amber-600 hover:bg-amber-50"
                                                            onClick={() =>
                                                                router.get(
                                                                    unitsEdit.url(
                                                                        unit.id,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        <ActionButton
                                                            icon={
                                                                <Trash2 className="h-4 w-4" />
                                                            }
                                                            title="Supprimer"
                                                            colorClass="hover:text-red-600 hover:bg-red-50"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    unit,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {units.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
                                <span>
                                    Page {units.current_page} sur{' '}
                                    {units.last_page} — {units.total} résultats
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={units.current_page === 1}
                                        onClick={() =>
                                            router.get(unitsIndex.url(), {
                                                page: units.current_page - 1,
                                            })
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        disabled={
                                            units.current_page ===
                                            units.last_page
                                        }
                                        onClick={() =>
                                            router.get(unitsIndex.url(), {
                                                page: units.current_page + 1,
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
        </SettingsLayout>
    );
}
