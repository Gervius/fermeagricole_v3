import TreatmentForm from '@/components/Treatments/TreatmentForm';
import AppLayout from '@/layouts/app-layout';
import { treatmentsIndex, treatmentsStore } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    flocks: { id: number; name: string }[];
}

export default function Create({ flocks }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        flock_id: '',
        treatment_date: '',
        veterinarian: '',
        treatment_type: '',
        description: '',
        cost: '',
        invoice_reference: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(treatmentsStore.url(), {
            onSuccess: () => router.get(treatmentsIndex.url()),
        });
    };

    return (
        <AppLayout>
            <Head title="Nouveau traitement" />
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <h1 className="mb-6 text-xl font-semibold text-stone-900">
                        Nouveau traitement vétérinaire
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <TreatmentForm
                            data={data}
                            setData={(key, value) => setData(key as any, value)}
                            errors={errors}
                            flocks={flocks}
                        />
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(treatmentsIndex.url())
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
