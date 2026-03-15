import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import {
    feedProductionsApprove,
    feedProductionsCreate,
    feedProductionsDestroy,
    feedProductionsEdit,
    feedProductionsIndex,
    feedProductionsReject,
    feedProductionsShow,
    feedProductionsSubmit,
} from '@/routes';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Eye,
    Plus,
    Send,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Types pour les productions d'aliments
type ProductionStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface FeedProduction {
    id: number;
    date: string; // Y-m-d
    recipe_name: string;
    recipe_id: number;
    quantity: number;
    unit: string; // unité de la recette (ex: kg)
    notes: string | null;
    status: ProductionStatus;
    created_by: string;
    created_at: string; // d/m/Y H:i
    approved_by: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    // Permissions
    can_edit: boolean;
    can_delete: boolean;
    can_submit: boolean; // pour soumettre à approbation (si draft)
    can_approve: boolean;
    can_reject: boolean;
}

interface PaginatedProductions {
    data: FeedProduction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

interface RecipeOption {
    id: number;
    name: string;
    yield_unit: string;
}

interface Filters {
    recipe_id?: string;
    status?: string;
}

interface PageProps {
    productions: PaginatedProductions;
    recipes: RecipeOption[];
    filters: Filters;
    flash?: { success?: string; error?: string };
}

const STATUS_META: Record<
    ProductionStatus,
    { label: string; classes: string }
> = {
    draft: {
        label: 'Brouillon',
        classes: 'bg-slate-100 text-slate-600 border border-slate-200',
    },
    pending: {
        label: 'En attente',
        classes: 'bg-amber-100 text-amber-700 border border-amber-200',
    },
    approved: {
        label: 'Approuvé',
        classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    },
    rejected: {
        label: 'Rejeté',
        classes: 'bg-red-100 text-red-600 border border-red-200',
    },
};

// Types et constantes

export default function FeedProductionsIndex({
    productions,
    recipes,
    filters,
    flash,
}: PageProps) {
    const { addToast } = useToasts();

    // États pour les filtres
    const [recipeFilter, setRecipeFilter] = useState(filters.recipe_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // États pour la modale d'approbation/rejet
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedProduction, setSelectedProduction] =
        useState<FeedProduction | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Notifications flash
    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const applyFilters = () => {
        router.get(
            feedProductionsIndex.url(),
            {
                recipe_id: recipeFilter || undefined,
                status: statusFilter || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setRecipeFilter('');
        setStatusFilter('');
        router.get(feedProductionsIndex.url(), {}, { replace: true });
    };

    const handleDelete = (prod: FeedProduction) => {
        if (!confirm(`Supprimer cette production ?`)) return;
        router.delete(feedProductionsDestroy.url(prod.id));
    };

    const handleSubmit = (prod: FeedProduction) => {
        router.post(
            feedProductionsSubmit.url(prod.id),
            {},
            {
                onError: (err: any) =>
                    addToast({
                        message: err.message || 'Erreur lors de la soumission',
                        type: 'error',
                    }),
            },
        );
    };

    const openApproveModal = (prod: FeedProduction) => {
        setSelectedProduction(prod);
        setRejectionReason('');
        setShowApproveModal(true);
    };

    const handleApprove = () => {
        if (!selectedProduction) return;
        router.post(
            feedProductionsApprove.url(selectedProduction.id),
            {},
            {
                onSuccess: () => {
                    setShowApproveModal(false);
                    setSelectedProduction(null);
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
        if (!selectedProduction || !rejectionReason.trim()) return;
        router.post(
            feedProductionsReject.url(selectedProduction.id),
            {
                reason: rejectionReason,
            },
            {
                onSuccess: () => {
                    setShowApproveModal(false);
                    setSelectedProduction(null);
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

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: "Productions d'aliments",
                    href: feedProductionsIndex.url(),
                },
            ]}
        >
            <Head title="Productions d'aliments" />
            <div className="min-h-screen bg-stone-50 font-sans">
                {/* En-tête */}
                <div className="border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                                Productions d'aliments
                            </h1>
                            <p className="mt-0.5 text-sm text-stone-500">
                                {productions.total} production
                                {productions.total !== 1 ? 's' : ''} au total
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                router.get(feedProductionsCreate.url())
                            }
                            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvelle production
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
                    {/* Filtres */}
                    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
                        <div className="min-w-[200px]">
                            <label className="mb-1.5 block text-xs font-medium text-stone-500">
                                Recette
                            </label>
                            <select
                                value={recipeFilter}
                                onChange={(e) =>
                                    setRecipeFilter(e.target.value)
                                }
                                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            >
                                <option value="">Toutes les recettes</option>
                                {recipes.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
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
                                <option value="draft">Brouillon</option>
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
                                            Recette
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Quantité
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Créé par
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
                                    {productions.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-5 py-12 text-center text-sm text-stone-400"
                                            >
                                                Aucune production trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        productions.data.map((p) => {
                                            const sm = STATUS_META[p.status];
                                            return (
                                                <tr
                                                    key={p.id}
                                                    className="transition-colors hover:bg-stone-50"
                                                >
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="flex items-center gap-1.5 text-stone-600">
                                                            <Calendar className="h-3.5 w-3.5 text-stone-400" />
                                                            {new Date(
                                                                p.date,
                                                            ).toLocaleDateString(
                                                                'fr-FR',
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 font-medium text-stone-900">
                                                        {p.recipe_name}
                                                    </td>
                                                    <td className="px-5 py-4 text-stone-600">
                                                        {p.quantity} {p.unit}
                                                    </td>
                                                    <td className="px-5 py-4 text-stone-600">
                                                        {p.created_by}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${sm.classes}`}
                                                        >
                                                            {sm.label}
                                                        </span>
                                                        {p.rejection_reason && (
                                                            <div
                                                                className="mt-1 text-xs text-red-600"
                                                                title={
                                                                    p.rejection_reason
                                                                }
                                                            >
                                                                {p.rejection_reason.substring(
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
                                                                        feedProductionsShow.url(
                                                                            p.id,
                                                                        ),
                                                                    )
                                                                }
                                                            />

                                                            {/* Modifier (can_edit) */}
                                                            {p.can_edit && (
                                                                <ActionButton
                                                                    icon={
                                                                        <Edit2 className="h-4 w-4" />
                                                                    }
                                                                    title="Modifier"
                                                                    colorClass="hover:text-amber-600 hover:bg-amber-50"
                                                                    onClick={() =>
                                                                        router.get(
                                                                            feedProductionsEdit.url(
                                                                                p.id,
                                                                            ),
                                                                        )
                                                                    }
                                                                />
                                                            )}

                                                            {/* Soumettre (can_submit) */}
                                                            {p.can_submit && (
                                                                <ActionButton
                                                                    icon={
                                                                        <Send className="h-4 w-4" />
                                                                    }
                                                                    title="Soumettre pour approbation"
                                                                    colorClass="hover:text-indigo-600 hover:bg-indigo-50"
                                                                    onClick={() =>
                                                                        handleSubmit(
                                                                            p,
                                                                        )
                                                                    }
                                                                />
                                                            )}

                                                            {/* Approuver / Rejeter (can_approve ou can_reject) */}
                                                            {(p.can_approve ||
                                                                p.can_reject) && (
                                                                <ActionButton
                                                                    icon={
                                                                        <AlertCircle className="h-4 w-4" />
                                                                    }
                                                                    title="Approuver / Rejeter"
                                                                    colorClass="hover:text-emerald-600 hover:bg-emerald-50"
                                                                    onClick={() =>
                                                                        openApproveModal(
                                                                            p,
                                                                        )
                                                                    }
                                                                />
                                                            )}

                                                            {/* Supprimer (can_delete) */}
                                                            {p.can_delete && (
                                                                <ActionButton
                                                                    icon={
                                                                        <Trash2 className="h-4 w-4" />
                                                                    }
                                                                    title="Supprimer"
                                                                    colorClass="hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            p,
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
                        {productions.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
                                <span>
                                    Page {productions.current_page} sur{' '}
                                    {productions.last_page} —{' '}
                                    {productions.total} résultats
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={
                                            productions.current_page === 1
                                        }
                                        onClick={() =>
                                            router.get(
                                                feedProductionsIndex.url(),
                                                {
                                                    ...filters,
                                                    page:
                                                        productions.current_page -
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
                                            productions.current_page ===
                                            productions.last_page
                                        }
                                        onClick={() =>
                                            router.get(
                                                feedProductionsIndex.url(),
                                                {
                                                    ...filters,
                                                    page:
                                                        productions.current_page +
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
                {showApproveModal && selectedProduction && (
                    <Modal
                        title="Décision sur la production"
                        onClose={() => setShowApproveModal(false)}
                    >
                        <div className="mb-6 space-y-3 text-sm">
                            <InfoRow
                                label="Date"
                                value={new Date(
                                    selectedProduction.date,
                                ).toLocaleDateString('fr-FR')}
                            />
                            <InfoRow
                                label="Recette"
                                value={selectedProduction.recipe_name}
                            />
                            <InfoRow
                                label="Quantité"
                                value={`${selectedProduction.quantity} ${selectedProduction.unit}`}
                            />
                            <InfoRow
                                label="Créé par"
                                value={selectedProduction.created_by}
                            />
                            {selectedProduction.notes && (
                                <div className="mt-1 text-xs text-stone-600 italic">
                                    "{selectedProduction.notes}"
                                </div>
                            )}
                        </div>

                        {selectedProduction.can_reject && (
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
                            {selectedProduction.can_reject && (
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim()}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <XCircle className="h-4 w-4" /> Rejeter
                                </button>
                            )}
                            {selectedProduction.can_approve && (
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
            <span className="min-w-[80px] text-xs text-stone-500">
                {label} :
            </span>
            <span className="text-sm font-medium text-stone-900">{value}</span>
        </div>
    );
}
