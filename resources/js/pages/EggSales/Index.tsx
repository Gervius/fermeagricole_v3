// resources/js/Pages/EggSales/Index.tsx
import React, { useState, useEffect } from 'react';
import { router, Head, usePage } from '@inertiajs/react';
import {
    Plus, Edit2, Trash2, Calendar, Eye, CheckCircle, XCircle, AlertCircle,
    ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useToasts } from '@/components/ToastProvider';
import { Modal } from '@/components/modal-ferme';
import {InfoRow} from '@/components/info-row';
import { ActionButton } from '@/components/action-button-made';
import { eggSalesIndex, eggSalesCreate, eggSalesEdit, eggSalesDestroy, eggSalesApprove, eggSalesCancel, eggSalesShow } from '@/routes';

// Types et helpers (définis ci-dessus)
// Types alignés sur le contrôleur Laravel
type EggSaleStatus = 'draft' | 'approved' | 'cancelled';

interface EggSale {
    id: number;
    sale_date: string;          // format Y-m-d
    flock_name: string;
    customer_name: string | null;
    quantity: number;
    unit_price: number;
    total: number;
    total_with_tax: number;
    status: EggSaleStatus;
    created_by: string;
    created_at: string;          // format d/m/Y H:i
    approved_by: string | null;
    approved_at: string | null;
    cancellation_reason: string | null;
    // Permissions
    can_edit: boolean;
    can_delete: boolean;
    can_approve: boolean;
    can_cancel: boolean;
}

interface PaginatedEggSales {
    data: EggSale[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

interface FlockOption {
    id: number;
    name: string;
}

interface Filters {
    flock_id?: string;
    status?: string;
}

interface PageProps {
    sales: PaginatedEggSales;
    flocks: FlockOption[];
    filters: Filters;
    flash?: { success?: string; error?: string };
}

const STATUS_META: Record<EggSaleStatus, { label: string; classes: string }> = {
    draft:     { label: 'Brouillon',  classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
    approved:  { label: 'Approuvé',   classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    cancelled: { label: 'Annulé',     classes: 'bg-red-100 text-red-600 border border-red-200' },
};



export default function EggSalesIndex({ sales, flocks, filters, flash }: PageProps) {
    const { addToast } = useToasts();

    // États pour les filtres
    const [searchFlock, setSearchFlock] = useState(filters.flock_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // États pour les modales
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState<EggSale | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    // Notifications flash
    useEffect(() => {
        if (flash?.success) addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const applyFilters = () => {
        router.get(eggSalesIndex.url(), {
            flock_id: searchFlock || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearchFlock('');
        setStatusFilter('');
        router.get(eggSalesIndex.url(), {}, { replace: true });
    };

    const handleDelete = (sale: EggSale) => {
        if (!confirm(`Supprimer la vente du ${new Date(sale.sale_date).toLocaleDateString('fr-FR')} ?`)) return;
        router.delete(eggSalesDestroy.url(sale.id));
    };

    const openApproveModal = (sale: EggSale) => {
        setSelectedSale(sale);
        setCancelReason('');
        setShowApproveModal(true);
    };

    const handleApprove = () => {
        if (!selectedSale) return;
        router.post(eggSalesApprove.url(selectedSale.id), {}, {
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedSale(null);
            },
            onError: (err: any) => {
                addToast({ message: err.message || "Erreur lors de l'approbation", type: 'error' });
            },
        });
    };

    const handleCancel = () => {
        if (!selectedSale || !cancelReason.trim()) return;
        router.post(eggSalesCancel.url(selectedSale.id), {
            reason: cancelReason,
        }, {
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedSale(null);
                setCancelReason('');
            },
            onError: (err: any) => {
                addToast({ message: err.message || "Erreur lors de l'annulation", type: 'error' });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Ventes d\'œufs', href: eggSalesIndex.url() }]}>
            <Head title="Ventes d'œufs" />
            <div className="min-h-screen bg-stone-50 font-sans">

                {/* Header */}
                <div className="bg-white border-b border-stone-200 px-8 py-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
                                Ventes d'œufs
                            </h1>
                            <p className="text-stone-500 text-sm mt-0.5">
                                {sales.total} vente{sales.total !== 1 ? 's' : ''} au total
                            </p>
                        </div>
                        <button
                            onClick={() => router.get(eggSalesCreate.url())}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nouvelle vente
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">

                    {/* Filtres */}
                    <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                        <div className="min-w-[200px]">
                            <label className="block text-xs text-stone-500 mb-1.5 font-medium">Lot</label>
                            <select
                                value={searchFlock}
                                onChange={e => setSearchFlock(e.target.value)}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                            >
                                <option value="">Tous les lots</option>
                                {flocks?.map (f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-[160px]">
                            <label className="block text-xs text-stone-500 mb-1.5 font-medium">Statut</label>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="draft">Brouillon</option>
                                <option value="approved">Approuvé</option>
                                <option value="cancelled">Annulé</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors"
                            >
                                Filtrer
                            </button>
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition-colors"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* Tableau */}
                    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Date</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Lot</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Client</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Qté</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Prix unit.</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Total TTC</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Statut</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {sales.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-5 py-12 text-center text-stone-400 text-sm">
                                                Aucune vente trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        sales.data.map(sale => {
                                            const sm = STATUS_META[sale.status];
                                            return (
                                                <tr key={sale.id} className="hover:bg-stone-50 transition-colors">
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="flex items-center gap-1.5 text-stone-600">
                                                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                                            {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 font-medium text-stone-900">{sale.flock_name}</td>
                                                    <td className="px-5 py-4 text-stone-600">{sale.customer_name || '-'}</td>
                                                    <td className="px-5 py-4 text-stone-600 text-right">{sale.quantity.toLocaleString('fr-FR')}</td>
                                                    <td className="px-5 py-4 text-stone-600 text-right">{sale.unit_price.toLocaleString('fr-FR')} €</td>
                                                    <td className="px-5 py-4 text-stone-600 text-right font-medium">{sale.total_with_tax.toLocaleString('fr-FR')} €</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sm.classes}`}>
                                                            {sm.label}
                                                        </span>
                                                        {sale.cancellation_reason && (
                                                            <div className="text-xs text-red-600 mt-1 max-w-[200px]" title={sale.cancellation_reason}>
                                                                {sale.cancellation_reason.substring(0, 30)}...
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1">
                                                            {/* Voir détail */}
                                                            <ActionButton
                                                                icon={<Eye className="w-4 h-4" />}
                                                                title="Voir le détail"
                                                                colorClass="hover:text-blue-600 hover:bg-blue-50"
                                                                onClick={() => router.get(eggSalesShow.url(sale.id))}
                                                            />

                                                            {/* Modifier (can_edit) */}
                                                            {sale.can_edit && (
                                                                <ActionButton
                                                                    icon={<Edit2 className="w-4 h-4" />}
                                                                    title="Modifier"
                                                                    colorClass="hover:text-amber-600 hover:bg-amber-50"
                                                                    onClick={() => router.get(eggSalesEdit.url(sale.id))}
                                                                />
                                                            )}

                                                            {/* Approuver (can_approve) */}
                                                            {sale.can_approve && (
                                                                <ActionButton
                                                                    icon={<CheckCircle className="w-4 h-4" />}
                                                                    title="Approuver"
                                                                    colorClass="hover:text-emerald-600 hover:bg-emerald-50"
                                                                    onClick={() => openApproveModal(sale)}
                                                                />
                                                            )}

                                                            {/* Annuler (can_cancel) */}
                                                            {sale.can_cancel && (
                                                                <ActionButton
                                                                    icon={<XCircle className="w-4 h-4" />}
                                                                    title="Annuler"
                                                                    colorClass="hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => openApproveModal(sale)} // même modale mais avec contexte d'annulation
                                                                />
                                                            )}

                                                            {/* Supprimer (can_delete) */}
                                                            {sale.can_delete && (
                                                                <ActionButton
                                                                    icon={<Trash2 className="w-4 h-4" />}
                                                                    title="Supprimer"
                                                                    colorClass="hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleDelete(sale)}
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
                        {sales.last_page > 1 && (
                            <div className="border-t border-stone-100 px-5 py-4 flex items-center justify-between text-sm text-stone-500">
                                <span>Page {sales.current_page} sur {sales.last_page} — {sales.total} résultats</span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={sales.current_page === 1}
                                        onClick={() => router.get(eggSalesIndex.url(), { ...filters, page: sales.current_page - 1 })}
                                        className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={sales.current_page === sales.last_page}
                                        onClick={() => router.get(eggSalesIndex.url(), { ...filters, page: sales.current_page + 1 })}
                                        className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modale d'approbation/annulation */}
                {showApproveModal && selectedSale && (
                    <Modal title="Décision sur la vente" onClose={() => setShowApproveModal(false)}>
                        <div className="space-y-3 mb-6 text-sm">
                            <InfoRow label="Date" value={new Date(selectedSale.sale_date).toLocaleDateString('fr-FR')} />
                            <InfoRow label="Lot" value={selectedSale.flock_name} />
                            <InfoRow label="Client" value={selectedSale.customer_name || '-'} />
                            <InfoRow label="Quantité" value={selectedSale.quantity.toString()} />
                            <InfoRow label="Total TTC" value={`${selectedSale.total_with_tax} €`} />
                        </div>

                        {/* Si on est en mode annulation (can_cancel) */}
                        {selectedSale.can_cancel ? (
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                                    Motif d'annulation <span className="text-stone-400">(obligatoire)</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                    rows={3}
                                    placeholder="Expliquez la raison de l'annulation..."
                                    className="w-full px-3.5 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                />
                            </div>
                        ) : (
                            /* Sinon, mode approbation */
                            <p className="text-sm text-stone-600 mb-6">
                                Êtes-vous sûr de vouloir approuver cette vente ? Le stock d'œufs sera décrémenté.
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="flex-1 px-4 py-2 border border-stone-200 text-stone-700 text-sm rounded-lg hover:bg-stone-50 transition-colors"
                            >
                                Annuler
                            </button>
                            {selectedSale.can_cancel ? (
                                <button
                                    onClick={handleCancel}
                                    disabled={!cancelReason.trim()}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    <XCircle className="w-4 h-4" /> Confirmer l'annulation
                                </button>
                            ) : (
                                <button
                                    onClick={handleApprove}
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approuver
                                </button>
                            )}
                        </div>
                    </Modal>
                )}
            </div>
        </AppLayout>
    );
}