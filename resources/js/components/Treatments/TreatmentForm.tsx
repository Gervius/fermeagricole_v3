interface TreatmentFormData {
    flock_id: string;
    treatment_date: string;
    veterinarian: string;
    treatment_type: string;
    description: string;
    cost: string;
    invoice_reference: string;
}

interface Props {
    data: TreatmentFormData;
    setData: (key: keyof TreatmentFormData, value: string) => void;
    errors: Record<string, string>;
    flocks: { id: number; name: string }[];
    isEditing?: boolean;
}

export default function TreatmentForm({
    data,
    setData,
    errors,
    flocks,
    isEditing,
}: Props) {
    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Lot *
                </label>
                <select
                    value={data.flock_id}
                    onChange={(e) => setData('flock_id', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                >
                    <option value="">Sélectionner un lot</option>
                    {flocks.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.name}
                        </option>
                    ))}
                </select>
                {errors.flock_id && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.flock_id}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Date du traitement *
                </label>
                <input
                    type="date"
                    value={data.treatment_date}
                    onChange={(e) => setData('treatment_date', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                />
                {errors.treatment_date && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.treatment_date}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Vétérinaire
                </label>
                <input
                    type="text"
                    value={data.veterinarian}
                    onChange={(e) => setData('veterinarian', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Nom du vétérinaire"
                />
                {errors.veterinarian && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.veterinarian}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Type de traitement
                </label>
                <input
                    type="text"
                    value={data.treatment_type}
                    onChange={(e) => setData('treatment_type', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ex: Vaccin, Antibiotique..."
                />
                {errors.treatment_type && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.treatment_type}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Coût (FCFA)
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={data.cost}
                    onChange={(e) => setData('cost', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="0.00"
                />
                {errors.cost && (
                    <p className="mt-1 text-xs text-red-500">{errors.cost}</p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Référence facture
                </label>
                <input
                    type="text"
                    value={data.invoice_reference}
                    onChange={(e) =>
                        setData('invoice_reference', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Fac-2025-001"
                />
                {errors.invoice_reference && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.invoice_reference}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Description / Notes
                </label>
                <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Informations complémentaires..."
                />
                {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.description}
                    </p>
                )}
            </div>

            {isEditing && (
                <p className="text-xs text-stone-500 italic">
                    Les champs marqués d'un * sont obligatoires.
                </p>
            )}
        </div>
    );
}
