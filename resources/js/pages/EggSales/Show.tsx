// resources/js/Pages/EggSales/Show.tsx
import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { eggSalesIndex } from '@/routes';

interface Props {
    sale: {
        id: number;
        sale_date: string;
        flock_name: string;
        customer_name: string | null;
        quantity: number;
        unit_price: number;
        total: number;
        tax_rate: number;
        tax_amount: number;
        total_with_tax: number;
        status: string;
        created_by: string;
        created_at: string;
        approved_by: string | null;
        approved_at: string | null;
        cancellation_reason: string | null;
        invoice_reference: string | null;
    };
}

export default function Show({ sale }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Détail vente', href: '#' }]}>
            <Head title="Détail de la vente" />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="bg-white border border-stone-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-xl font-semibold text-stone-900">Détail de la vente</h1>
                        <button
                            onClick={() => router.get(eggSalesIndex.url())}
                            className="text-stone-400 hover:text-stone-600"
                        >
                            Retour
                        </button>
                    </div>

                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt className="text-stone-500">Date</dt>
                            <dd className="font-medium">{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Lot</dt>
                            <dd>{sale.flock_name}</dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Client</dt>
                            <dd>{sale.customer_name || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Quantité</dt>
                            <dd>{sale.quantity}</dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Prix unitaire</dt>
                            <dd>{sale.unit_price} €</dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Total HT</dt>
                            <dd>{sale.total} €</dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">TVA</dt>
                            <dd>{sale.tax_rate}% ({sale.tax_amount} €)</dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Total TTC</dt>
                            <dd className="font-semibold">{sale.total_with_tax} €</dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Statut</dt>
                            <dd>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    sale.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                    sale.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {sale.status === 'approved' ? 'Approuvé' : sale.status === 'cancelled' ? 'Annulé' : 'Brouillon'}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Réf. facture</dt>
                            <dd>{sale.invoice_reference || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-stone-500">Créé par</dt>
                            <dd>{sale.created_by} le {sale.created_at}</dd>
                        </div>
                        {sale.approved_by && (
                            <>
                                <div>
                                    <dt className="text-stone-500">Approuvé par</dt>
                                    <dd>{sale.approved_by}</dd>
                                </div>
                                <div>
                                    <dt className="text-stone-500">Date approbation</dt>
                                    <dd>{sale.approved_at}</dd>
                                </div>
                            </>
                        )}
                        {sale.cancellation_reason && (
                            <div className="col-span-2">
                                <dt className="text-stone-500">Motif d'annulation</dt>
                                <dd className="text-red-600">{sale.cancellation_reason}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}