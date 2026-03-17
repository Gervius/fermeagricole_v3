import { useToasts } from '@/components/ToastProvider';
import { ActionButton } from '@/components/action-button-made';
import SettingsLayout from '@/layouts/settings/layout';
import {
    ingredientsCreate,
    ingredientsDestroy,
    ingredientsEdit,
    ingredientsIndex,
} from '@/routes';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect } from 'react';

interface Ingredient {
    id: number;
    name: string;
    reference: string | null;
    default_unit: string; // nom de l'unité par défaut
    current_stock: number;
    min_stock: number | null;
    max_stock: number | null;
    description: string | null;
    is_active: boolean;
    // Permissions
    can_edit: boolean;
    can_delete: boolean;
}

interface PaginatedIngredients {
    data: Ingredient[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

interface UnitOption {
    id: number;
    name: string;
    symbol: string;
}

interface PageProps {
    ingredients: PaginatedIngredients;
    units: UnitOption[]; // pour les formulaires de création/édition
    flash?: { success?: string; error?: string };
}

export default function IngredientsIndex({ ingredients, flash }: PageProps) {
    const { addToast } = useToasts();

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const handleDelete = (ingredient: Ingredient) => {
        if (!confirm(`Supprimer l'ingrédient "${ingredient.name}" ?`)) return;
        router.delete(ingredientsDestroy.url(ingredient.id));
    };

    return (
        <SettingsLayout
            breadcrumbs={[
                { title: 'Ingrédients', href: ingredientsIndex.url() },
            ]}
        >
            <Head title="Ingrédients" />
            <div className="rounded-xl bg-white">
                <div className="border-b border-stone-200 px-8 py-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                                Ingrédients (matières premières)
                            </h1>
                            <p className="mt-0.5 text-sm text-stone-500">
                                {ingredients.total} ingrédient
                                {ingredients.total !== 1 ? 's' : ''} au total
                            </p>
                        </div>
                        <button
                            onClick={() => router.get(ingredientsCreate.url())}
                            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvel ingrédient
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
                                            Référence
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Stock actuel
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Seuil min
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Unité
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Statut
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {ingredients.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-5 py-12 text-center text-sm text-stone-400"
                                            >
                                                Aucun ingrédient trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        ingredients.data.map((ing) => (
                                            <tr
                                                key={ing.id}
                                                className="transition-colors hover:bg-stone-50"
                                            >
                                                <td className="px-5 py-4 font-medium text-stone-900">
                                                    {ing.name}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {ing.reference || '-'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="font-medium">
                                                        {ing.current_stock.toLocaleString(
                                                            'fr-FR',
                                                        )}
                                                    </span>
                                                    {ing.min_stock &&
                                                        ing.current_stock <=
                                                            ing.min_stock && (
                                                            <AlertTriangle className="ml-2 inline h-4 w-4 text-amber-500">
                                                                Stock bas
                                                            </AlertTriangle>
                                                        )}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {ing.min_stock ?? '-'}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {ing.default_unit}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ing.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                                                    >
                                                        {ing.is_active
                                                            ? 'Actif'
                                                            : 'Inactif'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1">
                                                        {ing.can_edit && (
                                                            <ActionButton
                                                                icon={
                                                                    <Edit2 className="h-4 w-4" />
                                                                }
                                                                title="Modifier"
                                                                colorClass="hover:text-amber-600 hover:bg-amber-50"
                                                                onClick={() =>
                                                                    router.get(
                                                                        ingredientsEdit.url(
                                                                            ing.id,
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                        {ing.can_delete && (
                                                            <ActionButton
                                                                icon={
                                                                    <Trash2 className="h-4 w-4" />
                                                                }
                                                                title="Supprimer"
                                                                colorClass="hover:text-red-600 hover:bg-red-50"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        ing,
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {ingredients.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
                                <span>
                                    Page {ingredients.current_page} sur{' '}
                                    {ingredients.last_page} —{' '}
                                    {ingredients.total} résultats
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={
                                            ingredients.current_page === 1
                                        }
                                        onClick={() =>
                                            router.get(ingredientsIndex.url(), {
                                                page:
                                                    ingredients.current_page -
                                                    1,
                                            })
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        disabled={
                                            ingredients.current_page ===
                                            ingredients.last_page
                                        }
                                        onClick={() =>
                                            router.get(ingredientsIndex.url(), {
                                                page:
                                                    ingredients.current_page +
                                                    1,
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
