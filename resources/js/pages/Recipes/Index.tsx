import { ActionButton } from '@/components/action-button-made';
import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import {
    recipesCreate,
    recipesDestroy,
    recipesEdit,
    recipesIndex,
    recipesShow,
} from '@/routes';
import { Head, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Edit2,
    Eye,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect } from 'react';

// Types pour les recettes
interface Recipe {
    id: number;
    name: string;
    code: string;
    description: string | null;
    yield_quantity: number;
    yield_unit: string; // symbole de l'unité
    is_active: boolean;
    ingredients_count: number;
    // Permissions (si nécessaire)
    can_edit?: boolean;
    can_delete?: boolean;
}

interface RecipeIngredient {
    id?: number; // pour les lignes existantes
    ingredient_id: number;
    ingredient_name: string;
    quantity: number;
    unit_id: number;
    unit_symbol: string;
}

interface RecipeDetail extends Recipe {
    ingredients: RecipeIngredient[];
}

interface PaginatedRecipes {
    data: Recipe[];
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

interface IngredientOption {
    id: number;
    name: string;
    default_unit_id: number;
    default_unit_symbol: string;
}

interface PageProps {
    recipes: PaginatedRecipes;
    ingredients: IngredientOption[];
    units: UnitOption[];
    filters: any;
    flash?: { success?: string; error?: string };
}

export default function RecipesIndex({ recipes, flash }: PageProps) {
    const { addToast } = useToasts();

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const handleDelete = (recipe: Recipe) => {
        if (!confirm(`Supprimer la recette "${recipe.name}" ?`)) return;
        router.delete(recipesDestroy.url(recipe.id));
    };

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Recettes', href: recipesIndex.url() }]}
        >
            <Head title="Recettes alimentaires" />
            <div className="min-h-screen bg-stone-50 font-sans">
                {/* En-tête */}
                <div className="border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                                Recettes alimentaires
                            </h1>
                            <p className="mt-0.5 text-sm text-stone-500">
                                {recipes.total} recette
                                {recipes.total !== 1 ? 's' : ''} au total
                            </p>
                        </div>
                        <button
                            onClick={() => router.get(recipesCreate.url())}
                            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvelle recette
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
                    {/* Tableau */}
                    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Code
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Nom
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Description
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Rendement
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Nb ingrédients
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
                                    {recipes.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-5 py-12 text-center text-sm text-stone-400"
                                            >
                                                Aucune recette trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        recipes.data.map((recipe) => (
                                            <tr
                                                key={recipe.id}
                                                className="transition-colors hover:bg-stone-50"
                                            >
                                                <td className="px-5 py-4 font-mono text-stone-600">
                                                    {recipe.code}
                                                </td>
                                                <td className="px-5 py-4 font-medium text-stone-900">
                                                    {recipe.name}
                                                </td>
                                                <td className="max-w-xs truncate px-5 py-4 text-stone-600">
                                                    {recipe.description || '-'}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {recipe.yield_quantity}{' '}
                                                    {recipe.yield_unit}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {recipe.ingredients_count}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            recipe.is_active
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-slate-100 text-slate-500'
                                                        }`}
                                                    >
                                                        {recipe.is_active
                                                            ? 'Actif'
                                                            : 'Inactif'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1">
                                                        {/* Voir détails */}
                                                        <ActionButton
                                                            icon={
                                                                <Eye className="h-4 w-4" />
                                                            }
                                                            title="Voir la composition"
                                                            colorClass="hover:text-blue-600 hover:bg-blue-50"
                                                            onClick={() =>
                                                                router.get(
                                                                    recipesShow.url(
                                                                        recipe.id,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        {/* Modifier */}
                                                        <ActionButton
                                                            icon={
                                                                <Edit2 className="h-4 w-4" />
                                                            }
                                                            title="Modifier"
                                                            colorClass="hover:text-amber-600 hover:bg-amber-50"
                                                            onClick={() =>
                                                                router.get(
                                                                    recipesEdit.url(
                                                                        recipe.id,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        {/* Supprimer */}
                                                        <ActionButton
                                                            icon={
                                                                <Trash2 className="h-4 w-4" />
                                                            }
                                                            title="Supprimer"
                                                            colorClass="hover:text-red-600 hover:bg-red-50"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    recipe,
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

                        {/* Pagination */}
                        {recipes.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
                                <span>
                                    Page {recipes.current_page} sur{' '}
                                    {recipes.last_page} — {recipes.total}{' '}
                                    résultats
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={recipes.current_page === 1}
                                        onClick={() =>
                                            router.get(recipesIndex.url(), {
                                                page: recipes.current_page - 1,
                                            })
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        disabled={
                                            recipes.current_page ===
                                            recipes.last_page
                                        }
                                        onClick={() =>
                                            router.get(recipesIndex.url(), {
                                                page: recipes.current_page + 1,
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
        </AppLayout>
    );
}
