import AppLayout from '@/layouts/app-layout';
import { flocksUpdate } from '@/routes';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';

interface Building {
    id: number;
    name: string;
}

interface PageProps {
    flock: {
        id: number;
        name: string;
        building_id: number;
        arrival_date: string;
        initial_quantity: number;
        notes: string;
    };
    buildings: Building[];
}

export default function Edit({ flock, buildings }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: flock.name,
        building_id: flock.building_id,
        arrival_date: flock.arrival_date,
        initial_quantity: flock.initial_quantity,
        notes: flock.notes || '',
    });

    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(flocksUpdate.url(flock.id), {
            onSuccess: () => setShowConfirm(false),
        });
    };

    const inputClass =
        'w-full px-3.5 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white';

    const errorClass = 'text-red-600 text-xs mt-1';

    return (
        <AppLayout>
            <Head title="Modifier un lot" />
            <div className="min-h-screen bg-stone-50 font-sans">
                {/* Header */}
                <div className="border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto flex max-w-2xl items-center gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                            title="Retour"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                                Modifier le lot
                            </h1>
                            <p className="mt-0.5 text-sm text-stone-500">
                                Lot #{flock.id}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl px-8 py-8">
                    {/* Info Banner */}
                    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                        <div className="text-sm text-amber-800">
                            <p className="mb-1 font-medium">
                                Modifications limitées
                            </p>
                            <p className="text-amber-700">
                                Certains champs ne peuvent être modifiés que si
                                le lot est en brouillon.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 rounded-xl border border-stone-200 bg-white p-8"
                    >
                        {/* Nom */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-stone-900"
                            >
                                Nom du lot
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Ex : G-2024-03"
                                className={inputClass}
                            />
                            {errors.name && (
                                <div className={errorClass}>{errors.name}</div>
                            )}
                        </div>

                        {/* Bâtiment */}
                        <div>
                            <label
                                htmlFor="building_id"
                                className="mb-2 block text-sm font-medium text-stone-900"
                            >
                                Bâtiment
                            </label>
                            <select
                                id="building_id"
                                value={data.building_id}
                                onChange={(e) =>
                                    setData(
                                        'building_id',
                                        Number(e.target.value),
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="">
                                    Sélectionner un bâtiment
                                </option>
                                {buildings.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                            {errors.building_id && (
                                <div className={errorClass}>
                                    {errors.building_id}
                                </div>
                            )}
                        </div>

                        {/* Date d'arrivée */}
                        <div>
                            <label
                                htmlFor="arrival_date"
                                className="mb-2 block text-sm font-medium text-stone-900"
                            >
                                Date d'arrivée
                            </label>
                            <input
                                id="arrival_date"
                                type="date"
                                value={data.arrival_date}
                                onChange={(e) =>
                                    setData('arrival_date', e.target.value)
                                }
                                className={inputClass}
                            />
                            {errors.arrival_date && (
                                <div className={errorClass}>
                                    {errors.arrival_date}
                                </div>
                            )}
                        </div>

                        {/* Quantité initiale */}
                        <div>
                            <label
                                htmlFor="initial_quantity"
                                className="mb-2 block text-sm font-medium text-stone-900"
                            >
                                Quantité initiale
                            </label>
                            <input
                                id="initial_quantity"
                                type="number"
                                value={data.initial_quantity}
                                onChange={(e) =>
                                    setData(
                                        'initial_quantity',
                                        Number(e.target.value),
                                    )
                                }
                                placeholder="Ex : 5000"
                                min="1"
                                className={inputClass}
                            />
                            {errors.initial_quantity && (
                                <div className={errorClass}>
                                    {errors.initial_quantity}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label
                                htmlFor="notes"
                                className="mb-2 block text-sm font-medium text-stone-900"
                            >
                                Notes{' '}
                                <span className="text-stone-400">
                                    (optionnel)
                                </span>
                            </label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder="Observations, contexte particulier, etc."
                                rows={4}
                                className={`${inputClass} resize-none`}
                            />
                            {errors.notes && (
                                <div className={errorClass}>{errors.notes}</div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 border-t border-stone-100 pt-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="flex-1 rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={processing}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? 'Enregistrement...'
                                    : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
