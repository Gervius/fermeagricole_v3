interface UnitFormData {
    name: string;
    symbol: string;
    type: 'mass' | 'volume' | 'unit';
    base_unit_id: string;
    conversion_factor: string;
}

interface Props {
    data: UnitFormData;
    setData: (key: keyof UnitFormData, value: string) => void;
    errors: Record<string, string>;
    baseUnits: { id: number; name: string; symbol: string }[];
}

export default function UnitForm({ data, setData, errors, baseUnits }: Props) {
    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Nom *
                </label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ex: Kilogramme"
                    required
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Symbole *
                </label>
                <input
                    type="text"
                    value={data.symbol}
                    onChange={(e) => setData('symbol', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ex: kg"
                    required
                />
                {errors.symbol && (
                    <p className="mt-1 text-xs text-red-500">{errors.symbol}</p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Type *
                </label>
                <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value as any)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                    <option value="mass">Masse</option>
                    <option value="volume">Volume</option>
                    <option value="unit">Unité</option>
                </select>
                {errors.type && (
                    <p className="mt-1 text-xs text-red-500">{errors.type}</p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Unité de base (pour conversion)
                </label>
                <select
                    value={data.base_unit_id}
                    onChange={(e) => setData('base_unit_id', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                    <option value="">Aucune</option>
                    {baseUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name} ({u.symbol})
                        </option>
                    ))}
                </select>
                {errors.base_unit_id && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.base_unit_id}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Facteur de conversion
                </label>
                <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={data.conversion_factor}
                    onChange={(e) =>
                        setData('conversion_factor', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ex: 0.001 pour gramme vers kilogramme"
                />
                {errors.conversion_factor && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.conversion_factor}
                    </p>
                )}
                <p className="mt-1 text-xs text-stone-400">
                    Le facteur multiplié par l'unité de base donne cette unité.
                    Laissez vide si c'est l'unité de base.
                </p>
            </div>
        </div>
    );
}
