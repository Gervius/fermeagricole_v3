import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ProductionForm from '@/components/FeedProductions/ProductionForm';
import { recipesCalculate ,feedProductionsStore, feedProductionsIndex } from '@/routes';

interface Props {
    recipes: { id: number; name: string; yield_unit: string }[];
    // Optionnel : si on veut afficher les détails des ingrédients en temps réel
    // on pourrait avoir une route API pour calculer les besoins
}

export default function Create({ recipes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        recipe_id: '',
        production_date: '',
        quantity: '',
        notes: '',
    });

    // État pour stocker les détails des ingrédients (optionnel)
    const [ingredientDetails, setIngredientDetails] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState(false);

    // Fonction pour calculer les ingrédients (appel API)
    const calculateIngredients = () => {
        if (!data.recipe_id || !data.quantity) return;
        router.get(recipesCalculate.url({ recipe: data.recipe_id, quantity: data.quantity }), {}, {
            preserveState: true,
            onSuccess: (page: any) => {
                setIngredientDetails(page.props.ingredients || []);
                setShowDetails(true);
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(feedProductionsStore.url(), {
            onSuccess: () => router.get(feedProductionsIndex.url()),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Nouvelle production', href: feedProductionsCreate.url() }]}>
            <Head title="Nouvelle production" />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="bg-white border border-stone-200 rounded-xl p-6">
                    <h1 className="text-xl font-semibold text-stone-900 mb-6">Nouvelle production d'aliments</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <ProductionForm
                            data={data}
                            setData={(key, value) => setData(key as any, value)}
                            errors={errors}
                            recipes={recipes}
                            showIngredientDetails={showDetails}
                            ingredientDetails={ingredientDetails}
                        />
                        {data.recipe_id && data.quantity && (
                            <button
                                type="button"
                                onClick={calculateIngredients}
                                className="text-sm text-amber-600 hover:text-amber-700 underline"
                            >
                                Calculer les ingrédients nécessaires
                            </button>
                        )}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.get(feedProductionsIndex.url())}
                                className="flex-1 px-4 py-2 border border-stone-200 text-stone-700 text-sm rounded-lg hover:bg-stone-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors disabled:opacity-40"
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