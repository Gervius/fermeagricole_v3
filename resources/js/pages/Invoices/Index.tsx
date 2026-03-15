// resources/js/Pages/Invoices/Index.tsx
import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { invoicesCreate, invoicesIndex, invoicesShow } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    Egg,
    Eye,
    FileText,
    MessageCircle,
    Plus,
    Search,
    Send,
    Users,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Types
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'cancelled';
type PaymentStatus = 'unpaid' | 'partial' | 'paid';

interface Invoice {
    id: number;
    number: string;
    customer_name: string;
    customer_phone?: string;
    date: string;
    due_date: string | null;
    total: number;
    paid_amount: number;
    remaining: number;
    status: InvoiceStatus;
    payment_status: PaymentStatus;
    items_count: number;
    items_types: string[]; // ex: ['egg', 'flock']
    is_overdue: boolean;
}

interface Stats {
    total_revenue: number;
    total_collected: number;
    total_receivable: number;
    overdue_count: number;
}

interface Props {
    invoices: {
        data: Invoice[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; payment_status?: string };
    stats: Stats;
    flash?: { success?: string; error?: string };
}

// Helpers
const STATUS_META: Record<
    InvoiceStatus,
    { label: string; classes: string; icon: any }
> = {
    draft: {
        label: 'Brouillon',
        classes: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: Clock,
    },
    sent: {
        label: 'Envoyée',
        classes: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Send,
    },
    paid: {
        label: 'Soldée',
        classes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
    },
    partial: {
        label: 'Partielle',
        classes: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: AlertCircle,
    },
    cancelled: {
        label: 'Annulée',
        classes: 'bg-red-100 text-red-600 border-red-200',
        icon: XCircle,
    },
};

const PAYMENT_STATUS_META: Record<
    PaymentStatus,
    { label: string; color: string }
> = {
    unpaid: { label: 'Non payé', color: 'bg-red-500' },
    partial: { label: 'Partiel', color: 'bg-amber-500' },
    paid: { label: 'Payé', color: 'bg-emerald-500' },
};

export default function InvoicesIndex({
    invoices,
    filters,
    stats,
    flash,
}: Props) {
    const { addToast } = useToasts();
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        filters.payment_status || '',
    );

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const applyFilters = () => {
        router.get(
            invoicesIndex.url(),
            {
                search: search || undefined,
                payment_status: statusFilter || undefined,
            },
            { preserveState: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');
        router.get(invoicesIndex.url(), {}, { replace: true });
    };

    const handleWhatsAppReminder = (invoice: Invoice) => {
        if (!invoice.customer_phone) {
            addToast({
                message: 'Numéro de téléphone client manquant',
                type: 'error',
            });
            return;
        }
        const message = `Bonjour ${invoice.customer_name}, nous vous rappelons que votre facture ${invoice.number} d'un montant de ${formatCurrency(invoice.remaining)} arrive à échéance le ${invoice.due_date ? format(parseISO(invoice.due_date), 'dd/MM/yyyy') : 'à déterminer'}. Merci de procéder au règlement.`;
        const url = `https://wa.me/${invoice.customer_phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Facturation', href: invoicesIndex.url() }]}
        >
            <Head title="Facturation" />
            <div className="min-h-screen bg-stone-50 pb-12 font-sans">
                {/* Header */}
                <div className="border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-stone-900">
                                <Wallet className="h-6 w-6 text-stone-400" />
                                Facturation & Créances
                            </h1>
                            <p className="mt-1 text-sm text-stone-500">
                                Gérez vos ventes d'œufs et de poules de réforme.
                            </p>
                        </div>
                        <button
                            onClick={() => router.get(invoicesCreate.url())}
                            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-colors hover:bg-amber-600"
                        >
                            <Plus className="h-4 w-4" /> Nouvelle Facture
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
                    {/* KPIs */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Chiffre d'Affaires"
                            value={stats.total_revenue}
                            icon={DollarSign}
                            color="indigo"
                        />
                        <StatCard
                            label="Encaissé"
                            value={stats.total_collected}
                            icon={CheckCircle}
                            color="emerald"
                        />
                        <StatCard
                            label="Reste à encaisser"
                            value={stats.total_receivable}
                            icon={AlertCircle}
                            color="amber"
                        />
                        <StatCard
                            label="Factures en retard"
                            value={stats.overdue_count}
                            icon={Clock}
                            color="red"
                        />
                    </div>

                    {/* Filtres */}
                    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row">
                        <form
                            onSubmit={applyFilters}
                            className="flex w-full flex-1 gap-3"
                        >
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="N° Facture, Client..."
                                    className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pr-4 pl-9 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="">Tous les paiements</option>
                                <option value="paid">Soldées</option>
                                <option value="partial">
                                    Paiement partiel
                                </option>
                                <option value="unpaid">Non payées</option>
                            </select>
                            <button
                                type="submit"
                                className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200"
                            >
                                Filtrer
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                            >
                                Réinitialiser
                            </button>
                        </form>
                    </div>

                    {/* Liste des factures */}
                    <div className="space-y-4">
                        {invoices.data.length === 0 ? (
                            <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
                                <DollarSign className="mx-auto mb-3 h-12 w-12 text-stone-300" />
                                <p className="text-stone-400">
                                    Aucune facture trouvée.
                                </p>
                            </div>
                        ) : (
                            invoices.data.map((invoice) => {
                                const statusMeta = STATUS_META[invoice.status];
                                const StatusIcon = statusMeta.icon;
                                const paymentMeta =
                                    PAYMENT_STATUS_META[invoice.payment_status];
                                const progress =
                                    invoice.total > 0
                                        ? (invoice.paid_amount /
                                              invoice.total) *
                                          100
                                        : 0;

                                return (
                                    <div
                                        key={invoice.id}
                                        className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        {/* En-tête */}
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-1">
                                                    {invoice.items_types.includes(
                                                        'egg',
                                                    ) && (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-100">
                                                            <Egg className="h-4 w-4 text-amber-600" />
                                                        </div>
                                                    )}
                                                    {invoice.items_types.includes(
                                                        'flock',
                                                    ) && (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-100">
                                                            <Users className="h-4 w-4 text-emerald-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-stone-900">
                                                        {invoice.number}
                                                    </h3>
                                                    <p className="text-sm text-stone-500">
                                                        {invoice.customer_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.classes} flex items-center gap-1`}
                                                >
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusMeta.label}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        router.get(
                                                            invoicesShow.url(
                                                                invoice.id,
                                                            ),
                                                        )
                                                    }
                                                    className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                                    title="Voir détail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Corps : montants et timeline */}
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div>
                                                <p className="text-xs text-stone-500">
                                                    Total TTC
                                                </p>
                                                <p className="text-xl font-bold text-stone-900">
                                                    {formatCurrency(
                                                        invoice.total,
                                                    )}
                                                </p>
                                                {invoice.due_date && (
                                                    <p
                                                        className={`mt-1 flex items-center gap-1 text-xs ${invoice.is_overdue ? 'text-red-600' : 'text-stone-400'}`}
                                                    >
                                                        <Clock className="h-3 w-3" />
                                                        Échéance :{' '}
                                                        {format(
                                                            parseISO(
                                                                invoice.due_date,
                                                            ),
                                                            'dd MMM yyyy',
                                                            { locale: fr },
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone-500">
                                                    Payé
                                                </p>
                                                <p className="text-xl font-bold text-emerald-600">
                                                    {formatCurrency(
                                                        invoice.paid_amount,
                                                    )}
                                                </p>
                                                <p className="text-xs text-stone-400">
                                                    {invoice.items_count}{' '}
                                                    article(s)
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end justify-end">
                                                {invoice.payment_status !==
                                                    'paid' &&
                                                    invoice.customer_phone && (
                                                        <button
                                                            onClick={() =>
                                                                handleWhatsAppReminder(
                                                                    invoice,
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600"
                                                        >
                                                            <MessageCircle className="h-4 w-4" />
                                                            Relance WhatsApp
                                                        </button>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Timeline de paiement */}
                                        <PaymentTimeline
                                            status={invoice.payment_status}
                                            progress={progress}
                                            dueDate={invoice.due_date}
                                            isOverdue={invoice.is_overdue}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {invoices.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                            <p className="text-sm text-stone-500">
                                Page {invoices.current_page} sur{' '}
                                {invoices.last_page}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={invoices.current_page === 1}
                                    onClick={() =>
                                        router.get(invoicesIndex.url(), {
                                            page: invoices.current_page - 1,
                                        })
                                    }
                                    className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    disabled={
                                        invoices.current_page ===
                                        invoices.last_page
                                    }
                                    onClick={() =>
                                        router.get(invoicesIndex.url(), {
                                            page: invoices.current_page + 1,
                                        })
                                    }
                                    className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 disabled:opacity-30"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

// Composant de carte statistique
function StatCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: number;
    icon: any;
    color: string;
}) {
    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
    };
    return (
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs font-medium text-stone-500">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-stone-900">
                        {formatCurrency(value)}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Composant Timeline
function PaymentTimeline({
    status,
    progress,
    dueDate,
    isOverdue,
}: {
    status: string;
    progress: number;
    dueDate?: string | null;
    isOverdue?: boolean;
}) {
    const steps = [
        { label: 'Émise', icon: FileText, completed: true },
        {
            label: 'Échéance',
            icon: Calendar,
            completed:
                status === 'paid' ||
                (dueDate && new Date(dueDate) <= new Date()),
        },
        { label: 'Encaissée', icon: DollarSign, completed: status === 'paid' },
    ];

    return (
        <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">
                    Progression du paiement
                </span>
                <span className="text-xs font-medium text-stone-700">
                    {Math.round(progress)}%
                </span>
            </div>
            <div className="mb-4 h-2 w-full rounded-full bg-stone-200">
                <div
                    className={`h-2 rounded-full transition-all ${isOverdue ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex items-center justify-between">
                {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isActive =
                        step.completed ||
                        (idx === 1 &&
                            dueDate &&
                            new Date(dueDate) <= new Date() &&
                            status !== 'paid');
                    return (
                        <div
                            key={idx}
                            className="flex flex-col items-center text-xs"
                        >
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}
                            >
                                <StepIcon className="h-4 w-4" />
                            </div>
                            <span className="mt-1 text-stone-600">
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
