import AppLayout from '@/layouts/app-layout';
import { parametrages } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { useState } from 'react';
import { Plus, Settings as SettingsIcon, Link2, Trash2, Edit2 } from 'lucide-react';



const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Parametrages',
        href: parametrages().url,
    },
    
];


interface GeneralAccount {
    id: string;
    code: string;
    label: string;
    type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
    level: number;
    parentCode?: string;
}
  
interface AnalyticalAccount {
    id: string;
    code: string;
    label: string;
    category: 'production' | 'commercial' | 'administration' | 'financier';
    isActive: boolean;
}
  
interface AccountMapping {
    id: string;
    generalAccountCode: string;
    generalAccountLabel: string;
    analyticalAccountCode: string;
    analyticalAccountLabel: string;
    distributionPercent: number;
}

export function Parametrages() {
    const [activeTab, setActiveTab] = useState<'general' | 'analytical' | 'mapping'>('general');
    const [showGeneralForm, setShowGeneralForm] = useState(false);
    const [showAnalyticalForm, setShowAnalyticalForm] = useState(false);
    const [showMappingForm, setShowMappingForm] = useState(false);

    const [generalAccounts, setGeneralAccounts] = useState<GeneralAccount[]>([
        { id: '1', code: '101', label: 'Capital social', type: 'equity', level: 1 },
        { id: '2', code: '211', label: 'Terrains', type: 'asset', level: 1 },
        { id: '3', code: '213', label: 'Constructions', type: 'asset', level: 1 },
        { id: '4', code: '215', label: 'Installations techniques', type: 'asset', level: 1 },
        { id: '5', code: '401', label: 'Fournisseurs', type: 'liability', level: 1 },
        { id: '6', code: '411', label: 'Clients', type: 'asset', level: 1 },
        { id: '7', code: '512', label: 'Banque', type: 'asset', level: 1 },
        { id: '8', code: '531', label: 'Caisse', type: 'asset', level: 1 },
        { id: '9', code: '601', label: 'Achats de matières premières', type: 'expense', level: 1 },
        { id: '10', code: '602', label: 'Achats d\'aliments pour animaux', type: 'expense', level: 1 },
        { id: '11', code: '604', label: 'Achats de produits vétérinaires', type: 'expense', level: 1 },
        { id: '12', code: '605', label: 'Autres achats', type: 'expense', level: 1 },
        { id: '13', code: '621', label: 'Personnel intérimaire', type: 'expense', level: 1 },
        { id: '14', code: '622', label: 'Rémunérations du personnel', type: 'expense', level: 1 },
        { id: '15', code: '625', label: 'Charges sociales', type: 'expense', level: 1 },
        { id: '16', code: '701', label: 'Ventes d\'œufs', type: 'income', level: 1 },
        { id: '17', code: '702', label: 'Ventes de poules de réforme', type: 'income', level: 1 },
        { id: '18', code: '703', label: 'Autres produits', type: 'income', level: 1 },
    ]);
    
    const [analyticalAccounts, setAnalyticalAccounts] = useState<AnalyticalAccount[]>([
        { id: '1', code: 'PROD-01', label: 'Production Bâtiment A', category: 'production', isActive: true },
        { id: '2', code: 'PROD-02', label: 'Production Bâtiment B', category: 'production', isActive: true },
        { id: '3', code: 'PROD-03', label: 'Production Bâtiment C', category: 'production', isActive: true },
        { id: '4', code: 'COM-01', label: 'Commercial - Ventes directes', category: 'commercial', isActive: true },
        { id: '5', code: 'COM-02', label: 'Commercial - Distribution', category: 'commercial', isActive: true },
        { id: '6', code: 'ADM-01', label: 'Administration générale', category: 'administration', isActive: true },
        { id: '7', code: 'FIN-01', label: 'Charges financières', category: 'financier', isActive: true },
    ]);

    const [accountMappings, setAccountMappings] = useState<AccountMapping[]>([
        {
            id: '1',
            generalAccountCode: '601',
            generalAccountLabel: 'Achats de matières premières',
            analyticalAccountCode: 'PROD-01',
            analyticalAccountLabel: 'Production Bâtiment A',
            distributionPercent: 40,
        },
        {
            id: '2',
            generalAccountCode: '601',
            generalAccountLabel: 'Achats de matières premières',
            analyticalAccountCode: 'PROD-02',
            analyticalAccountLabel: 'Production Bâtiment B',
            distributionPercent: 35,
        },
        {
            id: '3',
            generalAccountCode: '601',
            generalAccountLabel: 'Achats de matières premières',
            analyticalAccountCode: 'PROD-03',
            analyticalAccountLabel: 'Production Bâtiment C',
            distributionPercent: 25,
        },
        {
            id: '4',
            generalAccountCode: '701',
            generalAccountLabel: 'Ventes d\'œufs',
            analyticalAccountCode: 'COM-01',
            analyticalAccountLabel: 'Commercial - Ventes directes',
            distributionPercent: 60,
        },
        {
            id: '5',
            generalAccountCode: '701',
            generalAccountLabel: 'Ventes d\'œufs',
            analyticalAccountCode: 'COM-02',
            analyticalAccountLabel: 'Commercial - Distribution',
            distributionPercent: 40,
        },
    ]);
    
    const [generalFormData, setGeneralFormData] = useState({
        code: '',
        label: '',
        type: 'expense' as GeneralAccount['type'],
        level: 1,
    });
    
    const [analyticalFormData, setAnalyticalFormData] = useState({
        code: '',
        label: '',
        category: 'production' as AnalyticalAccount['category'],
    });
    
    const [mappingFormData, setMappingFormData] = useState({
        generalAccountCode: '',
        analyticalAccountCode: '',
        distributionPercent: '',
    });
    
    const handleGeneralSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount: GeneralAccount = {
            id: Date.now().toString(),
            code: generalFormData.code,
            label: generalFormData.label,
            type: generalFormData.type,
            level: generalFormData.level,
        };
        setGeneralAccounts([...generalAccounts, newAccount].sort((a, b) => a.code.localeCompare(b.code)));
        setShowGeneralForm(false);
        setGeneralFormData({ code: '', label: '', type: 'expense', level: 1 });
    };
    
    const handleAnalyticalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount: AnalyticalAccount = {
            id: Date.now().toString(),
            code: analyticalFormData.code,
            label: analyticalFormData.label,
            category: analyticalFormData.category,
            isActive: true,
        };
        setAnalyticalAccounts([...analyticalAccounts, newAccount]);
        setShowAnalyticalForm(false);
        setAnalyticalFormData({ code: '', label: '', category: 'production' });
    };
    
    const handleMappingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const generalAccount = generalAccounts.find((a) => a.code === mappingFormData.generalAccountCode);
        const analyticalAccount = analyticalAccounts.find((a) => a.code === mappingFormData.analyticalAccountCode);
        
        if (!generalAccount || !analyticalAccount) return;
    
        const newMapping: AccountMapping = {
            id: Date.now().toString(),
            generalAccountCode: generalAccount.code,
            generalAccountLabel: generalAccount.label,
            analyticalAccountCode: analyticalAccount.code,
            analyticalAccountLabel: analyticalAccount.label,
            distributionPercent: parseFloat(mappingFormData.distributionPercent),
        };
        setAccountMappings([...accountMappings, newMapping]);
        setShowMappingForm(false);
        setMappingFormData({ generalAccountCode: '', analyticalAccountCode: '', distributionPercent: '' });
    };
    
    const deleteGeneralAccount = (id: string) => {
        setGeneralAccounts(generalAccounts.filter((a) => a.id !== id));
    };
    
    const deleteAnalyticalAccount = (id: string) => {
        setAnalyticalAccounts(analyticalAccounts.filter((a) => a.id !== id));
    };
    
    const deleteMapping = (id: string) => {
        setAccountMappings(accountMappings.filter((m) => m.id !== id));
    };
    
    const getAccountTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            asset: 'Actif',
            liability: 'Passif',
            equity: 'Capitaux propres',
            income: 'Produits',
            expense: 'Charges',
        };
        return labels[type] || type;
    };
    
    const getAccountTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            asset: 'bg-blue-100 text-blue-700',
            liability: 'bg-red-100 text-red-700',
            equity: 'bg-purple-100 text-purple-700',
            income: 'bg-green-100 text-green-700',
            expense: 'bg-orange-100 text-orange-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };
    
    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            production: 'Production',
            commercial: 'Commercial',
            administration: 'Administration',
            financier: 'Financier',
        };
        return labels[category] || category;
    };
    
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            production: 'bg-amber-100 text-amber-700',
            commercial: 'bg-green-100 text-green-700',
            administration: 'bg-blue-100 text-blue-700',
            financier: 'bg-purple-100 text-purple-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    // Calculate distribution totals for each general account
    const getDistributionTotal = (generalAccountCode: string) => {
        return accountMappings
            .filter((m) => m.generalAccountCode === generalAccountCode)
            .reduce((sum, m) => sum + m.distributionPercent, 0);
    };
    



    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parametrages" />

            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-gray-900 mb-2">Paramétrage comptable</h1>
                        <p className="text-gray-600">Configuration des comptes généraux et analytiques</p>
                    </div>
                    <div className="flex gap-3">
                        {activeTab === 'general' && (
                            <button
                                onClick={() => setShowGeneralForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Nouveau compte général
                            </button>
                        )}
                        {activeTab === 'analytical' && (
                            <button
                                onClick={() => setShowAnalyticalForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Nouveau compte analytique
                            </button>
                        )}
                        {activeTab === 'mapping' && (
                            <button
                                onClick={() => setShowMappingForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                <Link2 className="w-5 h-5" />
                                Nouveau maillage
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <SettingsIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{generalAccounts.length}</div>
                        <div className="text-sm text-gray-600">Comptes généraux</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <SettingsIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{analyticalAccounts.filter(a => a.isActive).length}</div>
                        <div className="text-sm text-gray-600">Comptes analytiques actifs</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Link2 className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{accountMappings.length}</div>
                        <div className="text-sm text-gray-600">Maillages configurés</div>
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
                                Plan comptable général
                            </button>
                            <button
                                onClick={() => setActiveTab('analytical')}
                                className={`pb-4 px-2 border-b-2 transition-colors ${
                                    activeTab === 'analytical'
                                        ? 'border-amber-500 text-amber-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Comptes analytiques
                            </button>
                            <button
                                onClick={() => setActiveTab('mapping')}
                                className={`pb-4 px-2 border-b-2 transition-colors ${
                                    activeTab === 'mapping'
                                        ? 'border-amber-500 text-amber-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Maillage analytique
                            </button>
                        </nav>
                    </div>
                </div>

                {/* General Accounts Tab */}
                {activeTab === 'general' && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-gray-900">Plan comptable général</h2>
                            <p className="text-sm text-gray-600 mt-1">Liste des comptes du plan comptable</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Code</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Libellé</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Type</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Niveau</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {generalAccounts.map((account) => (
                                        <tr key={account.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900">{account.code}</td>
                                            <td className="px-6 py-4 text-gray-900">{account.label}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm ${getAccountTypeColor(account.type)}`}>
                                                    {getAccountTypeLabel(account.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{account.level}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => deleteGeneralAccount(account.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Analytical Accounts Tab */}
                {activeTab === 'analytical' && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-gray-900">Comptes analytiques</h2>
                            <p className="text-sm text-gray-600 mt-1">Centres de coûts et sections analytiques</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Code</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Libellé</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Catégorie</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Statut</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {analyticalAccounts.map((account) => (
                                        <tr key={account.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900">{account.code}</td>
                                            <td className="px-6 py-4 text-gray-900">{account.label}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(account.category)}`}>
                                                    {getCategoryLabel(account.category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {account.isActive ? (
                                                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">Actif</span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">Inactif</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => deleteAnalyticalAccount(account.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Account Mapping Tab */}
                {activeTab === 'mapping' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-gray-900">Maillage des comptes</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Liaison entre comptes généraux et comptes analytiques avec clés de répartition
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Compte général</th>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Compte analytique</th>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Répartition</th>
                                            <th className="px-6 py-3 text-left text-sm text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {accountMappings.map((mapping) => (
                                            <tr key={mapping.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900">{mapping.generalAccountCode}</div>
                                                    <div className="text-sm text-gray-500">{mapping.generalAccountLabel}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900">{mapping.analyticalAccountCode}</div>
                                                    <div className="text-sm text-gray-500">{mapping.analyticalAccountLabel}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                                            <div
                                                            className="bg-amber-500 h-2 rounded-full"
                                                            style={{ width: `${mapping.distributionPercent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-gray-900">{mapping.distributionPercent}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => deleteMapping(mapping.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Distribution Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-gray-900 mb-4">Vérification des clés de répartition</h3>
                            <div className="space-y-3">
                                {Array.from(new Set(accountMappings.map((m) => m.generalAccountCode))).map((code) => {
                                    const total = getDistributionTotal(code);
                                    const account = generalAccounts.find((a) => a.code === code);
                                    const isValid = total === 100;

                                    return (
                                        <div key={code} className={`p-4 rounded-lg border ${isValid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-gray-900">{code} - {account?.label}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {accountMappings.filter((m) => m.generalAccountCode === code).length} maillage(s) configuré(s)
                                                    </div>
                                                </div>
                                                <div className={`text-2xl ${isValid ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {total}%
                                                </div>
                                            </div>
                                            {!isValid && (
                                                <div className="text-sm text-orange-700 mt-2">
                                                    ⚠️ La somme des clés de répartition doit être égale à 100%
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {accountMappings.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Aucun maillage configuré
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add General Account Modal */}
                {showGeneralForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-gray-900 mb-6">Nouveau compte général</h2>
                            <form onSubmit={handleGeneralSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Code compte</label>
                                    <input
                                        type="text"
                                        value={generalFormData.code}
                                        onChange={(e) => setGeneralFormData({ ...generalFormData, code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: 606"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Libellé</label>
                                    <input
                                        type="text"
                                        value={generalFormData.label}
                                        onChange={(e) => setGeneralFormData({ ...generalFormData, label: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: Achats non stockés de matières et fournitures"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Type de compte</label>
                                    <select
                                        value={generalFormData.type}
                                        onChange={(e) => setGeneralFormData({ ...generalFormData, type: e.target.value as GeneralAccount['type'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="asset">Actif</option>
                                        <option value="liability">Passif</option>
                                        <option value="equity">Capitaux propres</option>
                                        <option value="income">Produits</option>
                                        <option value="expense">Charges</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Niveau</label>
                                    <select
                                        value={generalFormData.level}
                                        onChange={(e) => setGeneralFormData({ ...generalFormData, level: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="1">Niveau 1</option>
                                        <option value="2">Niveau 2</option>
                                        <option value="3">Niveau 3</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowGeneralForm(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                    >
                                        Créer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Analytical Account Modal */}
                {showAnalyticalForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-gray-900 mb-6">Nouveau compte analytique</h2>
                            <form onSubmit={handleAnalyticalSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Code analytique</label>
                                    <input
                                        type="text"
                                        value={analyticalFormData.code}
                                        onChange={(e) => setAnalyticalFormData({ ...analyticalFormData, code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: PROD-04"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Libellé</label>
                                    <input
                                        type="text"
                                        value={analyticalFormData.label}
                                        onChange={(e) => setAnalyticalFormData({ ...analyticalFormData, label: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: Production Bâtiment D"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Catégorie</label>
                                    <select
                                        value={analyticalFormData.category}
                                        onChange={(e) => setAnalyticalFormData({ ...analyticalFormData, category: e.target.value as AnalyticalAccount['category'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="production">Production</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="administration">Administration</option>
                                        <option value="financier">Financier</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAnalyticalForm(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                    >
                                        Créer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Mapping Modal */}
                {showMappingForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-gray-900 mb-6">Nouveau maillage analytique</h2>
                            <form onSubmit={handleMappingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Compte général</label>
                                    <select
                                        value={mappingFormData.generalAccountCode}
                                        onChange={(e) => setMappingFormData({ ...mappingFormData, generalAccountCode: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Sélectionnez un compte</option>
                                        {generalAccounts.map((account) => (
                                            <option key={account.id} value={account.code}>
                                                {account.code} - {account.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Compte analytique</label>
                                    <select
                                        value={mappingFormData.analyticalAccountCode}
                                        onChange={(e) => setMappingFormData({ ...mappingFormData, analyticalAccountCode: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Sélectionnez un compte</option>
                                        {analyticalAccounts.filter(a => a.isActive).map((account) => (
                                            <option key={account.id} value={account.code}>
                                                {account.code} - {account.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Clé de répartition (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={mappingFormData.distributionPercent}
                                        onChange={(e) => setMappingFormData({ ...mappingFormData, distributionPercent: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: 33.33"
                                        required
                                    />
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-blue-700">
                                        💡 La somme des clés de répartition pour un compte général doit être égale à 100%
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowMappingForm(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                    >
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