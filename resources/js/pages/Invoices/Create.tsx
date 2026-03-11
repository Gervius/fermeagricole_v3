import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Receipt, Save, ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { invoicesIndex, invoicesStore } from '@/routes';

interface Flock {
    id: number;
    name: string;
}

interface Props {
    activeFlocks: Flock[];
    customers: { id: number; name: string }[];
    nextInvoiceNumber: string;
    import?: {
        itemable_id: number;
        itemable_type: string;
        description: string;
        quantity: number;
        unit_price: number;
    };
}

export default function Create({ activeFlocks, customers, nextInvoiceNumber, import: importData }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        number: nextInvoiceNumber,
        partner_id: '',
        date: new Date().toISOString().split('T')[0],
        items: importData ? [importData] : [
            { description: '', quantity: 1, unit_price: 0, itemable_id: null as number | null, itemable_type: '' }
        ]
    });

    const addItem = () => {
        setData('items', [...data.items, { description: '', quantity: 1, unit_price: 0, itemable_id: null, itemable_type: '' }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        (newItems[index] as any)[field] = value;

        // Auto-description based on selection
        if (field === 'itemable_type') {
            newItems[index].itemable_id = null; // reset id when type changes
            if (value === 'App\\Models\\EggMovement') {
                newItems[index].description = 'Plateaux d\'œufs';
            }
        }
        if (field === 'itemable_id' && newItems[index].itemable_type === 'App\\Models\\Flock') {
            const flock = activeFlocks.find(f => f.id === Number(value));
            if (flock) {
                newItems[index].description = `Poules de réforme (Lot ${flock.name})`;
            }
        }

        setData('items', newItems);
    };

    const totalHT = data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(invoicesStore.url());
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Factures', href: invoicesIndex.url() }, { title: 'Nouvelle', href: '#' }]}>
            <Head title="Nouvelle Facture" />
            <div className="max-w-4xl mx-auto py-8 px-4">
                
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.get(invoicesIndex.url())} className="p-2 text-stone-400 hover:text-stone-900 bg-white border border-stone-200 rounded-lg shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-indigo-600" />
                        Nouvelle Facture
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Header Facture */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-stone-900 mb-4 border-b border-stone-100 pb-3">Informations générales</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Numéro *</label>
                                <input 
                                    type="text" 
                                    value={data.number} 
                                    onChange={e => setData('number', e.target.value)} 
                                    className="w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono text-stone-500 bg-stone-50"
                                    readOnly
                                />
                                {errors.number && <p className="mt-1 text-xs text-red-600">{errors.number}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-stone-700 mb-1">Client *</label>
                                <select 
                                    value={data.partner_id} 
                                    onChange={e => setData('partner_id', e.target.value)} 
                                    className="w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Sélectionner un client</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.partner_id && <p className="mt-1 text-xs text-red-600">{errors.partner_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Date *</label>
                                <input 
                                    type="date" 
                                    value={data.date} 
                                    onChange={e => setData('date', e.target.value)} 
                                    className="w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Lignes de Facture */}
                    <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-stone-900">Articles facturés</h2>
                            <button 
                                type="button" 
                                onClick={addItem}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 text-stone-700 text-sm font-medium rounded-md hover:bg-stone-50 transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Ajouter ligne
                            </button>
                        </div>
                        
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-white border-b border-stone-200">
                                    <tr className="text-left text-stone-500 font-medium">
                                        <th className="px-4 py-3 w-1/5">Type de produit</th>
                                        <th className="px-4 py-3 w-1/5">Lien (Optionnel)</th>
                                        <th className="px-4 py-3 w-1/4">Description *</th>
                                        <th className="px-4 py-3 w-32 text-right">Qté *</th>
                                        <th className="px-4 py-3 w-32 text-right">Prix Unitaire *</th>
                                        <th className="px-4 py-3 w-32 text-right">Total</th>
                                        <th className="px-4 py-3 w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {data.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-stone-50">
                                            <td className="px-4 py-3">
                                                <select 
                                                    value={item.itemable_type} 
                                                    onChange={e => updateItem(idx, 'itemable_type', e.target.value)}
                                                    className="w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                                                >
                                                    <option value="">Standard (Autre)</option>
                                                    <option value="App\Models\EggMovement">Vente d'œufs</option>
                                                    <option value="App\Models\Flock">Vente de poules (Réforme)</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.itemable_type === 'App\\Models\\Flock' ? (
                                                    <select 
                                                        value={item.itemable_id || ''} 
                                                        onChange={e => updateItem(idx, 'itemable_id', e.target.value)}
                                                        className="w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                                                    >
                                                        <option value="">Sélectionner un Lot</option>
                                                        {activeFlocks.map(f => (
                                                            <option key={f.id} value={f.id}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-stone-400 text-xs italic">Non applicable</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="text" 
                                                    value={item.description} 
                                                    onChange={e => updateItem(idx, 'description', e.target.value)}
                                                    className="w-full rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                                                    required
                                                    placeholder="Description..."
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="number" 
                                                    min="0.1" step="0.1"
                                                    value={item.quantity} 
                                                    onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                    className="w-full text-right rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                                                    required
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="number" 
                                                    min="0" step="0.01"
                                                    value={item.unit_price} 
                                                    onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                                                    className="w-full text-right rounded-md border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                                                    required
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-stone-900 bg-stone-50/50">
                                                {(Number(item.quantity) * Number(item.unit_price)).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeItem(idx)}
                                                    disabled={data.items.length === 1}
                                                    className="p-1.5 text-stone-400 hover:text-red-600 disabled:opacity-30 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-stone-50 border-t border-stone-200">
                                        <td colSpan={5} className="px-4 py-4 text-right font-semibold text-stone-900 text-lg">Total TTC :</td>
                                        <td className="px-4 py-4 text-right font-bold text-indigo-700 text-xl whitespace-nowrap">
                                            {totalHT.toLocaleString('fr-FR')} FCFA
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.get(invoicesIndex.url())}
                            className="px-6 py-2.5 bg-white border border-stone-300 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors shadow-sm"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing || data.items.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            Créer la facture
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}