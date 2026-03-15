import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import {
    stockMovementsApprove,
    stockMovementsCreate,
    stockMovementsDestroy,
    stockMovementsEdit,
    stockMovementsIndex,
    stockMovementsReject,
    stockMovementsShow,
} from '@/routes';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownCircle,
    ArrowUpCircle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Eye,
    Plus,
    Scale,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Types pour les mouvements de stock
type MovementType = 'in' | 'out' | 'adjust';
type MovementStatus = 'pending' | 'approved' | 'rejected';

interface StockMovement {
    id: number;
    ingredient: string; // nom de l'ingrédient
    type: MovementType;
    quantity: number;
    unit: string; // symbole de l'unité
    unit_price: number | null;
    reason: string | null;
    status: MovementStatus;
    created_by: string;
    created_at: string; // format d/m/Y H:i
    approved_by: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    // Permissions
    can_edit: boolean;
    can_delete: boolean;
    can_approve: boolean;
    can_reject: boolean;
}

interface PaginatedMovements {
    data: StockMovement[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

interface IngredientOption {
    id: number;
    name: string;
}

interface Filters {
    ingredient_id?: string;
    status?: string;
}

interface PageProps {
    movements: PaginatedMovements;
    ingredients: IngredientOption[];
    filters: Filters;
    flash?: { success?: string; error?: string };
}

const STATUS_META: Record<MovementStatus, { label: string; classes: string }> =
    {
        pending: {
            label: 'En attente',
            classes: 'bg-amber-100 text-amber-700 border border-amber-200',
        },
        approved: {
            label: 'Approuvé',
            classes:
                'bg-emerald-100 text-emerald-700 border border-emerald-200',
        },
        rejected: {
            label: 'Rejeté',
            classes: 'bg-red-100 text-red-600 border border-red-200',
        },
    };

const TYPE_META: Record<
    MovementType,
    { label: string; icon: any; color: string }
> = {
    in: { label: 'Entrée', icon: 'ArrowDownCircle', color: 'text-green-600' },
    out: { label: 'Sortie', icon: 'ArrowUpCircle', color: 'text-red-600' },
    adjust: { label: 'Ajustement', icon: 'Scale', color: 'text-blue-600' },
};

// Types et constantes (définis ci-dessus)

export default function StockMovementsIndex({
    movements,
    ingredients,
    filters,
    flash,
}: PageProps) {
    const { addToast } = useToasts();

    // États pour les filtres
    const [ingredientFilter, setIngredientFilter] = useState(
        filters.ingredient_id || '',
    );
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // États pour la modale d'approbation
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedMovement, setSelectedMovement] =
        useState<StockMovement | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Notifications flash
    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const applyFilters = () => {
        router.get(
            stockMovementsIndex.url(),
            {
                ingredient_id: ingredientFilter || undefined,
                status: statusFilter || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setIngredientFilter('');
        setStatusFilter('');
        router.get(stockMovementsIndex.url(), {}, { replace: true });
    };

    const handleDelete = (movement: StockMovement) => {
        if (!confirm(`Supprimer ce mouvement ?`)) return;
        router.delete(stockMovementsDestroy.url(movement.id));
    };

    const openApproveModal = (movement: StockMovement) => {
        setSelectedMovement(movement);
        setRejectionReason('');
        setShowApproveModal(true);
    };

    const handleApprove = () => {
        if (!selectedMovement) return;
        router.post(
            stockMovementsApprove.url(selectedMovement.id),
            {},
            {
                onSuccess: () => {
                    setShowApproveModal(false);
                    setSelectedMovement(null);
                },
                onError: (err: any) => {
                    addToast({
                        message: err.message || "Erreur lors de l'approbation",
                        type: 'error',
                    });
                },
            },
        );
    };

    const handleReject = () => {
        if (!selectedMovement || !rejectionReason.trim()) return;
        router.post(
            stockMovementsReject.url(selectedMovement.id),
            {
                reason: rejectionReason,
            },
            {
                onSuccess: () => {
                    setShowApproveModal(false);
                    setSelectedMovement(null);
                    setRejectionReason('');
                },
                onError: (err: any) => {
                    addToast({
                        message: err.message || 'Erreur lors du rejet',
                        type: 'error',
                    });
                },
            },
        );
    };

    // Helper pour l'icône de type
    const TypeIcon = ({ type }: { type: MovementType }) => {
        switch (type) {
            case 'in':
                return <ArrowDownCircle className="h-4 w-4 text-green-600" />;
            case 'out':
                return <ArrowUpCircle className="h-4 w-4 text-red-600" />;
            case 'adjust':
                return <Scale className="h-4 w-4 text-blue-600" />;
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Mouvements de stock',
                    href: stockMovementsIndex.url(),
                },
            ]}
        >
            <Head title="Mouvements de stock" />
            <div className="min-h-screen bg-stone-50 font-sans">
                {/* En-tête */}
                <div className="border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                                Mouvements de stock
                            </h1>
                            <p className="mt-0.5 text-sm text-stone-500">
                                {movements.total} mouvement
                                {movements.total !== 1 ? 's' : ''} au total
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                router.get(stockMovementsCreate.url())
                            }
                            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
                        >
                            <Plus className="h-4 w-4" />
                            Nouveau mouvement
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
                    {/* Filtres */}
                    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
                        <div className="min-w-[200px]">
                            <label className="mb-1.5 block text-xs font-medium text-stone-500">
                                Ingrédient
                            </label>
                            <select
                                value={ingredientFilter}
                                onChange={(e) =>
                                    setIngredientFilter(e.target.value)
                                }
                                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            >
                                <option value="">Tous les ingrédients</option>
                                {ingredients.map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-[160px]">
                            <label className="mb-1.5 block text-xs font-medium text-stone-500">
                                Statut
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="pending">En attente</option>
                                <option value="approved">Approuvé</option>
                                <option value="rejected">Rejeté</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={applyFilters}
                                className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white transition-colors hover:bg-stone-800"
                            >
                                Filtrer
                            </button>
                            <button
                                onClick={resetFilters}
                                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* Tableau */}
                    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Date
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Ingrédient
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Type
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Quantité
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Prix unit.
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Motif
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Statut
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {movements.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-5 py-12 text-center text-sm text-stone-400"
                                            >
                                                Aucun mouvement trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        movements.data.map((m) => {
                                            const sm = STATUS_META[m.status];
                                            return (
                                                <tr
                                                    key={m.id}
                                                    className="transition-colors hover:bg-stone-50"
                                                >
                                                    <td className="px-5 py-4 whitespace-nowrap text-stone-600">
                                                        {m.created_at}
                                                    </td>
                                                    <td className="px-5 py-4 font-medium text-stone-900">
                                                        {m.ingredient}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <TypeIcon
                                                                type={m.type}
                                                            />
                                                            <span>
                                                                {
                                                                    TYPE_META[
                                                                        m.type
                                                                    ].label
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-stone-600">
                                                        {m.quantity} {m.unit}
                                                    </td>
                                                    <td className="px-5 py-4 text-stone-600">
                                                        {m.unit_price
                                                            ? formatCurrency(
                                                                  m.unit_price,
                                                              )
                                                            : '-'}
                                                    </td>
                                                    <td className="max-w-[200px] truncate px-5 py-4 text-stone-600">
                                                        {m.reason || '-'}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${sm.classes}`}
                                                        >
                                                            {sm.label}
                                                        </span>
                                                        {m.rejection_reason && (
                                                            <div
                                                                className="mt-1 text-xs text-red-600"
                                                                title={
                                                                    m.rejection_reason
                                                                }
                                                            >
                                                                {m.rejection_reason.substring(
                                                                    0,
                                                                    20,
                                                                )}
                                                                ...
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1">
                                                            {/* Voir détail */}
                                                            <ActionButton
                                                                icon={
                                                                    <Eye className="h-4 w-4" />
                                                                }
                                                                title="Voir le détail"
                                                                colorClass="hover:text-blue-600 hover:bg-blue-50"
                                                                onClick={() =>
                                                                    router.get(
                                                                        stockMovementsShow.url(
                                                                            m.id,
                                                                        ),
                                                                    )
                                                                }
                                                            />

                                                            {/* Modifier (can_edit) */}
                                                            {m.can_edit && (
                                                                <ActionButton
                                                                    icon={
                                                                        <Edit2 className="h-4 w-4" />
                                                                    }
                                                                    title="Modifier"
                                                                    colorClass="hover:text-amber-600 hover:bg-amber-50"
                                                                    onClick={() =>
                                                                        router.get(
                                                                            stockMovementsEdit.url(
                                                                                m.id,
                                                                            ),
                                                                        )
                                                                    }
                                                                />
                                                            )}

                                                            {/* Approuver / Rejeter (can_approve ou can_reject) */}
                                                            {(m.can_approve ||
                                                                m.can_reject) && (
                                                                <ActionButton
                                                                    icon={
                                                                        <AlertCircle className="h-4 w-4" />
                                                                    }
                                                                    title="Approuver / Rejeter"
                                                                    colorClass="hover:text-emerald-600 hover:bg-emerald-50"
                                                                    onClick={() =>
                                                                        openApproveModal(
                                                                            m,
                                                                        )
                                                                    }
                                                                />
                                                            )}

                                                            {/* Supprimer (can_delete) */}
                                                            {m.can_delete && (
                                                                <ActionButton
                                                                    icon={
                                                                        <Trash2 className="h-4 w-4" />
                                                                    }
                                                                    title="Supprimer"
                                                                    colorClass="hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            m,
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {movements.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
                                <span>
                                    Page {movements.current_page} sur{' '}
                                    {movements.last_page} — {movements.total}{' '}
                                    résultats
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={movements.current_page === 1}
                                        onClick={() =>
                                            router.get(
                                                stockMovementsIndex.url(),
                                                {
                                                    ...filters,
                                                    page:
                                                        movements.current_page -
                                                        1,
                                                },
                                            )
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        disabled={
                                            movements.current_page ===
                                            movements.last_page
                                        }
                                        onClick={() =>
                                            router.get(
                                                stockMovementsIndex.url(),
                                                {
                                                    ...filters,
                                                    page:
                                                        movements.current_page +
                                                        1,
                                                },
                                            )
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modale d'approbation/rejet */}
                {showApproveModal && selectedMovement && (
                    <Modal
                        title="Décision sur le mouvement"
                        onClose={() => setShowApproveModal(false)}
                    >
                        <div className="mb-6 space-y-3 text-sm">
                            <InfoRow
                                label="Ingrédient"
                                value={selectedMovement.ingredient}
                            />
                            <InfoRow
                                label="Type"
                                value={TYPE_META[selectedMovement.type].label}
                            />
                            <InfoRow
                                label="Quantité"
                                value={`${selectedMovement.quantity} ${selectedMovement.unit}`}
                            />
                            <InfoRow
                                label="Prix unitaire"
                                value={
                                    selectedMovement.unit_price
                                        ? formatCurrency(
                                              selectedMovement.unit_price,
                                          )
                                        : '-'
                                }
                            />
                            <InfoRow
                                label="Motif"
                                value={selectedMovement.reason || '-'}
                            />
                        </div>

                        {selectedMovement.can_reject && (
                            <div className="mb-6">
                                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                                    Motif de rejet{' '}
                                    <span className="text-stone-400">
                                        (obligatoire)
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
                            {selectedMovement.can_reject && (
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim()}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <XCircle className="h-4 w-4" /> Rejeter
                                </button>
                            )}
                            {selectedMovement.can_approve && (
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
            </div>
        </AppLayout>
    );
}

// Sous-composants réutilisables (copiés des pages précédentes)
function ActionButton({ icon, title, colorClass, onClick }: any) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`rounded-lg p-1.5 text-stone-400 transition-colors ${colorClass}`}
        >
            {icon}
        </button>
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

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="min-w-[100px] text-xs text-stone-500">
                {label} :
            </span>
            <span className="text-sm font-medium text-stone-900">{value}</span>
        </div>
    );
}
