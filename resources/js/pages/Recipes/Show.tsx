import AppLayout from '@/layouts/app-layout';
import { recipesIndex } from '@/routes';
import { Head, router } from '@inertiajs/react';

interface Props {
    recipe: {
        id: number;
        code: string;
        name: string;
        description: string | null;
        yield_quantity: number;
        yield_unit: string;
        is_active: boolean;
        ingredients: Array<{
            ingredient_name: string;
            quantity: number;
            unit_symbol: string;
        }>;
    };
}

export default function Show({ recipe }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Détail recette', href: '#' }]}>
            <Head title={recipe.name} />
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-stone-900">
                                {recipe.name}
                            </h1>
                            <p className="text-sm text-stone-500">
                                Code : {recipe.code}
                            </p>
                        </div>
                        <button
                            onClick={() => router.get(recipesIndex.url())}
                            className="text-stone-400 hover:text-stone-600"
                        >
                            Retour
                        </button>
                    </div>

                    <div className="mb-6">
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                recipe.is_active
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            {recipe.is_active ? 'Actif' : 'Inactif'}
                        </span>
                    </div>

                    {recipe.description && (
                        <div className="mb-6 rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
                            {recipe.description}
                        </div>
                    )}

                    <div className="mb-6">
                        <h2 className="mb-3 text-sm font-medium text-stone-600">
                            Rendement
                        </h2>
                        <p className="text-lg font-semibold text-stone-900">
                            {recipe.yield_quantity} {recipe.yield_unit}
                        </p>
                    </div>

                    <h2 className="mb-3 text-sm font-medium text-stone-600">
                        Composition
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-y border-stone-200 bg-stone-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-stone-500">
                                        Ingrédient
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">
                                        Quantité
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {recipe.ingredients.map((ing, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2 text-stone-700">
                                            {ing.ingredient_name}
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium text-stone-900">
                                            {ing.quantity} {ing.unit_symbol}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
