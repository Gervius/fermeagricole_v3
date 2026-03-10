import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { comptabilite } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Comptabilite',
        href: comptabilite().url,
    },
    
];

interface Transaction {
    id: string;
    date: string;
    category: string;
    subcategory: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    account: string;
}

export default function Comptabilite() {
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'analytical'>('general');
  
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: '1',
            date: '2023-12-01',
            category: 'Ventes',
            subcategory: 'Œufs',
            description: 'Vente Leclerc - 5000 œufs',
            amount: 900,
            type: 'income',
            account: 'Produits',
        },
        {
            id: '2',
            date: '2023-11-30',
            category: 'Alimentation',
            subcategory: 'Grains',
            description: 'Achat aliment complet - 2 tonnes',
            amount: 1200,
            type: 'expense',
            account: 'Charges',
        },
        {
            id: '3',
            date: '2023-11-29',
            category: 'Vétérinaire',
            subcategory: 'Vaccination',
            description: 'Vaccin Newcastle - G-2023-05',
            amount: 245,
            type: 'expense',
            account: 'Charges',
        },
        {
            id: '4',
            date: '2023-11-28',
            category: 'Ventes',
            subcategory: 'Réforme',
            description: 'Vente poules réforme - 150 unités',
            amount: 525,
            type: 'income',
            account: 'Produits',
        },
    ]);

    const [formData, setFormData] = useState({
        date: '',
        category: '',
        subcategory: '',
        description: '',
        amount: '',
        type: 'expense' as Transaction['type'],
    });

    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            ...formData,
            amount: parseFloat(formData.amount),
            account: formData.type === 'income' ? 'Produits' : 'Charges',
        };
        setTransactions([newTransaction, ...transactions]);
        setShowForm(false);
        setFormData({
            date: '',
            category: '',
            subcategory: '',
            description: '',
            amount: '',
            type: 'expense',
        });
    };
    
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    // Analytical data
    const expensesByCategory = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value,
    }));

    const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

    const monthlyData = [
        { mois: 'Juil', produits: 38000, charges: 22000 },
        { mois: 'Août', produits: 41000, charges: 23500 },
        { mois: 'Sep', produits: 43000, charges: 24000 },
        { mois: 'Oct', produits: 42500, charges: 23800 },
        { mois: 'Nov', produits: 45280, charges: 25200 },
    ];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comptabilité" />
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-gray-900 mb-2">Comptabilité</h1>
                        <p className="text-gray-600">Gestion financière générale et analytique</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle écriture
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{totalIncome.toLocaleString()} FCFA</div>
                        <div className="text-sm text-gray-600">Total Produits</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{totalExpenses.toLocaleString()} FCFA</div>
                        <div className="text-sm text-gray-600">Total Charges</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                <DollarSign className={`w-6 h-6 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                            </div>
                        </div>
                        <div className={`text-2xl mb-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()} FCFA
                        </div>
                        <div className="text-sm text-gray-600">Résultat Net</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex gap-8">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`pb-4 px-2 border-b-2 transition-colors ${
                                    activeTab === 'general'
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Comptabilité Générale
                            </button>
                            <button
                                onClick={() => setActiveTab('analytical')}
                                className={`pb-4 px-2 border-b-2 transition-colors ${
                                    activeTab === 'analytical'
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Comptabilité Analytique
                            </button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'general' && (
                    <>
                        {/* General Accounting Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-gray-900">Journal des écritures</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Date</th>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Catégorie</th>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Description</th>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Compte</th>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Débit</th>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Crédit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {transactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-gray-700">
                                                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900">{transaction.category}</div>
                                                    <div className="text-sm text-gray-500">{transaction.subcategory}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{transaction.description}</td>
                                                <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm ${
                                                        transaction.type === 'income'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {transaction.account}
                                                </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">
                                                    {transaction.type === 'expense' ? `${transaction.amount.toFixed(2)} FCFA` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900">
                                                    {transaction.type === 'income' ? `${transaction.amount.toFixed(2)} FCFA` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Monthly Chart */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-gray-900 mb-6">Évolution mensuelle</h2>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="mois" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="produits" fill="#10b981" name="Produits (FCFA)" />
                                    <Bar dataKey="charges" fill="#ef4444" name="Charges (FCFA)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}

                {activeTab === 'analytical' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Expense Breakdown */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-gray-900 mb-6">Répartition des charges</h2>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Cost Centers */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-gray-900 mb-6">Centres de coûts</h2>
                            <div className="space-y-4">
                                {Object.entries(expensesByCategory).map(([category, amount]) => {
                                    const percentage = (amount / totalExpenses) * 100;
                                    return (
                                        <div key={category}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-gray-400" />
                                                    <span className="text-gray-900">{category}</span>
                                                </div>
                                                <span className="text-gray-900">{amount.toFixed(2)} FCFA</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-amber-500 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">{percentage.toFixed(1)}% du total</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Key Performance Indicators */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
                            <h2 className="text-gray-900 mb-6">Indicateurs de performance</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-2">Coût par œuf produit</div>
                                        <div className="text-2xl text-gray-900">0.08 FCFA</div>
                                        <div className="text-sm text-green-600 mt-1">-3% vs mois dernier</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-2">Marge brute</div>
                                        <div className="text-2xl text-gray-900">44.3%</div>
                                        <div className="text-sm text-green-600 mt-1">+2.1% vs mois dernier</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-2">ROI annuel estimé</div>
                                        <div className="text-2xl text-gray-900">18.5%</div>
                                        <div className="text-sm text-green-600 mt-1">+1.2% vs prévisions</div>
                                    </div>
                                </div>
                        </div>
                    </div>
                )}

                {/* Add Transaction Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-gray-900 mb-6">Nouvelle écriture comptable</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required/>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Transaction['type'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required>
                                        <option value="expense">Charge</option>
                                        <option value="income">Produit</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Catégorie</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: Alimentation"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Sous-catégorie</label>
                                    <input
                                        type="text"
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: Grains"
                                        required/>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Description détaillée"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Montant (FCFA)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: 1200.00"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
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
            </div>
            
        </AppLayout>
    );
}