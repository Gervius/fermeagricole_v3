import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useToasts } from '@/components/ToastProvider';
import {

Eye, Edit2, Send, AlertCircle, ClipboardList, CheckCircle, XCircle,
MapPin, Calendar, Plus, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import { flocksApprove, flocksDestroy, flocksReject, flocksSubmit } from '@/routes';

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
notes?: string;
creator: string;
approver?: string;
approved_at?: string;
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

interface PageProps {
flock: Flock;
dailyRecords: DailyRecord[];
flash?: { success?: string; error?: string };
[key: string]: any;
}

// ─────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────

const STATUS_META: Record<FlockStatus, { label: string; classes: string }> = {
draft:     { label: 'Brouillon',   classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
pending:   { label: 'En attente',  classes: 'bg-amber-100 text-amber-700 border border-amber-200' },
active:    { label: 'Actif',       classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
rejected:  { label: 'Rejeté',      classes: 'bg-red-100 text-red-600 border border-red-200' },
completed: { label: 'Terminé',     classes: 'bg-slate-100 text-slate-500 border border-slate-200' },
};

const RECORD_STATUS_META: Record<RecordStatus, { label: string; classes: string }> = {
pending:  { label: 'En attente', classes: 'bg-amber-100 text-amber-700' },
approved: { label: 'Approuvé',   classes: 'bg-emerald-100 text-emerald-700' },
rejected: { label: 'Rejeté',     classes: 'bg-red-100 text-red-600' },
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function FlockShow() {
const { flock, dailyRecords, flash } = usePage<PageProps>().props;

const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showApproveModal, setShowApproveModal] = useState(false);
const [rejectionReason, setRejectionReason] = useState('');
  const { addToast } = useToasts();

  useEffect(() => {
    if (flash?.success) addToast({ message: String(flash.success), type: 'success' });
    if (flash?.error) addToast({ message: String(flash.error), type: 'error' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  router.patch(flocksReject.url(flock.id), { reason: rejectionReason }, {
    onSuccess: () => {
      setShowApproveModal(false);
      setRejectionReason('');
    },
  });
};

// ── Statistics ──────────────────────────────

const approvedRecords = dailyRecords.filter(r => r.status === 'approved');
const stats = {
  totalLosses: approvedRecords.reduce((s, r) => s + r.losses, 0),
  avgEggs: approvedRecords.length
    ? Math.round(approvedRecords.reduce((s, r) => s + r.eggs, 0) / approvedRecords.length)
    : 0,
  count: approvedRecords.length,
};

const sm = STATUS_META[flock.status];

// ─────────────────────────────────────────────

return (
  <AppLayout>
    <Head title={`Lot — ${flock.name}`} />
    <div className="min-h-screen bg-stone-50 font-sans">

      {/* Server flashes are shown via ToastProvider */}

      {/* ── Header ── */}
      <div className="bg-white border-b border-stone-200 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-stone-900">{flock.name}</h1>
              <p className="text-stone-500 text-sm mt-1">Détails du lot</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${sm.classes}`}>
              {sm.label}
            </span>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => router.get(`/flocks`)}
              className="px-4 py-2 border border-stone-200 text-stone-700 text-sm rounded-lg hover:bg-stone-50 transition-colors"
            >
              ← Retour
            </button>

            {flock.can_edit && (
              <button
                onClick={() => router.get(`/flocks/${flock.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 border border-amber-200 text-amber-600 text-sm rounded-lg hover:bg-amber-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Modifier
              </button>
            )}

            {flock.can_submit && (
              <button
                onClick={handleSubmitForApproval}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" /> Soumettre pour approbation
              </button>
            )}

            {(flock.can_approve || flock.can_reject) && (
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
              >
                <AlertCircle className="w-4 h-4" /> Approuver / Rejeter
              </button>
            )}

            {flock.can_delete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">

        {/* ── Info cards ── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <InfoCard
            label="Bâtiment"
            value={flock.building}
            icon={<MapPin className="w-4 h-4" />}
          />
          <InfoCard
            label="Date d'arrivée"
            value={flock.arrival_date}
            icon={<Calendar className="w-4 h-4" />}
          />
          <InfoCard
            label="Effectif initial"
            value={flock.initial_quantity.toLocaleString('fr-FR')}
          />
          <InfoCard
            label="Effectif actuel"
            value={flock.current_quantity.toLocaleString('fr-FR')}
          />
        </div>

        {/* ── Details ── */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Informations</h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="Créé par" value={flock.creator} />
            {flock.approver && (
              <>
                <InfoRow label="Approuvé par" value={flock.approver} />
                <InfoRow label="Date d'approbation" value={flock.approved_at || '—'} />
              </>
            )}
            {flock.notes && (
              <div>
                <span className="text-stone-500">Notes :</span>
                <p className="text-stone-900 mt-1 whitespace-pre-wrap">{flock.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Daily records stats ── */}
        {flock.status === 'active' && (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total pertes" value={stats.totalLosses} />
            <StatCard label="Moy. œufs/jour" value={stats.avgEggs.toLocaleString('fr-FR')} />
            <StatCard label="Saisies approuvées" value={stats.count} />
          </div>
        )}

        {/* ── Daily records table ── */}
        {dailyRecords.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="text-lg font-semibold text-stone-900">Suivi journalier</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    {['Date', 'Pertes', 'Œufs', 'Notes', 'Statut', 'Approuvé par'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {dailyRecords.map(record => {
                    const rsm = RECORD_STATUS_META[record.status];
                    return (
                      <tr key={record.id} className="hover:bg-stone-50">
                        <td className="px-6 py-4 text-stone-700">
                          {new Date(record.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-stone-700">{record.losses}</td>
                        <td className="px-6 py-4 text-stone-700">{record.eggs.toLocaleString('fr-FR')}</td>
                        <td className="px-6 py-4 text-stone-500 text-xs max-w-xs">
                          {record.notes || '—'}
                          {record.rejection_reason && (
                            <div className="mt-1 text-red-600 font-medium">
                              Motif : {record.rejection_reason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${rsm.classes}`}>
                            {rsm.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {record.approved_by || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {dailyRecords.length === 0 && flock.status === 'active' && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center">
            <p className="text-stone-500">Aucun enregistrement journalier pour ce lot.</p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
        MODALS
      ═══════════════════════════════════════════════ */}

      {/* ── Approve / Reject modal ── */}
      {showApproveModal && (
        <Modal title="Décision d'approbation" onClose={() => setShowApproveModal(false)}>
          <div className="space-y-4 mb-6">
            <InfoRow label="Lot" value={flock.name} />
            <InfoRow label="Bâtiment" value={flock.building} />
            <InfoRow label="Effectif" value={flock.initial_quantity.toLocaleString('fr-FR')} />
          </div>

          {flock.can_reject && (
            <div className="mb-6">
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Motif de rejet <span className="text-stone-400">(optionnel)</span>
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
            {flock.can_reject && (
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Rejeter
              </button>
            )}
            {flock.can_approve && (
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

      {/* ── Delete modal ── */}
      {showDeleteModal && (
        <Modal title="Confirmer la suppression" onClose={() => setShowDeleteModal(false)}>
          <p className="text-sm text-stone-600 mb-6">
            Êtes-vous sûr de vouloir supprimer le lot "<strong>{flock.name}</strong>" ?
            Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 border border-stone-200 text-stone-700 text-sm rounded-lg hover:bg-stone-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
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
label, value, icon,
}: {
label: string; value: string | number; icon?: React.ReactNode;
}) {
return (
  <div className="bg-white border border-stone-200 rounded-lg p-4">
    <div className="flex items-baseline gap-2 mb-2">
      {icon && <span className="text-stone-400">{icon}</span>}
      <span className="text-xs text-stone-500 font-medium">{label}</span>
    </div>
    <div className="text-lg font-semibold text-stone-900">{value}</div>
  </div>
);
}

function InfoRow({ label, value }: { label: string; value: string }) {
return (
  <div className="flex items-baseline gap-2">
    <span className="text-stone-500 min-w-[100px] text-xs font-medium">{label} :</span>
    <span className="text-stone-900 font-medium">{value}</span>
  </div>
);
}

function StatCard({ label, value }: { label: string; value: string | number }) {
return (
  <div className="bg-white border border-stone-200 rounded-xl p-4">
    <div className="text-xs text-stone-500 mb-1 font-medium">{label}</div>
    <div className="text-2xl font-bold text-stone-900">{value}</div>
  </div>
);
}

function Modal({
title, onClose, children,
}: {
title: string; onClose: () => void; children: React.ReactNode;
}) {
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