import { formatCurrency } from '@/lib/utils';
import { Banknote, Target, TrendingDown, TrendingUp } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface FinancialData {
    costs: {
        purchase: number;
        veterinary: number;
        feed_and_other: number;
        total: number;
    };
    revenues: {
        eggs: number;
        reforms: number;
        total: number;
    };
    kpis: {
        gross_margin: number;
        profitability_index: number;
        break_even_trays: number;
        status: 'profitable' | 'amortizing';
    };
    waterfall_data: {
        name: string;
        amount: number;
        isTotal?: boolean;
    }[];
}

interface Props {
    data: FinancialData;
}

export default function FlockProfitability({ data }: Props) {
    const { kpis, costs, revenues, waterfall_data } = data;

    // Préparation des données du Waterfall pour Recharts
    let runningTotal = 0;
    const chartData = waterfall_data.map((item, index) => {
        if (item.isTotal) {
            return {
                name: item.name,
                transparent: 0,
                val: item.amount,
                fill: item.amount >= 0 ? '#10b981' : '#ef4444', // Vert ou Rouge
            };
        }

        const previousTotal = runningTotal;
        runningTotal += item.amount;

        return {
            name: item.name,
            transparent: item.amount < 0 ? runningTotal : previousTotal,
            val: Math.abs(item.amount),
            fill: item.amount < 0 ? '#ef4444' : '#10b981', // Dépenses = Rouge, Entrées = Vert
            isExpense: item.amount < 0,
            originalAmount: item.amount,
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const value =
                data.isTotal !== undefined ? data.val : data.originalAmount;
            return (
                <div className="rounded-lg border border-stone-200 bg-white p-3 text-sm shadow-lg">
                    <p className="mb-1 font-semibold text-stone-900">{label}</p>
                    <p
                        className={
                            value >= 0
                                ? 'font-bold text-emerald-600'
                                : 'font-bold text-red-600'
                        }
                    >
                        {formatCurrency(value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Header KPIs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div
                    className={`rounded-2xl border p-5 ${kpis.status === 'profitable' ? 'border-emerald-200 bg-emerald-50' : 'border-orange-200 bg-orange-50'} flex items-start justify-between`}
                >
                    <div>
                        <p
                            className={`text-sm font-medium ${kpis.status === 'profitable' ? 'text-emerald-800' : 'text-orange-800'} mb-1`}
                        >
                            Marge Brute
                        </p>
                        <h3
                            className={`text-2xl font-bold ${kpis.status === 'profitable' ? 'text-emerald-600' : 'text-orange-600'}`}
                        >
                            {formatCurrency(kpis.gross_margin)}
                        </h3>
                        <p
                            className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${kpis.status === 'profitable' ? 'bg-emerald-200 text-emerald-900' : 'bg-orange-200 text-orange-900'}`}
                        >
                            {kpis.status === 'profitable'
                                ? 'Bénéficiaire'
                                : "En cours d'amortissement"}
                        </p>
                    </div>
                    {kpis.status === 'profitable' ? (
                        <TrendingUp className="h-6 w-6 text-emerald-500" />
                    ) : (
                        <TrendingDown className="h-6 w-6 text-orange-500" />
                    )}
                </div>

                <div className="flex items-start justify-between rounded-2xl border border-stone-200 bg-white p-5">
                    <div>
                        <p className="mb-1 text-sm font-medium text-stone-500">
                            Indice de Rentabilité
                        </p>
                        <h3 className="text-2xl font-bold text-stone-900">
                            {kpis.profitability_index.toFixed(2)}x
                        </h3>
                        <p className="mt-2 text-xs text-stone-400">
                            Revenus / Charges
                        </p>
                    </div>
                    <Banknote className="h-6 w-6 text-indigo-400" />
                </div>

                <div className="flex items-start justify-between rounded-2xl border border-stone-200 bg-white p-5">
                    <div>
                        <p className="mb-1 text-sm font-medium text-stone-500">
                            Seuil de rentabilité
                        </p>
                        <h3 className="text-2xl font-bold text-stone-900">
                            {kpis.break_even_trays > 0
                                ? kpis.break_even_trays.toLocaleString('fr-FR')
                                : '0'}{' '}
                            plateaux
                        </h3>
                        <p className="mt-2 text-xs text-stone-400">
                            Restants à vendre pour amortir
                        </p>
                    </div>
                    <Target className="h-6 w-6 text-sky-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Tableau Comparatif */}
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                    <div className="border-b border-stone-100 bg-stone-50 px-5 py-4">
                        <h3 className="font-semibold text-stone-900">
                            Répartition Financière
                        </h3>
                    </div>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-stone-100">
                            <tr className="bg-red-50/30">
                                <td className="px-5 py-3 text-stone-600">
                                    Achat initial
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-red-600">
                                    -{formatCurrency(costs.purchase)}
                                </td>
                            </tr>
                            <tr className="bg-red-50/30">
                                <td className="px-5 py-3 text-stone-600">
                                    Alimentation
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-red-600">
                                    -{formatCurrency(costs.feed_and_other)}
                                </td>
                            </tr>
                            <tr className="bg-red-50/30">
                                <td className="px-5 py-3 text-stone-600">
                                    Frais Vétérinaires
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-red-600">
                                    -{formatCurrency(costs.veterinary)}
                                </td>
                            </tr>
                            <tr className="border-t-2 border-stone-200 bg-stone-50 font-bold">
                                <td className="px-5 py-3 text-stone-900">
                                    Total Charges
                                </td>
                                <td className="px-5 py-3 text-right text-red-700">
                                    -{formatCurrency(costs.total)}
                                </td>
                            </tr>

                            <tr className="bg-emerald-50/30">
                                <td className="px-5 py-3 text-stone-600">
                                    Ventes d'œufs estim.
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-emerald-600">
                                    +{formatCurrency(revenues.eggs)}
                                </td>
                            </tr>
                            <tr className="bg-emerald-50/30">
                                <td className="px-5 py-3 text-stone-600">
                                    Vente réformes
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-emerald-600">
                                    +{formatCurrency(revenues.reforms)}
                                </td>
                            </tr>
                            <tr className="border-t-2 border-stone-200 bg-stone-50 font-bold">
                                <td className="px-5 py-3 text-stone-900">
                                    Total Revenus
                                </td>
                                <td className="px-5 py-3 text-right text-emerald-700">
                                    +{formatCurrency(revenues.total)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Graphique en Cascade */}
                <div className="flex flex-col rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-6 font-semibold text-stone-900">
                        Évolution de la rentabilité (Cascade)
                    </h3>
                    <div className="min-h-[300px] w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `${val / 1000}k`}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'transparent' }}
                                />

                                {/* Barre invisible pour créer l'effet d'empilement (Cascade) */}
                                <Bar
                                    dataKey="transparent"
                                    stackId="a"
                                    fill="transparent"
                                />

                                {/* Barre colorée pour la valeur */}
                                <Bar
                                    dataKey="val"
                                    stackId="a"
                                    radius={[2, 2, 2, 2]}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
