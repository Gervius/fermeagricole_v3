import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { inventaire } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Package, TrendingDown, AlertTriangle, Edit, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventaire',
        href: inventaire().url,
    },
    
];

interface InventoryItem {
    id: string;
    code: string;
    name: string;
    category: 'cereales' | 'proteines' | 'mineraux' | 'vitamines' | 'additifs' | 'autres';
    unit: string;
    stockTheory: number;
    stockActual: number;
    stockMin: number;
    unitPrice: number;
}
  
interface StockMovement {
    id: string;
    itemId: string;
    itemName: string;
    date: string;
    type: 'entry' | 'exit';
    quantity: number;
    reason: string;
    reference: string;
}
  
interface StockVariance {
    itemId: string;
    itemName: string;
    theory: number;
    actual: number;
    variance: number;
    variancePercent: number;
}

export default function Inventaire() {
    const [activeTab, setActiveTab] = useState<'items' | 'stock' | 'movements' | 'variances'>('items');
    const [showItemForm, setShowItemForm] = useState(false);
    const [showMovementForm, setShowMovementForm] = useState(false);

    const [items, setItems] = useState<InventoryItem[]>([
        {
            id: '1',
            code: 'MAT-001',
            name: 'Maïs grain',
            category: 'cereales',
            unit: 'kg',
            stockTheory: 2500,
            stockActual: 2450,
            stockMin: 500,
            unitPrice: 180,
        },
        {
            id: '2',
            code: 'MAT-002',
            name: 'Tourteau de soja',
            category: 'proteines',
            unit: 'kg',
            stockTheory: 1200,
            stockActual: 1180,
            stockMin: 300,
            unitPrice: 320,
        },
        {
            id: '3',
            code: 'MAT-003',
            name: 'Phosphate bicalcique',
            category: 'mineraux',
            unit: 'kg',
            stockTheory: 150,
            stockActual: 145,
            stockMin: 50,
            unitPrice: 450,
        },
        {
            id: '4',
            code: 'MAT-004',
            name: 'Prémix vitamines',
            category: 'vitamines',
            unit: 'kg',
            stockTheory: 80,
            stockActual: 80,
            stockMin: 20,
            unitPrice: 1200,
        },
        {
            id: '5',
            code: 'MAT-005',
            name: 'Calcaire',
            category: 'mineraux',
            unit: 'kg',
            stockTheory: 600,
            stockActual: 580,
            stockMin: 200,
            unitPrice: 85,
        },
    ]);

    const [movements, setMovements] = useState<StockMovement[]>([
        {
            id: '1',
            itemId: '1',
            itemName: 'Maïs grain',
            date: '2023-12-08',
            type: 'entry',
            quantity: 1000,
            reason: 'Achat fournisseur',
            reference: 'BL-2023-156',
        },
        {
            id: '2',
            itemId: '1',
            itemName: 'Maïs grain',
            date: '2023-12-09',
            type: 'exit',
            quantity: 450,
            reason: 'Fabrication aliment',
            reference: 'FAB-2023-042',
        },
        {
            id: '3',
            itemId: '2',
            itemName: 'Tourteau de soja',
            date: '2023-12-07',
            type: 'entry',
            quantity: 500,
            reason: 'Achat fournisseur',
            reference: 'BL-2023-155',
        },
    ]);

    const [itemFormData, setItemFormData] = useState({
            code: '',
            name: '',
            category: 'cereales' as InventoryItem['category'],
            unit: 'kg',
            stockActual: '',
            stockMin: '',
            unitPrice: '',
    });
    
    const [movementFormData, setMovementFormData] = useState({
            itemId: '',
            date: '',
            type: 'entry' as StockMovement['type'],
            quantity: '',
            reason: '',
            reference: '',
    });

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const stockActual = parseFloat(itemFormData.stockActual);
        const newItem: InventoryItem = {
            id: Date.now().toString(),
            code: itemFormData.code,
            name: itemFormData.name,
            category: itemFormData.category,
            unit: itemFormData.unit,
            stockTheory: stockActual,
            stockActual: stockActual,
            stockMin: parseFloat(itemFormData.stockMin),
            unitPrice: parseFloat(itemFormData.unitPrice),
        };
        setItems([...items, newItem]);
        setShowItemForm(false);
        setItemFormData({
          code: '',
          name: '',
          category: 'cereales',
          unit: 'kg',
          stockActual: '',
          stockMin: '',
          unitPrice: '',
        });
    };

    const handleMovementSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const item = items.find((i) => i.id === movementFormData.itemId);
        if (!item) return;
    
        const quantity = parseFloat(movementFormData.quantity);
        const newMovement: StockMovement = {
            id: Date.now().toString(),
            itemId: movementFormData.itemId,
            itemName: item.name,
            date: movementFormData.date,
            type: movementFormData.type,
            quantity,
            reason: movementFormData.reason,
            reference: movementFormData.reference,
        };
        
        setMovements([newMovement, ...movements]);
        
        // Update item stock
        const updatedItems = items.map((i) => {
            if (i.id === movementFormData.itemId) {
                const newStock = movementFormData.type === 'entry' 
                    ? i.stockTheory + quantity 
                    : i.stockTheory - quantity;
                return { ...i, stockTheory: newStock };
            }
            return i;
        });
        setItems(updatedItems);
        
        setShowMovementForm(false);
        setMovementFormData({
            itemId: '',
            date: '',
            type: 'entry',
            quantity: '',
            reason: '',
            reference: '',
        });
    };

    const totalStockValue = items.reduce((sum, item) => sum + (item.stockActual * item.unitPrice), 0);
    const lowStockItems = items.filter((item) => item.stockActual <= item.stockMin);
  
    const variances: StockVariance[] = items
        .map((item) => ({
            itemId: item.id,
            itemName: item.name,
            theory: item.stockTheory,
            actual: item.stockActual,
            variance: item.stockActual - item.stockTheory,
            variancePercent: item.stockTheory > 0 
                ? ((item.stockActual - item.stockTheory) / item.stockTheory) * 100 
                : 0,
        }))
        .filter((v) => Math.abs(v.variance) > 0);

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            cereales: 'Céréales',
            proteines: 'Protéines',
            mineraux: 'Minéraux',
            vitamines: 'Vitamines',
            additifs: 'Additifs',
            autres: 'Autres',
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            cereales: 'bg-amber-100 text-amber-700',
            proteines: 'bg-blue-100 text-blue-700',
            mineraux: 'bg-gray-100 text-gray-700',
            vitamines: 'bg-green-100 text-green-700',
            additifs: 'bg-purple-100 text-purple-700',
            autres: 'bg-pink-100 text-pink-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventaire" />
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-gray-900 mb-2">Gestion des stocks</h1>
                        <p className="text-gray-600">Inventaire des matières premières et composants</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowMovementForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <ArrowUpCircle className="w-5 h-5" />
                            Mouvement
                        </button>
                        <button
                            onClick={() => setShowItemForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                            <Plus className="w-5 h-5" />
                            Nouvel article
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{items.length}</div>
                        <div className="text-sm text-gray-600">Articles en stock</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Package className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{totalStockValue.toLocaleString()} FCFA</div>
                        <div className="text-sm text-gray-600">Valeur totale du stock</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{lowStockItems.length}</div>
                        <div className="text-sm text-gray-600">Alertes stock faible</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex gap-8">
                            <button
                                onClick={() => setActiveTab('items')}
                                className={`pb-4 px-2 border-b-2 transition-colors ${
                                    activeTab === 'items'
                                        ? 'border-amber-500 text-amber-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}>
                                Articles
                            </button>
                            <button
                                onClick={() => setActiveTab('stock')}
                                className={`pb-4 px-2 border-b-2 transition-colors ${
                                    activeTab === 'stock'
                                        ? 'border-amber-500 text-amber-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}>
                                État des stocks
                            </button>
                            <button
                                onClick={() => setActiveTab('movements')}
                                className={`pb-4 px-2 border-b-2 transition-colors ${
                                    activeTab === 'movements'
                                        ? 'border-amber-500 text-amber-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}>
                                Mouvements
                            </button>
                            <button
                                onClick={() => setActiveTab('variances')}
                                className={`pb-4 px-2 border-b-2 transition-colors ${
                                    activeTab === 'variances'
                                        ? 'border-amber-500 text-amber-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}>
                                Écarts d&apos;inventaire
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Articles Tab */}
                {activeTab === 'items' && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-gray-900">Liste des articles</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Code</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Nom</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Catégorie</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Unité</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Stock min</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Prix unitaire</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900">{item.code}</td>
                                            <td className="px-6 py-4 text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(item.category)}`}>
                                                    {getCategoryLabel(item.category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{item.unit}</td>
                                            <td className="px-6 py-4 text-gray-700">{item.stockMin.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-900">{item.unitPrice.toFixed(2)} FCFA</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


                {/* Stock Tab */}
                {activeTab === 'stock' && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-gray-900">État des stocks</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Article</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Stock théorique</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Stock réel</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Stock min</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Valeur</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {items.map((item) => {
                                        const isLowStock = item.stockActual <= item.stockMin;
                                        const stockValue = item.stockActual * item.unitPrice;
                  
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900">{item.name}</div>
                                                    <div className="text-sm text-gray-500">{item.code}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {item.stockTheory.toLocaleString()} {item.unit}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">
                                                    {item.stockActual.toLocaleString()} {item.unit}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {item.stockMin.toLocaleString()} {item.unit}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">{stockValue.toLocaleString()} FCFA</td>
                                                <td className="px-6 py-4">
                                                    {isLowStock ? (
                                                        <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                                                            Stock faible
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                                            OK
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Movements Tab */}
                {activeTab === 'movements' && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-gray-900">Historique des mouvements</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Date</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Article</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Type</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Quantité</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Motif</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Référence</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {movements.map((movement) => (
                                        <tr key={movement.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-700">
                                                {new Date(movement.date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">{movement.itemName}</td>
                                            <td className="px-6 py-4">
                                                {movement.type === 'entry' ? (
                                                    <span className="flex items-center gap-2 text-green-600">
                                                        <ArrowDownCircle className="w-4 h-4" />
                                                        Entrée
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-red-600">
                                                        <ArrowUpCircle className="w-4 h-4" />
                                                        Sortie
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {movement.type === 'entry' ? '+' : '-'}
                                                {movement.quantity.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{movement.reason}</td>
                                            <td className="px-6 py-4 text-gray-700">{movement.reference}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Variances Tab */}
                {activeTab === 'variances' && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-gray-900">Écarts d&apos;inventaire</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Différences entre stock théorique et stock réel
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Article</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Stock théorique</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Stock réel</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Écart</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Écart %</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {variances.map((variance) => {
                                        const isNegative = variance.variance < 0;
                                        const isSignificant = Math.abs(variance.variancePercent) > 5;
                                        return (
                                            <tr key={variance.itemId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-gray-900">{variance.itemName}</td>
                                                <td className="px-6 py-4 text-gray-700">{variance.theory.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-gray-700">{variance.actual.toLocaleString()}</td>
                                                <td className={`px-6 py-4 ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                                                    {variance.variance > 0 ? '+' : ''}{variance.variance.toLocaleString()}
                                                </td>
                                                <td className={`px-6 py-4 ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                                                    {variance.variancePercent > 0 ? '+' : ''}{variance.variancePercent.toFixed(2)}%
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isSignificant ? (
                                                        <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700">
                                                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                                                            Écart important
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                                                            Normal
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {variances.length === 0 && (
                                <div className="p-12 text-center text-gray-500">
                                    Aucun écart d&apos;inventaire détecté
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Add Item Modal */}
                {showItemForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-gray-900 mb-6">Nouvel article</h2>
                            <form onSubmit={handleItemSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Code article</label>
                                    <input
                                        type="text"
                                        value={itemFormData.code}
                                        onChange={(e) => setItemFormData({ ...itemFormData, code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: MAT-006"
                                        required/>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Nom de l&apos;article</label>
                                    <input
                                        type="text"
                                        value={itemFormData.name}
                                        onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: Blé concassé"
                                        required/>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Catégorie</label>
                                    <select
                                        value={itemFormData.category}
                                        onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value as InventoryItem['category'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required >
                                        <option value="cereales">Céréales</option>
                                        <option value="proteines">Protéines</option>
                                        <option value="mineraux">Minéraux</option>
                                        <option value="vitamines">Vitamines</option>
                                        <option value="additifs">Additifs</option>
                                        <option value="autres">Autres</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Unité de mesure</label>
                                    <select
                                        value={itemFormData.unit}
                                        onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required>
                                        <option value="kg">Kilogramme (kg)</option>
                                        <option value="L">Litre (L)</option>
                                        <option value="unité">Unité</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Stock initial</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={itemFormData.stockActual}
                                        onChange={(e) => setItemFormData({ ...itemFormData, stockActual: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: 1000"
                                        required/>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Stock minimum</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={itemFormData.stockMin}
                                        onChange={(e) => setItemFormData({ ...itemFormData, stockMin: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: 200"
                                        required/>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Prix unitaire (FCFA)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={itemFormData.unitPrice}
                                        onChange={(e) => setItemFormData({ ...itemFormData, unitPrice: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: 180.00"
                                        required/>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowItemForm(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                                        Créer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Movement Modal */}
                {showMovementForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-gray-900 mb-6">Nouveau mouvement de stock</h2>
                            <form onSubmit={handleMovementSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Article</label>
                                    <select
                                        value={movementFormData.itemId}
                                        onChange={(e) => setMovementFormData({ ...movementFormData, itemId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required>
                                        <option value="">Sélectionnez un article</option>
                                        {items.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.code} - {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={movementFormData.date}
                                        onChange={(e) => setMovementFormData({ ...movementFormData, date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Type de mouvement</label>
                                    <select
                                        value={movementFormData.type}
                                        onChange={(e) => setMovementFormData({ ...movementFormData, type: e.target.value as StockMovement['type'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="entry">Entrée</option>
                                        <option value="exit">Sortie</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Quantité</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={movementFormData.quantity}
                                        onChange={(e) => setMovementFormData({ ...movementFormData, quantity: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: 500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Motif</label>
                                    <input
                                        type="text"
                                        value={movementFormData.reason}
                                        onChange={(e) => setMovementFormData({ ...movementFormData, reason: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: Achat fournisseur"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Référence</label>
                                    <input
                                        type="text"
                                        value={movementFormData.reference}
                                        onChange={(e) => setMovementFormData({ ...movementFormData, reference: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: BL-2023-156"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowMovementForm(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>        
        </AppLayout>
    );
}