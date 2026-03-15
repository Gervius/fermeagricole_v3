// resources/js/Pages/Invoices/Show.tsx
import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import {
    invoicesAddPayment,
    invoicesApprove,
    invoicesDownloadPdf,
    invoicesIndex,
} from '@/routes';
import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    DollarSign,
    Download,
    Egg,
    FileText,
    MessageCircle,
    User,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    itemable_type: string; // 'App\Models\EggMovement' ou 'App\Models\Flock'
    itemable_id?: number;
}

interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    method: string; // 'Orange Money', 'Wave', 'Espèces', etc.
    reference?: string;
}

interface Invoice {
    can_add_payment: import('react/jsx-runtime').JSX.Element;
    id: number;
    type: 'sale' | 'purchase';
    number: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    date: string;
    due_date: string | null;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    paid_amount: number;
    remaining: number;
    status: 'draft' | 'sent' | 'cancelled';
    payment_status: 'unpaid' | 'partial' | 'paid';
    items: InvoiceItem[];
    payments: Payment[];
    notes?: string;
    created_by: string;
    created_at: string;
    can_approve?: boolean;
    can_cancel?: boolean;
}

interface PartnerStatementLine {
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

interface Props {
    invoice: Invoice;
    partner?: {
        id: number;
        name: string;
        phone?: string;
        email?: string;
        balance: number;
        statement: PartnerStatementLine[];
    };
    flash?: { success?: string; error?: string };
}

export default function InvoiceShow({ invoice, partner, flash }: Props) {
    const { addToast } = useToasts();
    const [activeTab, setActiveTab] = useState<'invoice' | 'statement'>(
        'invoice',
    );

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: invoice.remaining,
        payment_date: new Date().toISOString().split('T')[0],
        method: 'Orange Money',
        reference: '',
    });

    if (flash?.success) addToast({ message: flash.success, type: 'success' });
    if (flash?.error) addToast({ message: flash.error, type: 'error' });

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(invoicesAddPayment.url(invoice.id), paymentForm, {
            onSuccess: () => {
                setShowPaymentModal(false);
                addToast({ message: 'Paiement enregistré', type: 'success' });
                // Recharger les données de la facture pour mettre à jour les montants
                router.reload({ only: ['invoice'] });
            },
            onError: (err: any) => {
                addToast({
                    message: err.message || 'Erreur lors du paiement',
                    type: 'error',
                });
            },
        });
    };

    const handleWhatsApp = () => {
        if (!invoice.customer_phone) {
            addToast({
                message: 'Numéro de téléphone client manquant',
                type: 'error',
            });
            return;
        }
        const message = `Bonjour ${invoice.customer_name}, voici votre facture ${invoice.number} du ${format(parseISO(invoice.date), 'dd/MM/yyyy')} d'un montant de ${formatCurrency(invoice.total)}. Montant dû : ${formatCurrency(invoice.remaining)}. Merci.`;
        const url = `https://wa.me/${invoice.customer_phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleDownloadPdf = () => {
        router.get(
            invoicesDownloadPdf.url(invoice.id),
            {},
            { preserveState: true },
        );
    };

    const getItemIcon = (type: string) => {
        if (type.includes('Egg'))
            return <Egg className="h-4 w-4 text-amber-600" />;
        if (type.includes('Flock'))
            return <Users className="h-4 w-4 text-emerald-600" />;
        return <FileText className="h-4 w-4 text-stone-400" />;
    };

    const handleApprove = () => {
        router.post(
            invoicesApprove.url(invoice.id),
            {},
            {
                onSuccess: () => {
                    addToast({ message: 'Facture approuvée', type: 'success' });
                    // Recharger les données pour mettre à jour le statut
                    router.reload({ only: ['invoice'] });
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Facturation', href: invoicesIndex.url() },
                { title: `Facture ${invoice.number}`, href: '#' },
            ]}
        >
            <Head title={`Facture ${invoice.number}`} />
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                    {/* En-tête avec actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 px-6 py-5">
                        <button
                            onClick={() => router.get(invoicesIndex.url())}
                            className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
                        >
                            <ArrowLeft className="h-4 w-4" /> Retour
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={handleWhatsApp}
                                className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600"
                                disabled={!invoice.customer_phone}
                            >
                                <MessageCircle className="h-4 w-4" /> WhatsApp
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                className="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200"
                            >
                                <Download className="h-4 w-4" /> PDF
                            </button>
                            {invoice.status === 'draft' &&
                                invoice.can_approve && (
                                    <button
                                        onClick={handleApprove}
                                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                                    >
                                        <CheckCircle className="h-4 w-4" />{' '}
                                        Approuver
                                    </button>
                                )}
                            {invoice.can_add_payment && (
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
                                >
                                    <DollarSign className="h-4 w-4" /> Ajouter
                                    un paiement
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Onglets */}
                    <div className="border-b border-stone-100 px-6 pt-4">
                        <div className="flex gap-6">
                            <button
                                onClick={() => setActiveTab('invoice')}
                                className={`relative pb-2 text-sm font-medium transition-colors ${activeTab === 'invoice' ? 'text-indigo-600' : 'text-stone-500 hover:text-stone-700'}`}
                            >
                                Détail de la facture
                                {activeTab === 'invoice' && (
                                    <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-indigo-600" />
                                )}
                            </button>
                            {partner && (
                                <button
                                    onClick={() => setActiveTab('statement')}
                                    className={`relative pb-2 text-sm font-medium transition-colors ${activeTab === 'statement' ? 'text-indigo-600' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    Relevé de compte{' '}
                                    {invoice.type === 'purchase'
                                        ? 'fournisseur'
                                        : 'client'}
                                    {activeTab === 'statement' && (
                                        <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-indigo-600" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                        {activeTab === 'invoice' && (
                            <div className="space-y-6">
                                {/* Info client et montants */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div className="col-span-1">
                                        <h3 className="mb-2 flex items-center gap-1 text-sm font-medium text-stone-500">
                                            <User className="h-4 w-4" />{' '}
                                            {invoice.type === 'purchase'
                                                ? 'Fournisseur'
                                                : 'Client'}
                                        </h3>
                                        <p className="text-base font-semibold text-stone-900">
                                            {invoice.customer_name}
                                        </p>
                                        {invoice.customer_phone && (
                                            <p className="text-sm text-stone-600">
                                                📱 {invoice.customer_phone}
                                            </p>
                                        )}
                                        {invoice.customer_email && (
                                            <p className="text-sm text-stone-600">
                                                ✉️ {invoice.customer_email}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-stone-500">
                                                Montant total
                                            </p>
                                            <p className="text-xl font-bold text-stone-900">
                                                {formatCurrency(invoice.total)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-500">
                                                Déjà payé
                                            </p>
                                            <p className="text-xl font-bold text-emerald-600">
                                                {formatCurrency(
                                                    invoice.paid_amount,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-500">
                                                Reste à payer
                                            </p>
                                            <p className="text-xl font-bold text-amber-600">
                                                {formatCurrency(
                                                    invoice.remaining,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-500">
                                                Échéance
                                            </p>
                                            <p className="flex items-center gap-1 text-base font-medium text-stone-700">
                                                <Calendar className="h-4 w-4 text-stone-400" />
                                                {invoice.due_date
                                                    ? format(
                                                          parseISO(
                                                              invoice.due_date,
                                                          ),
                                                          'dd MMM yyyy',
                                                          { locale: fr },
                                                      )
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Lignes de facture */}
                                <div>
                                    <h3 className="mb-3 text-sm font-medium text-stone-700">
                                        Articles facturés
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-y border-stone-200 bg-stone-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-stone-500">
                                                        Description
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">
                                                        Qté
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">
                                                        Prix unitaire
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100">
                                                {invoice.items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="flex items-center gap-2 px-4 py-3">
                                                            {getItemIcon(
                                                                item.itemable_type,
                                                            )}
                                                            <span>
                                                                {
                                                                    item.description
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {formatCurrency(
                                                                item.unit_price,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium">
                                                            {formatCurrency(
                                                                item.total,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="border-t border-stone-200 bg-stone-50">
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="px-4 py-3 text-right font-semibold"
                                                    >
                                                        Sous-total
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold">
                                                        {formatCurrency(
                                                            invoice.subtotal,
                                                        )}
                                                    </td>
                                                </tr>
                                                {invoice.tax_amount > 0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={3}
                                                            className="px-4 py-3 text-right text-sm text-stone-600"
                                                        >
                                                            TVA (
                                                            {invoice.tax_rate}%)
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium">
                                                            {formatCurrency(
                                                                invoice.tax_amount,
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="px-4 py-3 text-right text-base font-bold"
                                                    >
                                                        Total TTC
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-base font-bold text-indigo-700">
                                                        {formatCurrency(
                                                            invoice.total,
                                                        )}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Historique des paiements */}
                                {invoice.payments.length > 0 && (
                                    <div>
                                        <h3 className="mb-3 text-sm font-medium text-stone-700">
                                            Paiements reçus
                                        </h3>
                                        <div className="space-y-2">
                                            {invoice.payments.map((payment) => (
                                                <div
                                                    key={payment.id}
                                                    className="flex items-center justify-between rounded-lg bg-stone-50 p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                                                            <DollarSign className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-stone-900">
                                                                {formatCurrency(
                                                                    payment.amount,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-stone-500">
                                                                {payment.method}{' '}
                                                                {payment.reference &&
                                                                    `• ${payment.reference}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-stone-500">
                                                        {format(
                                                            parseISO(
                                                                payment.payment_date,
                                                            ),
                                                            'dd/MM/yyyy',
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'statement' && partner && (
                            <ClientStatement partner={partner} />
                        )}
                    </div>
                </div>
                {showPaymentModal && (
                    <AddPaymentModal
                        invoice={invoice}
                        form={paymentForm}
                        setForm={setPaymentForm}
                        onSubmit={handleAddPayment}
                        onClose={() => setShowPaymentModal(false)}
                    />
                )}
            </div>
        </AppLayout>
    );
}

function AddPaymentModal({ invoice, form, setForm, onSubmit, onClose }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-stone-100 px-7 py-5">
                    <h2 className="text-base font-semibold text-stone-900">
                        Ajouter un paiement
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4 px-7 py-6">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-stone-600">
                            Montant (FCFA)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="1"
                            max={invoice.remaining}
                            value={form.amount}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    amount: parseFloat(e.target.value),
                                })
                            }
                            className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            required
                        />
                        <p className="mt-1 text-xs text-stone-500">
                            Reste dû : {formatCurrency(invoice.remaining)}
                        </p>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-stone-600">
                            Date de paiement
                        </label>
                        <input
                            type="date"
                            value={form.payment_date}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    payment_date: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-stone-600">
                            Mode de paiement
                        </label>
                        <select
                            value={form.method}
                            onChange={(e) =>
                                setForm({ ...form, method: e.target.value })
                            }
                            className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        >
                            <option value="Orange Money">Orange Money</option>
                            <option value="Wave">Wave</option>
                            <option value="Espèces">Espèces</option>
                            <option value="Virement">Virement</option>
                            <option value="Chèque">Chèque</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-stone-600">
                            Référence (optionnel)
                        </label>
                        <input
                            type="text"
                            value={form.reference}
                            onChange={(e) =>
                                setForm({ ...form, reference: e.target.value })
                            }
                            className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            placeholder="Numéro de transaction"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Composant relevé de compte client
function ClientStatement({ partner }: { partner: any }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-stone-700">
                    Solde actuel
                </h3>
                <p
                    className={`text-lg font-bold ${partner.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                >
                    {formatCurrency(Math.abs(partner.balance))}
                    <span className="ml-2 text-xs font-normal text-stone-500">
                        {partner.balance >= 0
                            ? '(dû par le client)'
                            : '(avoir)'}
                    </span>
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-y border-stone-200 bg-stone-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-stone-500">
                                Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-stone-500">
                                Description
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">
                                Débit
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">
                                Crédit
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">
                                Solde
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {partner.statement.map((line, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2 text-stone-600">
                                    {format(parseISO(line.date), 'dd/MM/yyyy')}
                                </td>
                                <td className="px-4 py-2 text-stone-900">
                                    {line.description}
                                </td>
                                <td className="px-4 py-2 text-right text-red-600">
                                    {line.debit > 0
                                        ? formatCurrency(line.debit)
                                        : '-'}
                                </td>
                                <td className="px-4 py-2 text-right text-emerald-600">
                                    {line.credit > 0
                                        ? formatCurrency(line.credit)
                                        : '-'}
                                </td>
                                <td className="px-4 py-2 text-right font-medium text-stone-900">
                                    {formatCurrency(line.balance)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
