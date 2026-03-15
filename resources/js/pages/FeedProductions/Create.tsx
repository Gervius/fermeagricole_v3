import ProductionForm from '@/components/FeedProductions/ProductionForm';
import AppLayout from '@/layouts/app-layout';
import { feedProductionsIndex, feedProductionsStore } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useMemo } from 'react';

interface RecipeIngredient {
    id: number;
    name: string;
    current_stock: number;
    default_unit: { symbol: string };
    pivot: {
        quantity: number;
        unit_id: number;
    };
}

interface Recipe {
    id: number;
    name: string;
    yield: number;
    unit: { symbol: string };
    ingredients: RecipeIngredient[];
}

interface Props {
    recipes: Recipe[];
}

export default function Create({ recipes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        recipe_id: '',
        production_date: new Date().toISOString().split('T')[0],
        quantity_produced: '',
        unit_id: '',
        notes: '',
    });

    // 1. On trouve la recette sélectionnée
    const selectedRecipe = useMemo(() => {
        const recipe = recipes.find((r) => r.id.toString() === data.recipe_id);
        if (recipe && !data.unit_id && recipe.unit) {
            // Un peu hacky de set dans un render, donc on le gère plutôt dans le onchange,
            // mais on va assumer que le select déclenche ça correctement dans ProductionForm
        }
        return recipe;
    }, [data.recipe_id, recipes]);

    // 2. Le fameux useMemo qui calcule tout en TEMPS RÉEL (Front-end pur)
    const ingredientDetails = useMemo(() => {
        if (
            !selectedRecipe ||
            !data.quantity_produced ||
            isNaN(Number(data.quantity_produced))
        )
            return [];

        const productionQty = Number(data.quantity_produced);
        // On calcule le facteur multiplicateur en fonction du rendement de base de la recette
        const factor = productionQty / selectedRecipe.yield;

        return selectedRecipe.ingredients.map((ing) => {
            const neededQty = ing.pivot.quantity * factor;
            return {
                id: ing.id,
                name: ing.name,
                needed: neededQty,
                current_stock: ing.current_stock,
                unit: ing.default_unit?.symbol || 'kg',
                hasEnough: ing.current_stock >= neededQty,
            };
        });
    }, [selectedRecipe, data.quantity_produced]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(feedProductionsStore.url(), {
            onSuccess: () => router.get(feedProductionsIndex.url()),
        });
    };

    // Adaptation pour le sous-composant existant
    const simplifiedRecipes = recipes.map((r) => ({
        id: r.id,
        name: r.name,
        yield_unit: r.unit?.symbol || '',
        unit_id: r.unit ? r.unit.id : null,
    }));

    return (
        <AppLayout breadcrumbs={[{ title: 'Nouvelle production', href: '#' }]}>
            <Head title="Nouvelle production" />
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                    <h1 className="mb-6 text-xl font-semibold text-stone-900">
                        Nouvelle production d'aliments
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <ProductionForm
                            data={data}
                            setData={(key, value) => setData(key as any, value)}
                            errors={errors}
                            recipes={simplifiedRecipes}
                        />

                        {/* Affichage Dynamique du Calculateur */}
                        {selectedRecipe &&
                            data.quantity_produced &&
                            Number(data.quantity_produced) > 0 && (
                                <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
                                    <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
                                        <h3 className="text-sm font-semibold text-stone-800">
                                            Impact sur les stocks (
                                            {selectedRecipe.name})
                                        </h3>
                                    </div>
                                    <div className="p-0">
                                        <table className="w-full text-sm">
                                            <thead className="bg-stone-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">
                                                        Ingrédient
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 uppercase">
                                                        Requis
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 uppercase">
                                                        Stock Actuel
                                                    </th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-stone-500 uppercase">
                                                        Statut
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100">
                                                {ingredientDetails.map(
                                                    (ing) => (
                                                        <tr
                                                            key={ing.id}
                                                            className={
                                                                ing.hasEnough
                                                                    ? ''
                                                                    : 'bg-red-50'
                                                            }
                                                        >
                                                            <td className="px-4 py-3 font-medium text-stone-900">
                                                                {ing.name}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-semibold text-amber-600">
                                                                {ing.needed.toLocaleString(
                                                                    'fr-FR',
                                                                    {
                                                                        maximumFractionDigits: 2,
                                                                    },
                                                                )}{' '}
                                                                {ing.unit}
                                                            </td>
                                                            <td
                                                                className={`px-4 py-3 text-right font-medium ${ing.hasEnough ? 'text-stone-700' : 'text-red-600'}`}
                                                            >
                                                                {ing.current_stock.toLocaleString(
                                                                    'fr-FR',
                                                                    {
                                                                        maximumFractionDigits: 2,
                                                                    },
                                                                )}{' '}
                                                                {ing.unit}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {ing.hasEnough ? (
                                                                    <span className="inline-flex items-center rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                                                        Suffisant
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                                                        Rupture
                                                                        (
                                                                        {Math.abs(
                                                                            ing.current_stock -
                                                                                ing.needed,
                                                                        ).toLocaleString(
                                                                            'fr-FR',
                                                                            {
                                                                                maximumFractionDigits: 2,
                                                                            },
                                                                        )}{' '}
                                                                        manquant)
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        <div className="mt-6 flex justify-end gap-3 border-t border-stone-100 pt-6">
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(feedProductionsIndex.url())
                                }
                                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-50"
                            >
                                Enregistrer (brouillon)
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
