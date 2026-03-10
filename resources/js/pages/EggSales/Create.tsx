// resources/js/Pages/EggSales/Create.tsx
import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import EggSaleForm from '@/components/EggSales/EggSaleForm';
import { eggSalesStore, eggSalesIndex } from '@/routes';

interface Props {
    flocks: { id: number; name: string }[];
}

export default function Create({ flocks }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        sale_date: '',
        flock_id: '',
        customer_name: '',
        quantity: '',
        unit_price: '',
        tax_rate: '0',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(eggSalesStore.url(), {
            onSuccess: () => router.get(eggSalesIndex.url()),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Nouvelle vente', href: eggSalesIndex.url() }]}>
            <Head title="Nouvelle vente d'œufs" />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="bg-white border border-stone-200 rounded-xl p-6">
                    <h1 className="text-xl font-semibold text-stone-900 mb-6">Nouvelle vente d'œufs</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <EggSaleForm
                            data={data}
                            setData={(key, value) => setData(key as any, value)}
                            errors={errors}
                            flocks={flocks}
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
                                Enregistrer (brouillon)
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}