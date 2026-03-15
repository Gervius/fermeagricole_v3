import StockMovementForm from '@/components/StockMovements/StockMovementForm';
import AppLayout from '@/layouts/app-layout';
import {
    stockMovementsCreate,
    stockMovementsIndex,
    stockMovementsStore,
} from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    ingredients: { id: number; name: string }[];
    units: { id: number; name: string; symbol: string }[];
}

export default function Create({ ingredients, units }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        ingredient_id: '',
        type: 'in',
        quantity: '',
        unit_id: '',
        unit_price: '',
        reason: '',
        reference: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(stockMovementsStore.url(), {
            onSuccess: () => router.get(stockMovementsIndex.url()),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Nouveau mouvement',
                    href: stockMovementsCreate.url(),
                },
            ]}
        >
            <Head title="Nouveau mouvement de stock" />
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <h1 className="mb-6 text-xl font-semibold text-stone-900">
                        Nouveau mouvement de stock
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <StockMovementForm
                            data={data}
                            setData={(key, value) => setData(key as any, value)}
                            errors={errors}
                            ingredients={ingredients}
                            units={units}
                        />
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(stockMovementsIndex.url())
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
                                Enregistrer (brouillon)
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
