import { useToasts } from '@/components/ToastProvider';
import { suivieApprove, suivieReject, suivieStore } from '@/routes';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Plus,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

type RecordStatus = 'pending' | 'approved' | 'rejected';
interface DailyRecord {
    id: number;
    flock_id: number;
    date: string;
    losses: number;
    eggs: number;
    notes: string;
    status: RecordStatus;
    created_by: string;
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    can_approve?: boolean;
    can_reject?: boolean;
}
interface Flock {
    id: number;
    name: string;
}

interface DailyRecordProps {
    initialFlock?: Flock;
    onClose: () => void;
    onFlockUpdate: (data: { id: number; current_quantity: number }) => void;
}

interface PaginatedRecords {
    data: DailyRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
interface PageProps {
    dailyRecords?: PaginatedRecords;
    flash?: {
        newRecord?: DailyRecord;
        updatedRecord?: Partial<DailyRecord> & { id: number };
        success?: string;
        error?: string;
    };
}
const RECORD_STATUS_META: Record<
    RecordStatus,
    { label: string; classes: string }
> = {
    pending: { label: 'En attente', classes: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approuvé', classes: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Rejeté', classes: 'bg-red-100 text-red-600' },
};

export default function DailyRecords({
    initialFlock,
    onClose,
    onFlockUpdate,
}: {
    initialFlock?: Flock;
    onClose: () => void;
    onFlockUpdate: (data: { id: number; current_quantity: number }) => void;
}) {
    const { props } = usePage<PageProps>(); // on garde pour les autres usages si besoin, mais on n'y fait pas directement dans onSuccess
    const flock = initialFlock;
    const { addToast } = useToasts();

    // État local
    const [records, setRecords] = useState<DailyRecord[]>([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDailyForm, setShowDailyForm] = useState(false);
    const { data, setData, post } = useForm({
        flock_id: flock?.id ?? null,
        date: new Date().toISOString().split('T')[0],
        losses: '',
        eggs: '',
        notes: '',
    });
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Chargement initial
    const loadRecords = (page = 1) => {
        if (!flock) return;
        setLoading(true);
        setError(null);
        router.reload({
            only: ['dailyRecords'],
            data: { flock_id: flock.id, records_page: page },
            preserveState: true,
            preserveScroll: true,
            onSuccess: (pageObj) => {
                const data = (pageObj.props as PageProps).dailyRecords;
                if (data) {
                    setRecords(data.data);
                    setPagination({
                        current_page: data.current_page,
                        last_page: data.last_page,
                        total: data.total,
                    });
                }
                setLoading(false);
            },
            onError: (errors) => {
                console.error(errors);
                setError('Impossible de charger les données');
                setLoading(false);
            },
        });
    };

    useEffect(() => {
        if (flock) loadRecords();
    }, [flock]);

    // ── Actions avec récupération directe depuis la réponse ──

    const handleDailySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(suivieStore.url(), {
            preserveState: true,
            only: ['flash'], // On demande uniquement les nouvelles données flash
            onSuccess: (page) => {
                const newRecord = (page.props as PageProps).flash?.newRecord;
                if (newRecord) {
                    setRecords((prev) => [newRecord, ...prev]);
                    setPagination((prev) => ({
                        ...prev,
                        total: prev.total + 1,
                    }));
                }
                setShowDailyForm(false);
                setData({
                    flock_id: flock?.id ?? null,
                    date: new Date().toISOString().split('T')[0],
                    losses: '',
                    eggs: '',
                    notes: '',
                });
                addToast({
                    message: 'Suivi créé avec succès',
                    type: 'success',
                });
            },
            onError: (errors) => {
                console.log(errors);
                addToast({
                    message: 'Veuillez vérifier le formulaire',
                    type: 'error',
                });
            },
        });
    };

    const handleApprove = (recordId: number) => {
        router.post(
            suivieApprove.url(recordId),
            {},
            {
                preserveState: true,
                only: ['flash'],
                onSuccess: (page) => {
                    const updatedFlock = page.props.flash?.updatedFlock;
                    if (updatedFlock) {
                        onFlockUpdate(updatedFlock);
                    }
                    addToast({ message: 'Suivi approuvé', type: 'success' });
                    // Recharger la page courante des enregistrements
                    loadRecords(pagination.current_page);
                },
                onError: (errors) => {
                    console.log(errors);
                    addToast({
                        message: "Erreur lors de l'approbation",
                        type: 'error',
                    });
                },
            },
        );
    };

    const handleReject = (recordId: number) => {
        if (!rejectionReason.trim()) return;
        router.post(
            suivieReject.url(recordId),
            { reason: rejectionReason },
            {
                preserveState: true,
                only: ['flash'],
                onSuccess: (page) => {
                    const updated = (page.props as PageProps).flash
                        ?.updatedRecord;
                    if (updated) {
                        setRecords((prev) =>
                            prev.map((r) =>
                                r.id === updated.id ? { ...r, ...updated } : r,
                            ),
                        );
                    }
                    setRejectingId(null);
                    setRejectionReason('');
                    addToast({ message: 'Suivi rejeté', type: 'success' });
                },
                onError: (errors) => {
                    console.log(errors);
                    addToast({
                        message: 'Erreur lors du rejet',
                        type: 'error',
                    });
                },
            },
        );
    };

    const goToPage = (page: number) => loadRecords(page);

    // Stats (inchangé)
    const approvedRecords = records.filter((r) => r.status === 'approved');
    const stats = {
        totalLosses: approvedRecords.reduce((s, r) => s + r.losses, 0),
        avgEggs: approvedRecords.length
            ? Math.round(
                  approvedRecords.reduce((s, r) => s + r.eggs, 0) /
                      approvedRecords.length,
              )
            : 0,
        count: approvedRecords.length,
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div>
                <button
                    onClick={() => setShowDailyForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm text-white transition-colors hover:bg-amber-600"
                >
                    <Plus className="h-4 w-4" /> Nouveau suivi
                </button>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto rounded-lg border border-stone-200">
                <table className="w-full text-sm">
                    <thead className="border-b border-stone-200 bg-stone-50">
                        <tr>
                            {[
                                'Date',
                                'Pertes',
                                'Œufs',
                                'Notes',
                                'Statut',
                                'Actions',
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {records.length === 0 && !loading && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-8 text-center text-sm text-stone-400"
                                >
                                    Aucun enregistrement.
                                </td>
                            </tr>
                        )}
                        {records.map((record) => {
                            const rsm = RECORD_STATUS_META[record.status];
                            return (
                                <tr
                                    key={record.id}
                                    className="hover:bg-stone-50"
                                >
                                    <td className="px-4 py-3 text-stone-700">
                                        {new Date(
                                            record.date,
                                        ).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3 text-stone-700">
                                        {record.losses}
                                    </td>
                                    <td className="px-4 py-3 text-stone-700">
                                        {record.eggs.toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-stone-500">
                                        {record.notes || '—'}
                                        {record.rejection_reason && (
                                            <div className="mt-1 font-medium text-red-600">
                                                Motif :{' '}
                                                {record.rejection_reason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${rsm.classes}`}
                                        >
                                            {rsm.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {record.status === 'pending' && (
                                            <RecordApprovalButtons
                                                record={record}
                                                rejectingId={rejectingId}
                                                rejectionReason={
                                                    rejectionReason
                                                }
                                                onApprove={() =>
                                                    handleApprove(record.id)
                                                }
                                                onRejectStart={() =>
                                                    setRejectingId(record.id)
                                                }
                                                onRejectCancel={() => {
                                                    setRejectingId(null);
                                                    setRejectionReason('');
                                                }}
                                                onRejectSubmit={() =>
                                                    handleReject(record.id)
                                                }
                                                onReasonChange={
                                                    setRejectionReason
                                                }
                                            />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-between rounded-b-lg border-t border-stone-100 bg-white px-5 py-4 text-sm text-stone-500">
                    <span>
                        Page {pagination.current_page} sur{' '}
                        {pagination.last_page} — {pagination.total} résultats
                    </span>
                    <div className="flex gap-1">
                        <button
                            disabled={pagination.current_page === 1}
                            onClick={() =>
                                goToPage(pagination.current_page - 1)
                            }
                            className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            onClick={() =>
                                goToPage(pagination.current_page + 1)
                            }
                            className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total pertes" value={stats.totalLosses} />
                <StatCard
                    label="Moy. œufs/jour"
                    value={stats.avgEggs.toLocaleString('fr-FR')}
                />
                <StatCard label="Saisies approuvées" value={stats.count} />
            </div>

            {/* Modal de création */}
            {showDailyForm && flock && (
                <Modal
                    title={`Nouveau suivi — ${flock.name}`}
                    onClose={() => setShowDailyForm(false)}
                >
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Les données seront appliquées uniquement après
                        validation du responsable.
                    </div>
                    <form onSubmit={handleDailySubmit} className="space-y-4">
                        <Field label="Date">
                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) =>
                                    setData({ ...data, date: e.target.value })
                                }
                                required
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Pertes">
                            <input
                                type="number"
                                value={data.losses}
                                min="0"
                                onChange={(e) =>
                                    setData({ ...data, losses: e.target.value })
                                }
                                placeholder="0"
                                required
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Œufs collectés">
                            <input
                                type="number"
                                value={data.eggs}
                                min="0"
                                onChange={(e) =>
                                    setData({ ...data, eggs: e.target.value })
                                }
                                placeholder="0"
                                required
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Notes (optionnel)">
                            <textarea
                                value={data.notes}
                                rows={2}
                                onChange={(e) =>
                                    setData({ ...data, notes: e.target.value })
                                }
                                placeholder="Observations..."
                                className={`${inputClass} resize-none`}
                            />
                        </Field>
                        <ModalFooter
                            onCancel={() => setShowDailyForm(false)}
                            submitLabel="Soumettre"
                            submitClass="bg-amber-500 hover:bg-amber-600 text-white"
                        />
                    </form>
                </Modal>
            )}
        </div>
    );
}
// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const inputClass =
    'w-full px-3.5 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white';

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

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">
                {label}
            </label>
            {children}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="mb-1 text-xs text-stone-500">{label}</div>
            <div className="text-xl font-semibold text-stone-900">{value}</div>
        </div>
    );
}

function ModalFooter({
    onCancel,
    submitLabel,
    submitClass,
}: {
    onCancel: () => void;
    submitLabel: string;
    submitClass: string;
}) {
    return (
        <div className="flex gap-3 pt-2">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
            >
                Annuler
            </button>
            <button
                type="submit"
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${submitClass}`}
            >
                {submitLabel}
            </button>
        </div>
    );
}

interface RecordApprovalButtonsProps {
    record: DailyRecord;
    rejectingId: number | null;
    rejectionReason: string;
    approvingIdLoading?: number | null;
    rejectingIdLoading?: number | null;
    onApprove: () => void;
    onRejectStart: () => void;
    onRejectCancel: () => void;
    onRejectSubmit: () => void;
    onReasonChange: (reason: string) => void;
}

function RecordApprovalButtons({
    record,
    rejectingId,
    rejectionReason,
    approvingIdLoading,
    rejectingIdLoading,
    onApprove,
    onRejectStart,
    onRejectCancel,
    onRejectSubmit,
    onReasonChange,
}: RecordApprovalButtonsProps) {
    const isRejecting = rejectingId === record.id;
    const isApprovingLoading = approvingIdLoading === record.id;
    const isRejectingLoading = rejectingIdLoading === record.id;

    if (isRejecting) {
        return (
            <div className="flex items-center gap-1">
                <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="Motif..."
                    className="w-28 rounded border border-stone-200 px-2 py-1 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                />
                <button
                    onClick={onRejectSubmit}
                    disabled={!rejectionReason.trim() || isRejectingLoading}
                    className="flex items-center gap-2 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isRejectingLoading ? (
                        <svg
                            className="h-3 w-3 animate-spin text-white"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                        </svg>
                    ) : (
                        'OK'
                    )}
                </button>
                <button
                    onClick={onRejectCancel}
                    className="text-stone-400 hover:text-stone-600"
                >
                    <XCircle className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {record.can_approve && (
                <button
                    onClick={onApprove}
                    title="Approuver"
                    disabled={isApprovingLoading}
                    className={`rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-50 ${isApprovingLoading ? 'cursor-wait opacity-60' : ''}`}
                >
                    {isApprovingLoading ? (
                        <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                        </svg>
                    ) : (
                        <CheckCircle className="h-4 w-4" />
                    )}
                </button>
            )}
            {record.can_reject && (
                <button
                    onClick={onRejectStart}
                    title="Rejeter"
                    className="rounded p-1 text-red-500 transition-colors hover:bg-red-50"
                >
                    <XCircle className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
