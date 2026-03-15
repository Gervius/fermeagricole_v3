import RecipeForm from '@/components/Recipes/RecipeForm';
import AppLayout from '@/layouts/app-layout';
import { recipesIndex, recipesUpdate } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    recipe: {
        id: number;
        code: string;
        name: string;
        description: string | null;
        yield: number;
        unit_id: number;
        is_active: boolean;
        ingredients: Array<{
            id?: number;
            ingredient_id: number;
            quantity: number;
            unit_id: number;
            pivot?: {
                quantity: number;
                unit_id: number;
            };
        }>;
    };
    ingredients: {
        id: number;
        name: string;
        default_unit_id: number;
        default_unit_symbol: string;
    }[];
    units: { id: number; name: string; symbol: string }[];
}

export default function Edit({ recipe, ingredients, units }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        code: recipe.code || '',
        name: recipe.name,
        description: recipe.description || '',
        yield: recipe.yield.toString(),
        unit_id: recipe.unit_id.toString(),
        is_active: recipe.is_active,
        ingredients: recipe.ingredients.map((ing) => ({
            id: ing.id,
            ingredient_id: ing.id?.toString(),
            quantity: ing.pivot
                ? ing.pivot.quantity.toString()
                : ing.quantity.toString(),
            unit_id: ing.pivot
                ? ing.pivot.unit_id.toString()
                : ing.unit_id.toString(),
        })),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(recipesUpdate.url(recipe.id), {
            onSuccess: () => router.get(recipesIndex.url()),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Modifier recette',
                    href: recipesUpdate.url(recipe.id),
                },
            ]}
        >
            <Head title="Modifier recette" />
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <h1 className="mb-6 text-xl font-semibold text-stone-900">
                        Modifier la recette
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <RecipeForm
                            data={data}
                            setData={(key, value) => setData(key as any, value)}
                            errors={errors}
                            ingredients={ingredients}
                            units={units}
                        />
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.get(recipesIndex.url())}
                                className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm text-white transition-colors hover:bg-amber-600 disabled:opacity-40"
                            >
                                Mettre à jour
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
