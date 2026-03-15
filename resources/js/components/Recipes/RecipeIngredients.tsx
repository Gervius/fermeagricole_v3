// Components/Recipes/RecipeIngredients.tsx
import { Plus, Trash2 } from 'lucide-react';

interface IngredientLine {
    id?: number; // pour l'édition (si on a un ID)
    ingredient_id: string;
    quantity: string;
    unit_id: string;
}

interface Props {
    ingredients: IngredientLine[];
    setIngredients: (ingredients: IngredientLine[]) => void;
    availableIngredients: {
        id: number;
        name: string;
        default_unit_id: number;
        default_unit_symbol: string;
    }[];
    units: { id: number; name: string; symbol: string }[];
    errors?: Record<string, string>;
}

export default function RecipeIngredients({
    ingredients,
    setIngredients,
    availableIngredients,
    units,
    errors,
}: Props) {
    const addLine = () => {
        setIngredients([
            ...ingredients,
            { ingredient_id: '', quantity: '', unit_id: '' },
        ]);
    };

    const removeLine = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const updateLine = (
        index: number,
        field: keyof IngredientLine,
        value: string,
    ) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Ingrédients de la recette
                </label>
                <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs text-white transition-colors hover:bg-amber-600"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter un ingrédient
                </button>
            </div>

            {ingredients.length === 0 ? (
                <div className="rounded-lg border border-dashed border-stone-200 py-4 text-center text-sm text-stone-400 italic">
                    Aucun ingrédient défini. Cliquez sur "Ajouter" pour
                    commencer.
                </div>
            ) : (
                <div className="space-y-3">
                    {ingredients.map((line, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-2 rounded-lg bg-stone-50 p-3"
                        >
                            <div className="flex-1">
                                <select
                                    value={line.ingredient_id}
                                    onChange={(e) =>
                                        updateLine(
                                            index,
                                            'ingredient_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                    required
                                >
                                    <option value="">
                                        Choisir un ingrédient
                                    </option>
                                    {availableIngredients.map((ing) => (
                                        <option key={ing.id} value={ing.id}>
                                            {ing.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-28">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={line.quantity}
                                    onChange={(e) =>
                                        updateLine(
                                            index,
                                            'quantity',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                    placeholder="Qté"
                                    required
                                />
                            </div>
                            <div className="w-24">
                                <select
                                    value={line.unit_id}
                                    onChange={(e) =>
                                        updateLine(
                                            index,
                                            'unit_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                    required
                                >
                                    <option value="">Unité</option>
                                    {units.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.symbol}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeLine(index)}
                                className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                title="Supprimer"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {errors?.ingredients && (
                <p className="mt-1 text-xs text-red-500">
                    {errors.ingredients}
                </p>
            )}
        </div>
    );
}
