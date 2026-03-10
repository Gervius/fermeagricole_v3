// resources/js/Pages/EggSales/Edit.tsx
import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import EggSaleForm from '@/components/EggSales/EggSaleForm';
import { eggSalesUpdate, eggSalesIndex } from '@/routes';

interface Props {
    sale: {
        id: number;
        sale_date: string;
        flock_id: number;
        customer_name: string | null;
        quantity: number;
        unit_price: number;
        tax_rate: number;
    };
    flocks: { id: number; name: string }[];
}

export default function Edit({ sale, flocks }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        sale_date: sale.sale_date,
        flock_id: sale.flock_id.toString(),
        customer_name: sale.customer_name || '',
        quantity: sale.quantity.toString(),
        unit_price: sale.unit_price.toString(),
        tax_rate: sale.tax_rate.toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(eggSalesUpdate.url(sale.id), {
            onSuccess: () => router.get(eggSalesIndex.url()),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Modifier vente', href: eggSalesUpdate.url(sale.id) }]}>
            <Head title="Modifier vente d'œufs" />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="bg-white border border-stone-200 rounded-xl p-6">
                    <h1 className="text-xl font-semibold text-stone-900 mb-6">Modifier la vente</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <EggSaleForm
                            data={data}
                            setData={(key, value) => setData(key as any, value)}
                            errors={errors}
                            flocks={flocks}
                            isEditing
                        />
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.get(eggSalesIndex.url())}
                                className="flex-1 px-4 py-2 border border-stone-200 text-stone-700 text-sm rounded-lg hover:bg-stone-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors disabled:opacity-40"
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