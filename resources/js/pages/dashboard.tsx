import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Bell,
    Building,
    DollarSign,
    Egg,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de Bord',
        href: '/dashboard',
    },
];

interface DashboardProps {
    filters: { building_id?: number };
    buildings: { id: number; name: string }[];
    kpis: {
        active_hens: number;
        today_production: number;
        monthly_revenue: number;
    };
    alerts: {
        type: 'stock' | 'health' | 'planning';
        level: 'critical' | 'danger' | 'warning' | 'info';
        title: string;
        message: string;
    }[];
    productionChart?: { day: string; rate: number; eggs: number }[];
    financialChart?: { month: string; sales: number; expenses: number }[];
}

export default function Dashboard({
    filters,
    buildings,
    kpis,
    alerts,
    productionChart,
    financialChart,
}: DashboardProps) {
    const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            '/dashboard',
            { building_id: e.target.value },
            { preserveState: true },
        );
    };

    const stats = [
        {
            label: 'Poules actives',
            value: kpis.active_hens.toLocaleString('fr-FR'),
            icon: Egg,
            color: 'amber',
        },
        {
            label: "Œufs pondus (aujourd'hui)",
            value: kpis.today_production.toLocaleString('fr-FR'),
            icon: Activity,
            color: 'green',
        },
        {
            label: 'Revenus ce mois',
            value: `${kpis.monthly_revenue.toLocaleString('fr-FR')} FCFA`,
            icon: DollarSign,
            color: 'blue',
        },
        {
            label: 'Alertes actives',
            value: alerts.length.toString(),
            icon: Bell,
            color: alerts.length > 0 ? 'red' : 'green',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de Bord" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header & Filtres */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Synthèse Globale
                    </h1>
                    <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-gray-400" />
                        <select
                            className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={filters.building_id || ''}
                            onChange={handleBuildingChange}
                        >
                            <option value="">Tous les bâtiments</option>
                            {buildings.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        const colorClasses = {
                            amber: 'bg-amber-50 text-amber-600',
                            green: 'bg-green-50 text-green-600',
                            blue: 'bg-blue-50 text-blue-600',
                            red: 'bg-red-50 text-red-600',
                        };
                        return (
                            <div
                                key={stat.label}
                                className="rounded-lg border border-gray-200 p-6"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div
                                        className={`rounded-lg p-3 ${colorClasses[stat.color as keyof typeof colorClasses]}`}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="mb-1 text-2xl font-bold text-gray-900">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-gray-600">
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Production Chart */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-6">
                            <h2 className="mb-1 text-gray-900">
                                Production de la semaine
                            </h2>
                            <p className="text-sm text-gray-600">
                                Nombre d'œufs et taux de ponte
                            </p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            {productionChart ? (
                                <LineChart data={productionChart}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f0f0f0"
                                    />
                                    <XAxis dataKey="day" stroke="#6b7280" />
                                    <YAxis yAxisId="left" stroke="#6b7280" />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#6b7280"
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="eggs"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        name="Œufs produits"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="rate"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        name="Taux (%)"
                                    />
                                </LineChart>
                            ) : (
                                <div className="flex h-full items-center justify-center text-stone-400">
                                    Chargement...
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue Chart */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-6">
                            <h2 className="mb-1 text-gray-900">
                                Analyse financière
                            </h2>
                            <p className="text-sm text-gray-600">
                                Ventes vs Charges (5 derniers mois)
                            </p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            {financialChart ? (
                                <BarChart data={financialChart}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f0f0f0"
                                    />
                                    <XAxis dataKey="month" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip
                                        formatter={(val: number) =>
                                            `${val.toLocaleString('fr-FR')} FCFA`
                                        }
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="sales"
                                        fill="#10b981"
                                        name="Ventes (FCFA)"
                                    />
                                    <Bar
                                        dataKey="expenses"
                                        fill="#ef4444"
                                        name="Charges (FCFA)"
                                    />
                                </BarChart>
                            ) : (
                                <div className="flex h-full items-center justify-center text-stone-400">
                                    Chargement...
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alertes Prédictives */}
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
                    <h2 className="mb-4 font-semibold text-gray-900">
                        Alertes et Actions Requises
                    </h2>
                    <div className="space-y-3">
                        {alerts.length === 0 ? (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                Tout semble fonctionner normalement. Aucune
                                alerte critique.
                            </div>
                        ) : (
                            alerts.map((alert, idx) => {
                                const levelClasses = {
                                    critical:
                                        'bg-red-50 border-red-200 text-red-900',
                                    danger: 'bg-orange-50 border-orange-200 text-orange-900',
                                    warning:
                                        'bg-amber-50 border-amber-200 text-amber-900',
                                    info: 'bg-blue-50 border-blue-200 text-blue-900',
                                };
                                const iconColor = {
                                    critical: 'text-red-600',
                                    danger: 'text-orange-600',
                                    warning: 'text-amber-600',
                                    info: 'text-blue-600',
                                };

                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-3 rounded-lg border p-4 ${levelClasses[alert.level]}`}
                                    >
                                        <AlertCircle
                                            className={`mt-0.5 h-5 w-5 ${iconColor[alert.level]}`}
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold">
                                                {alert.title}
                                            </div>
                                            <div className="mt-1 text-sm opacity-90">
                                                {alert.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
