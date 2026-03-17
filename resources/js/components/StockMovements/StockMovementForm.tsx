interface StockMovementFormData {
    ingredient_id: string;
    type: 'in' | 'out' | 'adjust';
    quantity: string;
    unit_id: string;
    unit_price: string;
    reason: string;
    reference: string;
}

interface Props {
    data: StockMovementFormData;
    setData: (key: keyof StockMovementFormData, value: string) => void;
    errors: Record<string, string>;
    ingredients: { id: number; name: string }[];
    units: { id: number; name: string; symbol: string }[];
}

export default function StockMovementForm({
    data,
    setData,
    errors,
    ingredients,
    units,
}: Props) {
    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Ingrédient *
                </label>
                <select
                    value={data.ingredient_id}
                    onChange={(e) => setData('ingredient_id', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                >
                    <option value="">Sélectionner un ingrédient</option>
                    {ingredients.map((i) => (
                        <option key={i.id} value={i.id}>
                            {i.name}
                        </option>
                    ))}
                </select>
                {errors.ingredient_id && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.ingredient_id}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Type de mouvement *
                </label>
                <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value as any)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                >
                    <option value="in">Entrée</option>
                    <option value="out">Sortie</option>
                    <option value="adjust">Ajustement</option>
                </select>
                {errors.type && (
                    <p className="mt-1 text-xs text-red-500">{errors.type}</p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Quantité *
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.quantity}
                    onChange={(e) => setData('quantity', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ex: 500"
                    required
                />
                {errors.quantity && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.quantity}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Unité *
                </label>
                <select
                    value={data.unit_id}
                    onChange={(e) => setData('unit_id', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                >
                    <option value="">Sélectionner une unité</option>
                    {units.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name} ({u.symbol})
                        </option>
                    ))}
                </select>
                {errors.unit_id && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.unit_id}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Prix unitaire (HT)
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.unit_price}
                    onChange={(e) => setData('unit_price', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="0.00"
                />
                {errors.unit_price && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.unit_price}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Motif / Référence
                </label>
                <input
                    type="text"
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ex: Achat fournisseur"
                />
                {errors.reason && (
                    <p className="mt-1 text-xs text-red-500">{errors.reason}</p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Référence externe (facultatif)
                </label>
                <input
                    type="text"
                    value={data.reference}
                    onChange={(e) => setData('reference', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ex: BL-2025-001"
                />
                {errors.reference && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.reference}
                    </p>
                )}
            </div>
        </div>
    );
}
