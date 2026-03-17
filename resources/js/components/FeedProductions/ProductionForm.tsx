interface ProductionFormData {
    recipe_id: string;
    production_date: string;
    quantity_produced: string;
    unit_id: string;
    notes: string;
}

interface Props {
    data: ProductionFormData;
    setData: (key: keyof ProductionFormData, value: string) => void;
    errors: Record<string, string>;
    recipes: { id: number; name: string; yield_unit: string }[];
    showIngredientDetails?: boolean; // pour afficher un récap des ingrédients nécessaires (optionnel)
    ingredientDetails?: { name: string; quantity: number; unit: string }[];
}

export default function ProductionForm({
    data,
    setData,
    errors,
    recipes,
    showIngredientDetails,
    ingredientDetails,
}: Props) {
    const selectedRecipe = recipes.find(
        (r) => r.id.toString() === data.recipe_id,
    );

    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Recette *
                </label>
                <select
                    value={data.recipe_id}
                    onChange={(e) => {
                        const newRecipeId = e.target.value;
                        setData('recipe_id', newRecipeId);

                        const matchedRecipe = recipes.find(
                            (r) => r.id.toString() === newRecipeId,
                        );
                        if (matchedRecipe && (matchedRecipe as any).unit_id) {
                            setData(
                                'unit_id',
                                (matchedRecipe as any).unit_id.toString(),
                            );
                        }
                    }}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                >
                    <option value="">Sélectionner une recette</option>
                    {recipes.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </select>
                {errors.recipe_id && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.recipe_id}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Date de production *
                </label>
                <input
                    type="date"
                    value={data.production_date}
                    onChange={(e) => setData('production_date', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                />
                {errors.production_date && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.production_date}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Quantité produite *{' '}
                    {selectedRecipe && `(${selectedRecipe.yield_unit})`}
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.quantity_produced}
                    onChange={(e) =>
                        setData('quantity_produced', e.target.value)
                    }
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ex: 1000"
                    required
                />
                {errors.quantity_produced && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.quantity_produced}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Notes (optionnel)
                </label>
                <textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Informations complémentaires..."
                />
                {errors.notes && (
                    <p className="mt-1 text-xs text-red-500">{errors.notes}</p>
                )}
            </div>

            {showIngredientDetails &&
                ingredientDetails &&
                ingredientDetails.length > 0 && (
                    <div className="mt-4 rounded-lg bg-stone-50 p-3">
                        <h3 className="mb-2 text-sm font-medium text-stone-700">
                            Ingrédients nécessaires :
                        </h3>
                        <ul className="space-y-1 text-xs">
                            {ingredientDetails.map((ing, idx) => (
                                <li key={idx} className="flex justify-between">
                                    <span>{ing.name}</span>
                                    <span className="font-medium">
                                        {ing.quantity} {ing.unit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
        </div>
    );
}
