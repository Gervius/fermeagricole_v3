import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TrendingUp, TrendingDown, Egg, DollarSign, AlertCircle, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de Bord',
        href: dashboard().url,
    },
    
];


export default function Dashboard() {

    const stats = [
        {
          label: 'Poules actives',
          value: '12,450',
          change: '+2.5%',
          trend: 'up',
          icon: Egg,
          color: 'amber',
        },
        {
          label: 'Production quotidienne',
          value: '10,890',
          change: '+5.2%',
          trend: 'up',
          icon: Activity,
          color: 'green',
        },
        {
          label: 'Revenus ce mois',
          value: '45,280 FCFA',
          change: '+12.3%',
          trend: 'up',
          icon: DollarSign,
          color: 'blue',
        },
        {
          label: 'Alertes actives',
          value: '3',
          change: '-1',
          trend: 'down',
          icon: AlertCircle,
          color: 'red',
        },
      ];
    
      const productionData = [
        { date: 'Lun', oeufs: 10200, taux: 87 },
        { date: 'Mar', oeufs: 10500, taux: 89 },
        { date: 'Mer', oeufs: 10300, taux: 88 },
        { date: 'Jeu', oeufs: 10800, taux: 92 },
        { date: 'Ven', oeufs: 10900, taux: 93 },
        { date: 'Sam', oeufs: 10600, taux: 90 },
        { date: 'Dim', oeufs: 10400, taux: 89 },
      ];
    
      const revenueData = [
        { mois: 'Juil', ventes: 38000, charges: 22000 },
        { mois: 'Août', ventes: 41000, charges: 23500 },
        { mois: 'Sep', ventes: 43000, charges: 24000 },
        { mois: 'Oct', ventes: 42500, charges: 23800 },
        { mois: 'Nov', ventes: 45280, charges: 25200 },
      ];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de Bord" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        const colorClasses = {
                            amber: 'bg-amber-50 text-amber-600',
                            green: 'bg-green-50 text-green-600',
                            blue: 'bg-blue-50 text-blue-600',
                            red: 'bg-red-50 text-red-600',
                        };
                        return(
                            <div key={stat.label} className="rounded-lg border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        <span>{stat.change}</span>
                                    </div>
                                </div>
                                <div className="text-2xl text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Production Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="mb-6">
                            <h2 className="text-gray-900 mb-1">Production de la semaine</h2>
                            <p className="text-sm text-gray-600">Nombre d'œufs et taux de ponte</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={productionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6b7280" />
                                <YAxis yAxisId="left" stroke="#6b7280" />
                                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="oeufs" stroke="#f59e0b" strokeWidth={2} name="Œufs produits" />
                                <Line yAxisId="right" type="monotone" dataKey="taux" stroke="#10b981" strokeWidth={2} name="Taux (%)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="mb-6">
                            <h2 className="text-gray-900 mb-1">Analyse financière</h2>
                            <p className="text-sm text-gray-600">Ventes vs Charges (5 derniers mois)</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="mois" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="ventes" fill="#10b981" name="Ventes (FCFA)" />
                                <Bar dataKey="charges" fill="#ef4444" name="Charges (FCFA)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Alerts boucle for a faire*/}
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-gray-900 mb-4">Alertes récentes</h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-gray-900">Taux de ponte en baisse - Bâtiment A</div>
                                <div className="text-sm text-gray-600">Génération G-2023-04 • Il y a 2 heures</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-gray-900">Vaccination programmée demain</div>
                                <div className="text-sm text-gray-600">Génération G-2023-05 • Prévoir 250 doses</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-gray-900">Stock aliment faible</div>
                                <div className="text-sm text-gray-600">Reste 3 jours • Commander 2 tonnes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
