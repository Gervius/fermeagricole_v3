import RecipeForm from '@/components/Recipes/RecipeForm';
import AppLayout from '@/layouts/app-layout';
import { recipesCreate, recipesIndex, recipesStore } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    ingredients: {
        quantity: number;
        rawMaterialId: any;
        id: number;
        name: string;
        default_unit_id: number;
        default_unit_symbol: string;
    }[];
    units: { id: number; name: string; symbol: string }[];
}

export default function Create({ ingredients, units }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        description: '',
        yield: '',
        unit_id: '',
        is_active: true,
        ingredients: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(recipesStore.url(), {
            onSuccess: () => router.get(recipesIndex.url()),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Nouvelle recette', href: recipesCreate.url() },
            ]}
        >
            <Head title="Nouvelle recette" />
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <h1 className="mb-6 text-xl font-semibold text-stone-900">
                        Nouvelle recette
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
                                Créer la recette
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

function setShowCreateModal(arg0: boolean) {
    throw new Error('Function not implemented.');
}
