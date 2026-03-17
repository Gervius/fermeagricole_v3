import ProductionForm from '@/components/FeedProductions/ProductionForm';
import AppLayout from '@/layouts/app-layout';
import { feedProductionsIndex, feedProductionsUpdate } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    production: {
        id: number;
        recipe_id: number;
        production_date: string;
        quantity_produced: number;
        unit_id: number;
        notes: string | null;
    };
    recipes: {
        id: number;
        name: string;
        yield_unit: string;
        unit_id?: number;
    }[];
}

export default function Edit({ production, recipes }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        recipe_id: production.recipe_id.toString(),
        production_date: production.production_date,
        quantity_produced: production.quantity_produced.toString(),
        unit_id: production.unit_id.toString(),
        notes: production.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(feedProductionsUpdate.url(production.id), {
            onSuccess: () => router.get(feedProductionsIndex.url()),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Modifier production',
                    href: feedProductionsUpdate.url(production.id),
                },
            ]}
        >
            <Head title="Modifier production" />
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <h1 className="mb-6 text-xl font-semibold text-stone-900">
                        Modifier la production
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <ProductionForm
                            data={data}
                            setData={(key, value) => setData(key as any, value)}
                            errors={errors}
                            recipes={recipes}
                        />
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(feedProductionsIndex.url())
                                }
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
