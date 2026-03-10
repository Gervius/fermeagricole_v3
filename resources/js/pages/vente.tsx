import AppLayout from '@/layouts/app-layout';
import { vente } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, TrendingUp, Package, Users, DollarSign, FileText, Download, Eye, Edit, Trash2, CheckCircle, Clock, FileSpreadsheet, Search } from 'lucide-react';






const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vente',
        href: vente().url,
    },
    
];


interface InvoiceLine {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}
  
interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    type: 'eggs' | 'culled' | 'mixed';
    customer: string;
    customerAddress?: string;
    lines: InvoiceLine[];
    subtotal: number;
    tax: number;
    total: number;
    paymentStatus: 'draft' | 'issued' | 'paid' | 'overdue';
    notes?: string;
}
  
interface Quote {
    id: string;
    quoteNumber: string;
    date: string;
    validUntil: string;
    customer: string;
    customerAddress?: string;
    lines: InvoiceLine[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    notes?: string;
}

export default function Vente() {
    const [activeTab, setActiveTab] = useState<'invoices' | 'quotes'>('invoices');
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [invoices, setInvoices] = useState<Invoice[]>([
        {
            id: '1',
            invoiceNumber: 'FAC-2024-001',
            date: '2024-12-01',
            dueDate: '2024-12-31',
            type: 'eggs',
            customer: 'Marina Market',
            customerAddress: 'rue xxx vers orange bobo',
            lines: [
                { id: '1', description: 'Œufs frais calibre M', quantity: 5000, unitPrice: 180, total: 900000 }
            ],
            subtotal: 900000,
            tax: 162000,
            total: 1062000,
            paymentStatus: 'paid',
            notes: 'Livraison effectuée le 01/12/2024',
        },
        {
            id: '2',
            invoiceNumber: 'FAC-2024-002',
            date: '2024-11-30',
            dueDate: '2024-12-30',
            type: 'eggs',
            customer: 'ABC Market',
            customerAddress: '45 Avenue des Champs, Thiès',
            lines: [
                { id: '1', description: 'Œufs frais calibre L', quantity: 1200, unitPrice: 200, total: 240000 }
        ],
            subtotal: 240000,
            tax: 43200,
            total: 283200,
            paymentStatus: 'issued',
        },
        {
            id: '3',
            invoiceNumber: 'FAC-2024-003',
            date: '2024-11-29',
            dueDate: '2024-12-29',
            type: 'culled',
            customer: 'Abattoir De Bobo Dioulasso',
            customerAddress: 'Nieneta',
            lines: [
                { id: '1', description: 'Poules de réforme', quantity: 150, unitPrice: 3500, total: 525000 }
            ],
            subtotal: 525000,
            tax: 94500,
            total: 619500,
            paymentStatus: 'overdue',
        },
    ]);

    const [quotes, setQuotes] = useState<Quote[]>([
        {
            id: '1',
            quoteNumber: 'DEV-2024-001',
            date: '2024-12-10',
            validUntil: '2024-12-25',
            customer: 'Hotel SISSIMA',
            customerAddress: 'Bobo diouslasso',
            lines: [
                { id: '1', description: 'Œufs frais bio calibre XL', quantity: 2000, unitPrice: 250, total: 500000 }
            ],
            subtotal: 500000,
            tax: 90000,
            total: 590000,
            status: 'pending',
        },
    ]);

    const [invoiceFormData, setInvoiceFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        customer: '',
        customerAddress: '',
        notes: '',
        lines: [{ description: '', quantity: '', unitPrice: '' }],
    });

    const [quoteFormData, setQuoteFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        validUntil: '',
        customer: '',
        customerAddress: '',
        notes: '',
        lines: [{ description: '', quantity: '', unitPrice: '' }],
    });

    // Generate next invoice number
    const generateInvoiceNumber = () => {
        const year = new Date().getFullYear();
        const count = invoices.length + 1;
            return `FAC-${year}-${String(count).padStart(3, '0')}`;
    };

    // Generate next quote number
    const generateQuoteNumber = () => {
        const year = new Date().getFullYear();
        const count = quotes.length + 1;
            return `DEV-${year}-${String(count).padStart(3, '0')}`;
    };

    // Add line to invoice form
    const addInvoiceLine = () => {
        setInvoiceFormData({
            ...invoiceFormData,
            lines: [...invoiceFormData.lines, { description: '', quantity: '', unitPrice: '' }],
        });
    };

    // Remove line from invoice form
    const removeInvoiceLine = (index: number) => {
        const newLines = invoiceFormData.lines.filter((_, i) => i !== index);
        setInvoiceFormData({ ...invoiceFormData, lines: newLines });
    };

    // Update invoice line
    const updateInvoiceLine = (index: number, field: string, value: string) => {
        const newLines = [...invoiceFormData.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setInvoiceFormData({ ...invoiceFormData, lines: newLines });
    };

    // Calculate invoice totals
    const calculateInvoiceTotals = () => {
        const subtotal = invoiceFormData.lines.reduce((sum, line) => {
            const qty = parseFloat(line.quantity) || 0;
            const price = parseFloat(line.unitPrice) || 0;
            return sum + qty * price;
        }, 0);
        const tax = subtotal * 0.18; // 18% TVA
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    // Submit invoice
    const handleInvoiceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totals = calculateInvoiceTotals();
        
        const newInvoice: Invoice = {
            id: Date.now().toString(),
            invoiceNumber: generateInvoiceNumber(),
            date: invoiceFormData.date,
            dueDate: invoiceFormData.dueDate,
            type: 'mixed',
            customer: invoiceFormData.customer,
            customerAddress: invoiceFormData.customerAddress,
            lines: invoiceFormData.lines.map((line, idx) => ({
                id: idx.toString(),
                description: line.description,
                quantity: parseFloat(line.quantity),
                unitPrice: parseFloat(line.unitPrice),
                total: parseFloat(line.quantity) * parseFloat(line.unitPrice),
            })),
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            paymentStatus: 'draft',
            notes: invoiceFormData.notes,
        };

        setInvoices([newInvoice, ...invoices]);
        setShowInvoiceForm(false);
        resetInvoiceForm();
    };

    // Submit quote
    const handleQuoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subtotal = quoteFormData.lines.reduce((sum, line) => {
        const qty = parseFloat(line.quantity) || 0;
        const price = parseFloat(line.unitPrice) || 0;
        return sum + qty * price;
        }, 0);
        const tax = subtotal * 0.18;
        const total = subtotal + tax;
        
        const newQuote: Quote = {
            id: Date.now().toString(),
            quoteNumber: generateQuoteNumber(),
            date: quoteFormData.date,
            validUntil: quoteFormData.validUntil,
            customer: quoteFormData.customer,
            customerAddress: quoteFormData.customerAddress,
            lines: quoteFormData.lines.map((line, idx) => ({
                id: idx.toString(),
                description: line.description,
                quantity: parseFloat(line.quantity),
                unitPrice: parseFloat(line.unitPrice),
                total: parseFloat(line.quantity) * parseFloat(line.unitPrice),
            })),
            subtotal,
            tax,
            total,
            status: 'pending',
            notes: quoteFormData.notes,
        };

        setQuotes([newQuote, ...quotes]);
        setShowQuoteForm(false);
        resetQuoteForm();
    };

    const resetInvoiceForm = () => {
        setInvoiceFormData({
            date: new Date().toISOString().split('T')[0],
            dueDate: '',
            customer: '',
            customerAddress: '',
            notes: '',
            lines: [{ description: '', quantity: '', unitPrice: '' }],
        });
    };

    const resetQuoteForm = () => {
        setQuoteFormData({
            date: new Date().toISOString().split('T')[0],
            validUntil: '',
            customer: '',
            customerAddress: '',
            notes: '',
            lines: [{ description: '', quantity: '', unitPrice: '' }],
        });
    };

    // Convert quote to invoice
    const convertQuoteToInvoice = (quote: Quote) => {
        const newInvoice: Invoice = {
            id: Date.now().toString(),
            invoiceNumber: generateInvoiceNumber(),
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type: 'mixed',
            customer: quote.customer,
            customerAddress: quote.customerAddress,
            lines: quote.lines,
            subtotal: quote.subtotal,
            tax: quote.tax,
            total: quote.total,
            paymentStatus: 'issued',
            notes: `Converti du devis ${quote.quoteNumber}`,
        };

        setInvoices([newInvoice, ...invoices]);
        
        // Update quote status
        const updatedQuotes = quotes.map(q => 
        q.id === quote.id ? { ...q, status: 'accepted' as const } : q
        );
        setQuotes(updatedQuotes);
    };

    // Export to PDF
    const exportToPDF = async (invoice: Invoice) => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('FACTURE', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text('Ferme Avicole', 20, 40);
        doc.text('123 Route de la Ferme', 20, 45);
        doc.text('Dakar, Sénégal', 20, 50);
        
        // Invoice info
        doc.setFontSize(12);
        doc.text(`Facture N°: ${invoice.invoiceNumber}`, 140, 40);
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, 140, 45);
        doc.text(`Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 140, 50);
        
        // Customer info
        doc.setFontSize(10);
        doc.text('Facturé à:', 20, 65);
        doc.text(invoice.customer, 20, 70);
        if (invoice.customerAddress) {
            doc.text(invoice.customerAddress, 20, 75);
        }
        
        // Table header
        let yPos = 90;
        doc.setFontSize(10);
        doc.text('Description', 20, yPos);
        doc.text('Qté', 120, yPos);
        doc.text('P.U.', 145, yPos);
        doc.text('Total', 170, yPos);
        
        yPos += 5;
        doc.line(20, yPos, 190, yPos);
        
        // Items
        yPos += 7;
        invoice.lines.forEach((line) => {
        doc.text(line.description, 20, yPos);
        doc.text(line.quantity.toString(), 120, yPos);
        doc.text(`${line.unitPrice.toLocaleString()} FCFA`, 145, yPos);
        doc.text(`${line.total.toLocaleString()} FCFA`, 170, yPos);
        yPos += 7;
        });
        
        // Totals
        yPos += 5;
        doc.line(20, yPos, 190, yPos);
        yPos += 7;
        
        doc.text('Sous-total:', 130, yPos);
        doc.text(`${invoice.subtotal.toLocaleString()} FCFA`, 170, yPos);
        yPos += 7;
        
        doc.text('TVA (18%):', 130, yPos);
        doc.text(`${invoice.tax.toLocaleString()} FCFA`, 170, yPos);
        yPos += 7;
        
        doc.setFontSize(12);
        doc.text('TOTAL:', 130, yPos);
        doc.text(`${invoice.total.toLocaleString()} FCFA`, 170, yPos);
        
        // Notes
        if (invoice.notes) {
            yPos += 15;
            doc.setFontSize(9);
            doc.text('Notes:', 20, yPos);
            doc.text(invoice.notes, 20, yPos + 5);
        }
        
        doc.save(`${invoice.invoiceNumber}.pdf`);
    };

    // Export to Excel (CSV)
    const exportToExcel = (invoice: Invoice) => {
        let csv = 'Description,Quantité,Prix Unitaire,Total\n';
        
        invoice.lines.forEach((line) => {
        csv += `"${line.description}",${line.quantity},${line.unitPrice},${line.total}\n`;
        });
        
        csv += `\n,,,\n`;
        csv += `Sous-total,,,${invoice.subtotal}\n`;
        csv += `TVA (18%),,,${invoice.tax}\n`;
        csv += `TOTAL,,,${invoice.total}\n`;
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${invoice.invoiceNumber}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Mark invoice as paid
    const markAsPaid = (invoiceId: string) => {
        const updatedInvoices = invoices.map(inv =>
            inv.id === invoiceId ? { ...inv, paymentStatus: 'paid' as const } : inv
        );
        setInvoices(updatedInvoices);
    };

    // Delete invoice
    const deleteInvoice = (invoiceId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            setInvoices(invoices.filter(inv => inv.id !== invoiceId));
        }
    };

    // Delete quote
    const deleteQuote = (quoteId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
            setQuotes(quotes.filter(q => q.id !== quoteId));
        }
    };

    // Filter functions
    const filteredInvoices = invoices.filter(inv =>
        inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredQuotes = quotes.filter(q =>
        q.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Statistics
    const totalRevenue = invoices
        .filter(inv => inv.paymentStatus === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);
    
    const pendingAmount = invoices
        .filter(inv => inv.paymentStatus === 'issued' || inv.paymentStatus === 'overdue')
        .reduce((sum, inv) => sum + inv.total, 0);
  
    const overdueAmount = invoices
        .filter(inv => inv.paymentStatus === 'overdue')
        .reduce((sum, inv) => sum + inv.total, 0);

    const getPaymentStatusColor = (status: Invoice['paymentStatus']) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-700';
            case 'issued':
                return 'bg-blue-100 text-blue-700';
            case 'draft':
                return 'bg-gray-100 text-gray-700';
            case 'overdue':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getPaymentStatusLabel = (status: Invoice['paymentStatus']) => {
        switch (status) {
            case 'paid':
                return 'Payée';
            case 'issued':
                return 'Émise';
            case 'draft':
                return 'Brouillon';
            case 'overdue':
                return 'En retard';
            default:
                return status;
        }
    };

    const getQuoteStatusColor = (status: Quote['status']) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            case 'expired':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getQuoteStatusLabel = (status: Quote['status']) => {
        switch (status) {
            case 'accepted':
                return 'Accepté';
            case 'pending':
                return 'En attente';
            case 'rejected':
                return 'Rejeté';
            case 'expired':
                return 'Expiré';
            default:
                return status;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vente" />
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-gray-900 mb-2">Ventes et Facturation</h1>
                        <p className="text-gray-600">Gérez vos devis, factures et suivez vos paiements</p>
                    </div>
                    <button
                        onClick={() => activeTab === 'invoices' ? setShowInvoiceForm(true) : setShowQuoteForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        {activeTab === 'invoices' ? 'Nouvelle facture' : 'Nouveau devis'}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{totalRevenue.toLocaleString()} FCFA</div>
                        <div className="text-sm text-gray-600">Chiffre d'affaires encaissé</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{invoices.length}</div>
                        <div className="text-sm text-gray-600">Factures émises</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{pendingAmount.toLocaleString()} FCFA</div>
                        <div className="text-sm text-gray-600">En attente de paiement</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <DollarSign className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <div className="text-2xl text-gray-900 mb-1">{overdueAmount.toLocaleString()} FCFA</div>
                        <div className="text-sm text-gray-600">Factures en retard</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('invoices')}
                                className={`px-6 py-4 text-sm transition-colors ${
                                    activeTab === 'invoices'
                                    ? 'border-b-2 border-amber-500 text-amber-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Factures
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('quotes')}
                                className={`px-6 py-4 text-sm transition-colors ${
                                    activeTab === 'quotes'
                                    ? 'border-b-2 border-amber-500 text-amber-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Devis
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={activeTab === 'invoices' ? 'Rechercher une facture...' : 'Rechercher un devis...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Invoices Tab */}
                    {activeTab === 'invoices' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">N° Facture</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Date</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Client</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Montant HT</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">TVA</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Total TTC</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Statut</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-900">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {new Date(invoice.date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">{invoice.customer}</td>
                                        <td className="px-6 py-4 text-gray-700">{invoice.subtotal.toLocaleString()} FCFA</td>
                                        <td className="px-6 py-4 text-gray-700">{invoice.tax.toLocaleString()} FCFA</td>
                                        <td className="px-6 py-4 text-gray-900">{invoice.total.toLocaleString()} FCFA</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                                                {getPaymentStatusLabel(invoice.paymentStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setPreviewInvoice(invoice);
                                                        setShowPreview(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Prévisualiser"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => exportToPDF(invoice)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Exporter en PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => exportToExcel(invoice)}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Exporter en Excel"
                                                >
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                </button>
                                                {invoice.paymentStatus !== 'paid' && (
                                                    <button
                                                        onClick={() => markAsPaid(invoice.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Marquer comme payée"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteInvoice(invoice.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Quotes Tab */}
                    {activeTab === 'quotes' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">N° Devis</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">Date</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">Valide jusqu'au</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">Client</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">Total TTC</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">Statut</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredQuotes.map((quote) => (
                            <tr key={quote.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-900">{quote.quoteNumber}</td>
                                <td className="px-6 py-4 text-gray-700">
                                {new Date(quote.date).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 text-gray-700">
                                {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 text-gray-900">{quote.customer}</td>
                                <td className="px-6 py-4 text-gray-900">{quote.total.toLocaleString()} FCFA</td>
                                <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${getQuoteStatusColor(quote.status)}`}>
                                    {getQuoteStatusLabel(quote.status)}
                                </span>
                                </td>
                                <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {quote.status === 'pending' && (
                                    <button
                                        onClick={() => convertQuoteToInvoice(quote)}
                                        className="px-3 py-1 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                    >
                                        Convertir en facture
                                    </button>
                                    )}
                                    <button
                                    onClick={() => deleteQuote(quote.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                    >
                                    <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    )}
                </div>

                {/* Invoice Form Modal */}
                {showInvoiceForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
                    <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8">
                        <h2 className="text-gray-900 mb-6">Nouvelle facture</h2>
                        <form onSubmit={handleInvoiceSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={invoiceFormData.date}
                                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                required
                            />
                            </div>
                            <div>
                            <label className="block text-sm text-gray-700 mb-2">Date d'échéance</label>
                            <input
                                type="date"
                                value={invoiceFormData.dueDate}
                                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                required
                            />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Client</label>
                            <input
                            type="text"
                            value={invoiceFormData.customer}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customer: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Nom du client"
                            required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Adresse du client</label>
                            <input
                            type="text"
                            value={invoiceFormData.customerAddress}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerAddress: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Adresse complète"
                            />
                        </div>

                        {/* Invoice Lines */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                            <label className="text-sm text-gray-700">Lignes de facturation</label>
                            <button
                                type="button"
                                onClick={addInvoiceLine}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                + Ajouter une ligne
                            </button>
                            </div>
                            <div className="space-y-3">
                            {invoiceFormData.lines.map((line, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                <input
                                    type="text"
                                    value={line.description}
                                    onChange={(e) => updateInvoiceLine(index, 'description', e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Description"
                                    required
                                />
                                <input
                                    type="number"
                                    value={line.quantity}
                                    onChange={(e) => updateInvoiceLine(index, 'quantity', e.target.value)}
                                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Qté"
                                    required
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={line.unitPrice}
                                    onChange={(e) => updateInvoiceLine(index, 'unitPrice', e.target.value)}
                                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Prix unit."
                                    required
                                />
                                {invoiceFormData.lines.length > 1 && (
                                    <button
                                    type="button"
                                    onClick={() => removeInvoiceLine(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                    <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* Totals */}
                        {invoiceFormData.lines.some(l => l.quantity && l.unitPrice) && (
                            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Sous-total HT:</span>
                                <span className="text-gray-900">{calculateInvoiceTotals().subtotal.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">TVA (18%):</span>
                                <span className="text-gray-900">{calculateInvoiceTotals().tax.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="text-gray-900">Total TTC:</span>
                                <span className="text-xl text-gray-900">{calculateInvoiceTotals().total.toLocaleString()} FCFA</span>
                            </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Notes</label>
                            <textarea
                            value={invoiceFormData.notes}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, notes: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            rows={3}
                            placeholder="Notes ou conditions particulières..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                            type="button"
                            onClick={() => {
                                setShowInvoiceForm(false);
                                resetInvoiceForm();
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                            Annuler
                            </button>
                            <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                            Créer la facture
                            </button>
                        </div>
                        </form>
                    </div>
                    </div>
                )}

                {/* Quote Form Modal */}
                {showQuoteForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
                    <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8">
                        <h2 className="text-gray-900 mb-6">Nouveau devis</h2>
                        <form onSubmit={handleQuoteSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={quoteFormData.date}
                                onChange={(e) => setQuoteFormData({ ...quoteFormData, date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                required
                            />
                            </div>
                            <div>
                            <label className="block text-sm text-gray-700 mb-2">Valide jusqu'au</label>
                            <input
                                type="date"
                                value={quoteFormData.validUntil}
                                onChange={(e) => setQuoteFormData({ ...quoteFormData, validUntil: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                required
                            />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Client</label>
                            <input
                            type="text"
                            value={quoteFormData.customer}
                            onChange={(e) => setQuoteFormData({ ...quoteFormData, customer: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Nom du client"
                            required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Adresse du client</label>
                            <input
                            type="text"
                            value={quoteFormData.customerAddress}
                            onChange={(e) => setQuoteFormData({ ...quoteFormData, customerAddress: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Adresse complète"
                            />
                        </div>

                        {/* Quote Lines - Similar to invoice lines */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                            <label className="text-sm text-gray-700">Lignes du devis</label>
                            <button
                                type="button"
                                onClick={() => {
                                setQuoteFormData({
                                    ...quoteFormData,
                                    lines: [...quoteFormData.lines, { description: '', quantity: '', unitPrice: '' }],
                                });
                                }}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                + Ajouter une ligne
                            </button>
                            </div>
                            <div className="space-y-3">
                            {quoteFormData.lines.map((line, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                <input
                                    type="text"
                                    value={line.description}
                                    onChange={(e) => {
                                    const newLines = [...quoteFormData.lines];
                                    newLines[index] = { ...newLines[index], description: e.target.value };
                                    setQuoteFormData({ ...quoteFormData, lines: newLines });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Description"
                                    required
                                />
                                <input
                                    type="number"
                                    value={line.quantity}
                                    onChange={(e) => {
                                    const newLines = [...quoteFormData.lines];
                                    newLines[index] = { ...newLines[index], quantity: e.target.value };
                                    setQuoteFormData({ ...quoteFormData, lines: newLines });
                                    }}
                                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Qté"
                                    required
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={line.unitPrice}
                                    onChange={(e) => {
                                    const newLines = [...quoteFormData.lines];
                                    newLines[index] = { ...newLines[index], unitPrice: e.target.value };
                                    setQuoteFormData({ ...quoteFormData, lines: newLines });
                                    }}
                                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Prix unit."
                                    required
                                />
                                {quoteFormData.lines.length > 1 && (
                                    <button
                                    type="button"
                                    onClick={() => {
                                        const newLines = quoteFormData.lines.filter((_, i) => i !== index);
                                        setQuoteFormData({ ...quoteFormData, lines: newLines });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                    <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                </div>
                            ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Notes</label>
                            <textarea
                            value={quoteFormData.notes}
                            onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            rows={3}
                            placeholder="Notes ou conditions particulières..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                            type="button"
                            onClick={() => {
                                setShowQuoteForm(false);
                                resetQuoteForm();
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                            Annuler
                            </button>
                            <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                            Créer le devis
                            </button>
                        </div>
                        </form>
                    </div>
                    </div>
                )}

                {/* Preview Modal */}
                {showPreview && previewInvoice && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
                    <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8">
                        <div className="flex items-center justify-between mb-6">
                        <h2 className="text-gray-900">Prévisualisation de la facture</h2>
                        <button
                            onClick={() => setShowPreview(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        </div>
                        
                        {/* Invoice Preview */}
                        <div className="border border-gray-200 rounded-lg p-8 space-y-6">
                        {/* Header */}
                        <div className="flex justify-between">
                            <div>
                            <h3 className="text-2xl text-gray-900 mb-4">FACTURE</h3>
                            <div className="text-sm text-gray-600">
                                <p>Ferme Avicole</p>
                                <p>123 Route de la Ferme</p>
                                <p>Dakar, Sénégal</p>
                            </div>
                            </div>
                            <div className="text-right">
                            <p className="text-sm text-gray-600">Facture N°</p>
                            <p className="text-lg text-gray-900 mb-2">{previewInvoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-600">Date: {new Date(previewInvoice.date).toLocaleDateString('fr-FR')}</p>
                            <p className="text-sm text-gray-600">Échéance: {new Date(previewInvoice.dueDate).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Facturé à:</p>
                            <p className="text-gray-900">{previewInvoice.customer}</p>
                            {previewInvoice.customerAddress && (
                            <p className="text-sm text-gray-600">{previewInvoice.customerAddress}</p>
                            )}
                        </div>

                        {/* Items Table */}
                        <table className="w-full">
                            <thead className="border-b border-gray-200">
                            <tr>
                                <th className="text-left py-2 text-sm text-gray-600">Description</th>
                                <th className="text-right py-2 text-sm text-gray-600">Quantité</th>
                                <th className="text-right py-2 text-sm text-gray-600">Prix unitaire</th>
                                <th className="text-right py-2 text-sm text-gray-600">Total</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {previewInvoice.lines.map((line) => (
                                <tr key={line.id}>
                                <td className="py-3 text-gray-900">{line.description}</td>
                                <td className="py-3 text-right text-gray-700">{line.quantity}</td>
                                <td className="py-3 text-right text-gray-700">{line.unitPrice.toLocaleString()} FCFA</td>
                                <td className="py-3 text-right text-gray-900">{line.total.toLocaleString()} FCFA</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Sous-total HT:</span>
                                <span className="text-gray-900">{previewInvoice.subtotal.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">TVA (18%):</span>
                                <span className="text-gray-900">{previewInvoice.tax.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="text-gray-900">Total TTC:</span>
                                <span className="text-xl text-gray-900">{previewInvoice.total.toLocaleString()} FCFA</span>
                            </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {previewInvoice.notes && (
                            <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Notes:</p>
                            <p className="text-sm text-gray-700">{previewInvoice.notes}</p>
                            </div>
                        )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Fermer
                        </button>
                        <button
                            onClick={() => exportToPDF(previewInvoice)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Télécharger PDF
                        </button>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}