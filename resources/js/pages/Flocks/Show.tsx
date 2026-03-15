import FlockProfitability from '@/components/Flocks/FlockProfitability';
import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import {
    flocksApprove,
    flocksDestroy,
    flocksReject,
    flocksSubmit,
} from '@/routes';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Edit2,
    MapPin,
    MessageCircle,
    Send,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type FlockStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'completed';
type RecordStatus = 'pending' | 'approved' | 'rejected';

interface FlockPermissions {
    can_edit: boolean;
    can_delete: boolean;
    can_submit: boolean;
    can_approve: boolean;
    can_reject: boolean;
}

interface Flock extends FlockPermissions {
    id: number;
    name: string;
    building: string;
    arrival_date: string;
    initial_quantity: number;
    current_quantity: number;
    status: FlockStatus;
    standard_mortality_rate?: number;
    notes?: string;
    creator: string;
    approver?: string;
    approved_at?: string;
    stats: {
        mortality_rate: number;
        total_eggs: number;
        egg_efficiency: number;
    };
}

interface DailyRecord {
    id: number;
    date: string;
    losses: number;
    eggs: number;
    notes: string;
    status: RecordStatus;
    created_by: string;
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    can_approve: boolean;
    can_reject: boolean;
}

interface PaginatedRecords {
    data: DailyRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PageProps {
    flock: Flock;
    dailyRecords: PaginatedRecords;
    financial_analysis: any; // On passe la prop du service backend
    flash?: { success?: string; error?: string };
    [key: string]: any;
}

// ─────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────

const STATUS_META: Record<FlockStatus, { label: string; classes: string }> = {
    draft: {
        label: 'Brouillon',
        classes: 'bg-slate-100 text-slate-600 border border-slate-200',
    },
    pending: {
        label: 'En attente',
        classes: 'bg-amber-100 text-amber-700 border border-amber-200',
    },
    active: {
        label: 'Actif',
        classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    },
    rejected: {
        label: 'Rejeté',
        classes: 'bg-red-100 text-red-600 border border-red-200',
    },
    completed: {
        label: 'Terminé',
        classes: 'bg-slate-100 text-slate-500 border border-slate-200',
    },
};

const RECORD_STATUS_META: Record<
    RecordStatus,
    { label: string; classes: string }
> = {
    pending: { label: 'En attente', classes: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approuvé', classes: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Rejeté', classes: 'bg-red-100 text-red-600' },
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function FlockShow() {
    const { flock, dailyRecords, financial_analysis, flash } =
        usePage<PageProps>().props;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'profitability'>(
        'overview',
    );
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const { addToast } = useToasts();

    useEffect(() => {
        if (flash?.success)
            addToast({ message: String(flash.success), type: 'success' });
        if (flash?.error)
            addToast({ message: String(flash.error), type: 'error' });

    }, []);

    // ── Handlers ────────────────────────────────

    const handleDelete = () => {
        if (!confirm(`Supprimer le lot "${flock.name}" ?`)) return;
        //TODO remplacer  router.delete(`/flocks/${flock.id}`);
        router.delete(flocksDestroy.url(flock.id));
    };

    const handleSubmitForApproval = () => {
        router.patch(flocksSubmit.url(flock.id));
    };

    const handleApprove = () => {
        router.patch(flocksApprove.url(flock.id));
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) return;
        router.patch(
            flocksReject.url(flock.id),
            { reason: rejectionReason },
            {
                onSuccess: () => {
                    setShowApproveModal(false);
                    setRejectionReason('');
                },
            },
        );
    };

    // ── Handlers ────────────────────────────────

    const handleWhatsAppShare = () => {
        const text =
            `🐔 *Rapport du Lot ${flock.name}*\n\n` +
            `📍 *Bâtiment*: ${flock.building}\n` +
            `👥 *Effectif Actuel*: ${flock.current_quantity.toLocaleString('fr-FR')} (Initial: ${flock.initial_quantity.toLocaleString('fr-FR')})\n` +
            `🥚 *Efficacité de ponte*: ${flock.stats.egg_efficiency}%\n` +
            `💀 *Taux de mortalité*: ${flock.stats.mortality_rate}% ` +
            (flock.standard_mortality_rate &&
            flock.stats.mortality_rate > flock.standard_mortality_rate
                ? '⚠️ (Élevé)'
                : '✅ (Normal)') +
            `\n\n_Généré depuis l'application de gestion_`;

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // ── Statistics ──────────────────────────────

    const approvedRecords = dailyRecords.data.filter(
        (r) => r.status === 'approved',
    );
    const recordsStats = {
        totalLosses: approvedRecords.reduce((s, r) => s + r.losses, 0),
        avgEggs: approvedRecords.length
            ? Math.round(
                  approvedRecords.reduce((s, r) => s + r.eggs, 0) /
                      approvedRecords.length,
              )
            : 0,
        count: approvedRecords.length,
    };

    // Preparer les données pour le graphique (triées par date chronologique)
    const chartData = [...approvedRecords]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((r) => ({
            date: new Date(r.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
            }),
            Oeufs: r.eggs,
            Pertes: r.losses,
        }));

    const sm = STATUS_META[flock.status];

    const mortalityIsHigh =
        flock.standard_mortality_rate &&
        flock.stats.mortality_rate > flock.standard_mortality_rate;

    // ─────────────────────────────────────────────

    return (
        <AppLayout>
            <Head title={`Lot — ${flock.name}`} />
            <div className="min-h-screen bg-stone-50 font-sans">
                {/* Server flashes are shown via ToastProvider */}

                {/* ── Header ── */}
                <div className="border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-stone-900">
                                    {flock.name}
                                </h1>
                                <p className="mt-1 text-sm text-stone-500">
                                    Détails du lot
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${sm.classes}`}
                            >
                                {sm.label}
                            </span>
                        </div>

                        {/* ── Action buttons ── */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => router.get(`/flocks`)}
                                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                            >
                                ← Retour
                            </button>

                            {flock.can_edit && (
                                <button
                                    onClick={() =>
                                        router.get(`/flocks/${flock.id}/edit`)
                                    }
                                    className="flex items-center gap-2 rounded-lg border border-amber-200 px-4 py-2 text-sm text-amber-600 transition-colors hover:bg-amber-50"
                                >
                                    <Edit2 className="h-4 w-4" /> Modifier
                                </button>
                            )}

                            {flock.can_submit && (
                                <button
                                    onClick={handleSubmitForApproval}
                                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700"
                                >
                                    <Send className="h-4 w-4" /> Soumettre pour
                                    approbation
                                </button>
                            )}

                            {(flock.can_approve || flock.can_reject) && (
                                <button
                                    onClick={() => setShowApproveModal(true)}
                                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-700"
                                >
                                    <AlertCircle className="h-4 w-4" />{' '}
                                    Approuver / Rejeter
                                </button>
                            )}

                            {flock.can_delete && (
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
                                >
                                    <Trash2 className="h-4 w-4" /> Supprimer
                                </button>
                            )}

                            {flock.status === 'active' && (
                                <button
                                    onClick={handleWhatsAppShare}
                                    className="ml-auto flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm text-white transition-colors hover:bg-green-600"
                                >
                                    <MessageCircle className="h-4 w-4" />{' '}
                                    Partager (WhatsApp)
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Tabs Navigation ── */}
                <div className="mx-auto max-w-4xl px-8 pt-4">
                    <div className="flex gap-6 border-b border-stone-200">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`relative pb-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-indigo-600' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            Vue d'ensemble
                            {activeTab === 'overview' && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-indigo-600" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('profitability')}
                            className={`relative pb-3 text-sm font-medium transition-colors ${activeTab === 'profitability' ? 'text-indigo-600' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            Analyse Financière
                            {activeTab === 'profitability' && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-indigo-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="mx-auto max-w-4xl space-y-6 px-8 py-8">
                    {activeTab === 'overview' && (
                        <>
                            {/* ── KPIs (Cockpit) ── */}
                            {flock.status === 'active' && (
                                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <StatCard
                                        label="Efficacité de Ponte"
                                        value={`${flock.stats.egg_efficiency}%`}
                                        textColor={
                                            flock.stats.egg_efficiency >= 85
                                                ? 'text-emerald-600'
                                                : flock.stats.egg_efficiency >=
                                                    70
                                                  ? 'text-amber-500'
                                                  : 'text-stone-900'
                                        }
                                    />
                                    <StatCard
                                        label="Taux de Mortalité"
                                        value={`${flock.stats.mortality_rate}%`}
                                        subtitle={
                                            flock.standard_mortality_rate
                                                ? `Std: ${flock.standard_mortality_rate}%`
                                                : undefined
                                        }
                                        textColor={
                                            mortalityIsHigh
                                                ? 'text-red-600'
                                                : 'text-emerald-600'
                                        }
                                    />
                                    <StatCard
                                        label="Effectif Actuel"
                                        value={flock.current_quantity.toLocaleString(
                                            'fr-FR',
                                        )}
                                        subtitle={`Initial: ${flock.initial_quantity.toLocaleString('fr-FR')}`}
                                    />
                                    <StatCard
                                        label="Moy. Œufs/Jour"
                                        value={recordsStats.avgEggs.toLocaleString(
                                            'fr-FR',
                                        )}
                                    />
                                </div>
                            )}

                            {/* ── Visualisation Graphique ── */}
                            {flock.status === 'active' &&
                                chartData.length > 0 && (
                                    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                                        <h2 className="mb-6 text-lg font-semibold text-stone-900">
                                            Tendance (Ponte et Pertes)
                                        </h2>
                                        <div className="h-72 w-full">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <ComposedChart
                                                    data={chartData}
                                                    margin={{
                                                        top: 5,
                                                        right: 20,
                                                        bottom: 5,
                                                        left: 0,
                                                    }}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={false}
                                                        stroke="#e5e7eb"
                                                    />
                                                    <XAxis
                                                        dataKey="date"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{
                                                            fontSize: 12,
                                                            fill: '#6b7280',
                                                        }}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        yAxisId="left"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{
                                                            fontSize: 12,
                                                            fill: '#6b7280',
                                                        }}
                                                    />
                                                    <YAxis
                                                        yAxisId="right"
                                                        orientation="right"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{
                                                            fontSize: 12,
                                                            fill: '#6b7280',
                                                        }}
                                                    />
                                                    <RechartsTooltip
                                                        contentStyle={{
                                                            borderRadius: '8px',
                                                            border: '1px solid #e5e7eb',
                                                            boxShadow:
                                                                '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                        }}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{
                                                            paddingTop: '20px',
                                                        }}
                                                    />
                                                    <Bar
                                                        yAxisId="right"
                                                        dataKey="Pertes"
                                                        fill="#ef4444"
                                                        radius={[4, 4, 0, 0]}
                                                        maxBarSize={40}
                                                    />
                                                    <Line
                                                        yAxisId="left"
                                                        type="monotone"
                                                        dataKey="Oeufs"
                                                        stroke="#6366f1"
                                                        strokeWidth={3}
                                                        dot={{
                                                            r: 4,
                                                            strokeWidth: 2,
                                                        }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* ── Info cards ── */}
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard
                                        label="Bâtiment"
                                        value={flock.building}
                                        icon={<MapPin className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Date d'arrivée"
                                        value={flock.arrival_date}
                                        icon={<Calendar className="h-4 w-4" />}
                                    />
                                    <InfoCard
                                        label="Standard Mortalité"
                                        value={
                                            flock.standard_mortality_rate
                                                ? `${flock.standard_mortality_rate}%`
                                                : '—'
                                        }
                                    />
                                    <InfoCard
                                        label="Total Pertes"
                                        value={recordsStats.totalLosses.toLocaleString(
                                            'fr-FR',
                                        )}
                                    />
                                </div>

                                {/* ── Details ── */}
                                <div className="rounded-xl border border-stone-200 bg-white p-6">
                                    <h2 className="mb-4 text-lg font-semibold text-stone-900">
                                        Informations
                                    </h2>
                                    <div className="space-y-3 text-sm">
                                        <InfoRow
                                            label="Créé par"
                                            value={flock.creator}
                                        />
                                        {flock.approver && (
                                            <>
                                                <InfoRow
                                                    label="Approuvé par"
                                                    value={flock.approver}
                                                />
                                                <InfoRow
                                                    label="Date d'approbation"
                                                    value={
                                                        flock.approved_at || '—'
                                                    }
                                                />
                                            </>
                                        )}
                                        {flock.notes && (
                                            <div className="mt-4 border-t border-stone-100 pt-4">
                                                <span className="font-medium text-stone-500">
                                                    Notes :
                                                </span>
                                                <p className="mt-1 whitespace-pre-wrap text-stone-900">
                                                    {flock.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Daily records table ── */}
                            {dailyRecords.data.length > 0 && (
                                <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                                    <div className="border-b border-stone-100 px-6 py-4">
                                        <h2 className="text-lg font-semibold text-stone-900">
                                            Suivi journalier
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-stone-100 bg-stone-50">
                                                    {[
                                                        'Date',
                                                        'Pertes',
                                                        'Œufs',
                                                        'Notes',
                                                        'Statut',
                                                        'Approuvé par',
                                                    ].map((h) => (
                                                        <th
                                                            key={h}
                                                            className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase"
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100">
                                                {dailyRecords.data.map(
                                                    (record) => {
                                                        const rsm =
                                                            RECORD_STATUS_META[
                                                                record.status
                                                            ];
                                                        return (
                                                            <tr
                                                                key={record.id}
                                                                className="hover:bg-stone-50"
                                                            >
                                                                <td className="px-6 py-4 text-stone-700">
                                                                    {new Date(
                                                                        record.date,
                                                                    ).toLocaleDateString(
                                                                        'fr-FR',
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-stone-700">
                                                                    {
                                                                        record.losses
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 text-stone-700">
                                                                    {record.eggs.toLocaleString(
                                                                        'fr-FR',
                                                                    )}
                                                                </td>
                                                                <td className="max-w-xs px-6 py-4 text-xs text-stone-500">
                                                                    {record.notes ||
                                                                        '—'}
                                                                    {record.rejection_reason && (
                                                                        <div className="mt-1 font-medium text-red-600">
                                                                            Motif
                                                                            :{' '}
                                                                            {
                                                                                record.rejection_reason
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span
                                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${rsm.classes}`}
                                                                    >
                                                                        {
                                                                            rsm.label
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-stone-600">
                                                                    {record.approved_by ||
                                                                        '—'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    },
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {dailyRecords.data.length === 0 &&
                                flock.status === 'active' && (
                                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-8 text-center">
                                        <p className="text-stone-500">
                                            Aucun enregistrement journalier pour
                                            ce lot.
                                        </p>
                                    </div>
                                )}
                        </>
                    )}

                    {activeTab === 'profitability' && financial_analysis && (
                        <FlockProfitability data={financial_analysis} />
                    )}
                </div>

                {/* ═══════════════════════════════════════════════
        MODALS
      ═══════════════════════════════════════════════ */}

                {/* ── Approve / Reject modal ── */}
                {showApproveModal && (
                    <Modal
                        title="Décision d'approbation"
                        onClose={() => setShowApproveModal(false)}
                    >
                        <div className="mb-6 space-y-4">
                            <InfoRow label="Lot" value={flock.name} />
                            <InfoRow label="Bâtiment" value={flock.building} />
                            <InfoRow
                                label="Effectif"
                                value={flock.initial_quantity.toLocaleString(
                                    'fr-FR',
                                )}
                            />
                        </div>

                        {flock.can_reject && (
                            <div className="mb-6">
                                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                                    Motif de rejet{' '}
                                    <span className="text-stone-400">
                                        (optionnel)
                                    </span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Expliquez la raison du rejet..."
                                    className="w-full resize-none rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                            >
                                Annuler
                            </button>
                            {flock.can_reject && (
                                <button
                                    onClick={handleReject}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
                                >
                                    <XCircle className="h-4 w-4" /> Rejeter
                                </button>
                            )}
                            {flock.can_approve && (
                                <button
                                    onClick={handleApprove}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-700"
                                >
                                    <CheckCircle className="h-4 w-4" />{' '}
                                    Approuver
                                </button>
                            )}
                        </div>
                    </Modal>
                )}

                {/* ── Delete modal ── */}
                {showDeleteModal && (
                    <Modal
                        title="Confirmer la suppression"
                        onClose={() => setShowDeleteModal(false)}
                    >
                        <p className="mb-6 text-sm text-stone-600">
                            Êtes-vous sûr de vouloir supprimer le lot "
                            <strong>{flock.name}</strong>" ? Cette action est
                            irréversible.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    </Modal>
                )}
            </div>
        </AppLayout>
    );
}

// ─────────────────────────────────────────────
// Utility components
// ─────────────────────────────────────────────

function InfoCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="mb-2 flex items-baseline gap-2">
                {icon && <span className="text-stone-400">{icon}</span>}
                <span className="text-xs font-medium text-stone-500">
                    {label}
                </span>
            </div>
            <div className="text-lg font-semibold text-stone-900">{value}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="min-w-[100px] text-xs font-medium text-stone-500">
                {label} :
            </span>
            <span className="font-medium text-stone-900">{value}</span>
        </div>
    );
}

function StatCard({
    label,
    value,
    subtitle,
    textColor = 'text-stone-900',
}: {
    label: string;
    value: string | number;
    subtitle?: string;
    textColor?: string;
}) {
    return (
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-1 text-xs font-medium text-stone-500">
                {label}
            </div>
            <div className={`text-3xl font-bold tracking-tight ${textColor}`}>
                {value}
            </div>
            {subtitle && (
                <div className="mt-2 text-xs text-stone-400">{subtitle}</div>
            )}
        </div>
    );
}

function Modal({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-stone-100 px-7 py-5">
                    <h2 className="text-base font-semibold text-stone-900">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 transition-colors hover:text-stone-600"
                    >
                        <XCircle className="h-5 w-5" />
                    </button>
                </div>
                <div className="px-7 py-6">{children}</div>
            </div>
        </div>
    );
}
