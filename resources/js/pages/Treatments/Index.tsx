// resources/js/Pages/Treatments/Index.tsx
import React, { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import {
    Plus, Edit2, Trash2, Calendar, Syringe, AlertCircle,
    CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight,
    Search, Filter, DollarSign
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useToasts } from '@/components/ToastProvider';
import { treatmentsIndex, treatmentsCreate, treatmentsEdit, treatmentsDestroy, treatmentsApprove, treatmentsReject, treatmentsShow } from '@/routes';

// Types
type TreatmentStatus = 'draft' | 'approved' | 'rejected';

interface Treatment {
    id: number;
    flock_name: string;
    treatment_date: string;
    veterinarian: string | null;
    treatment_type: string | null;
    description: string | null;
    cost: number | null;
    invoice_reference: string | null;
    status: TreatmentStatus;
    created_by: string;
    created_at: string;
    approved_by: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    can_edit: boolean;
    can_delete: boolean;
    can_approve: boolean;
    can_reject: boolean;
}

interface PaginatedTreatments {
    data: Treatment[];
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
    treatments: PaginatedTreatments;
    flocks: FlockOption[];
    filters: Filters;
    flash?: { success?: string; error?: string };
}

// Helpers
const STATUS_META: Record<TreatmentStatus, { label: string; classes: string }> = {
    draft:    { label: 'Brouillon',   classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
    approved: { label: 'Approuvé',    classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    rejected: { label: 'Rejeté',      classes: 'bg-red-100 text-red-600 border border-red-200' },
};

export default function TreatmentsIndex({ treatments, flocks, filters, flash }: PageProps) {
    const { addToast } = useToasts();

    // États locaux pour les filtres
    const [searchFlock, setSearchFlock] = useState(filters.flock_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // États pour les modales
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Notifications flash
    useEffect(() => {
        if (flash?.success) addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    // Appliquer les filtres
    const applyFilters = () => {
        router.get(treatmentsIndex.url(), {
            flock_id: searchFlock || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearchFlock('');
        setStatusFilter('');
        router.get(treatmentsIndex.url(), {}, { replace: true });
    };

    // Actions
    const handleDelete = (treatment: Treatment) => {
        if (!confirm(`Supprimer le traitement du ${new Date(treatment.treatment_date).toLocaleDateString('fr-FR')} pour ${treatment.flock_name} ?`)) return;
        router.delete(treatmentsDestroy.url(treatment.id));
    };

    const openApproveModal = (treatment: Treatment) => {
        setSelectedTreatment(treatment);
        setRejectionReason('');
        setShowApproveModal(true);
    };

    const handleApprove = () => {
        if (!selectedTreatment) return;
        router.post(treatmentsApprove.url(selectedTreatment.id), {}, {
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedTreatment(null);
            },
            onError: (err: any) => {
                addToast({ message: err.message || "Erreur lors de l'approbation", type: 'error' });
            },
        });
    };

    const handleReject = () => {
        if (!selectedTreatment || !rejectionReason.trim()) return;
        router.post(treatmentsReject.url(selectedTreatment.id), {
            reason: rejectionReason,
        }, {
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedTreatment(null);
                setRejectionReason('');
            },
            onError: (err: any) => {
                addToast({ message: err.message || "Erreur lors du rejet", type: 'error' });
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Traitements vétérinaires" />
            <div className="min-h-screen bg-stone-50 font-sans">

                {/* Header */}
                <div className="bg-white border-b border-stone-200 px-8 py-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
                                Traitements vétérinaires
                            </h1>
                            <p className="text-stone-500 text-sm mt-0.5">
                                {treatments.total} traitement{treatments.total !== 1 ? 's' : ''} au total
                            </p>
                        </div>
                        <button
                            onClick={() => router.get(treatmentsCreate.url())}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau traitement
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
                                {flocks.map(f => (
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
                                <option value="rejected">Rejeté</option>
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
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Type</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Vétérinaire</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Coût</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Statut</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {treatments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center text-stone-400 text-sm">
                                                Aucun traitement trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        treatments.data.map(t => {
                                            const sm = STATUS_META[t.status];
                                            return (
                                                <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="flex items-center gap-1.5 text-stone-600">
                                                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                                            {new Date(t.treatment_date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 font-medium text-stone-900">{t.flock_name}</td>
                                                    <td className="px-5 py-4 text-stone-600">{t.treatment_type || '-'}</td>
                                                    <td className="px-5 py-4 text-stone-600">{t.veterinarian || '-'}</td>
                                                    <td className="px-5 py-4 text-stone-600">
                                                        {t.cost ? `${t.cost.toLocaleString('fr-FR')} €` : '-'}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sm.classes}`}>
                                                            {sm.label}
                                                        </span>
                                                        {t.rejection_reason && (
                                                            <div className="text-xs text-red-600 mt-1 max-w-[200px]" title={t.rejection_reason}>
                                                                {t.rejection_reason.substring(0, 30)}...
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
                                                                onClick={() => router.get(treatmentsShow.url(t.id))}
                                                            />

                                                            {/* Modifier (can_edit) */}
                                                            {t.can_edit && (
                                                                <ActionButton
                                                                    icon={<Edit2 className="w-4 h-4" />}
                                                                    title="Modifier"
                                                                    colorClass="hover:text-amber-600 hover:bg-amber-50"
                                                                    onClick={() => router.get(treatmentsEdit.url(t.id))}
                                                                />
                                                            )}

                                                            {/* Approuver / Rejeter (can_approve ou can_reject) */}
                                                            {(t.can_approve || t.can_reject) && (
                                                                <ActionButton
                                                                    icon={<AlertCircle className="w-4 h-4" />}
                                                                    title="Approuver / Rejeter"
                                                                    colorClass="hover:text-emerald-600 hover:bg-emerald-50"
                                                                    onClick={() => openApproveModal(t)}
                                                                />
                                                            )}

                                                            {/* Supprimer (can_delete) */}
                                                            {t.can_delete && (
                                                                <ActionButton
                                                                    icon={<Trash2 className="w-4 h-4" />}
                                                                    title="Supprimer"
                                                                    colorClass="hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleDelete(t)}
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
                        {treatments.last_page > 1 && (
                            <div className="border-t border-stone-100 px-5 py-4 flex items-center justify-between text-sm text-stone-500">
                                <span>Page {treatments.current_page} sur {treatments.last_page} — {treatments.total} résultats</span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={treatments.current_page === 1}
                                        onClick={() => router.get(treatmentsIndex.url(), { ...filters, page: treatments.current_page - 1 })}
                                        className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={treatments.current_page === treatments.last_page}
                                        onClick={() => router.get(treatmentsIndex.url(), { ...filters, page: treatments.current_page + 1 })}
                                        className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modale d'approbation */}
                {showApproveModal && selectedTreatment && (
                    <Modal title="Décision d'approbation" onClose={() => setShowApproveModal(false)}>
                        <div className="space-y-3 mb-6 text-sm">
                            <InfoRow label="Lot" value={selectedTreatment.flock_name} />
                            <InfoRow label="Date" value={new Date(selectedTreatment.treatment_date).toLocaleDateString('fr-FR')} />
                            <InfoRow label="Type" value={selectedTreatment.treatment_type || '-'} />
                            <InfoRow label="Vétérinaire" value={selectedTreatment.veterinarian || '-'} />
                            <InfoRow label="Coût" value={selectedTreatment.cost ? `${selectedTreatment.cost} €` : '-'} />
                            {selectedTreatment.description && (
                                <div className="text-stone-600 mt-1 text-xs italic">"{selectedTreatment.description}"</div>
                            )}
                        </div>

                        {selectedTreatment.can_reject && (
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-stone-600 mb-1.5">
                                    Motif de rejet <span className="text-stone-400">(obligatoire si rejeté)</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    rows={3}
                                    placeholder="Expliquez la raison du rejet..."
                                    className="w-full px-3.5 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="flex-1 px-4 py-2 border border-stone-200 text-stone-700 text-sm rounded-lg hover:bg-stone-50 transition-colors"
                            >
                                Annuler
                            </button>
                            {selectedTreatment.can_reject && (
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim()}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    <XCircle className="w-4 h-4" /> Rejeter
                                </button>
                            )}
                            {selectedTreatment.can_approve && (
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

// Sous-composants réutilisables
function ActionButton({ icon, title, colorClass, onClick }: { icon: React.ReactNode; title: string; colorClass: string; onClick: () => void }) {
    return (
        <button onClick={onClick} title={title} className={`p-1.5 rounded-lg text-stone-400 transition-colors ${colorClass}`}>
            {icon}
        </button>
    );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-7 py-5 border-b border-stone-100">
                    <h2 className="text-base font-semibold text-stone-900">{title}</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                        <XCircle className="w-5 h-5" />
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
            <span className="text-stone-500 min-w-[80px] text-xs">{label} :</span>
            <span className="text-stone-900 font-medium text-sm">{value}</span>
        </div>
    );
}