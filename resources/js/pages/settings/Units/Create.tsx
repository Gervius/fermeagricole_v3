import UnitForm from '@/components/Units/UnitForm';
import SettingsLayout from '@/layouts/settings/layout';
import { unitsCreate, unitsIndex, unitsStore } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    baseUnits: { id: number; name: string; symbol: string }[];
}

export default function Create({ baseUnits }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        symbol: '',
        type: 'mass',
        base_unit_id: '',
        conversion_factor: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(unitsStore.url(), {
            onSuccess: () => router.get(unitsIndex.url()),
        });
    };

    return (
        <SettingsLayout
            breadcrumbs={[{ title: 'Nouvelle unité', href: unitsCreate.url() }]}
        >
            <Head title="Nouvelle unité" />
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <h1 className="mb-6 text-xl font-semibold text-stone-900">
                        Nouvelle unité de mesure
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <UnitForm
                            data={data}
                            setData={(key, value) => setData(key as any, value)}
                            errors={errors}
                            baseUnits={baseUnits}
                        />
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.get(unitsIndex.url())}
                                className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm text-white transition-colors hover:bg-amber-600 disabled:opacity-40"
                            >
                                Créer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SettingsLayout>
    );
}
