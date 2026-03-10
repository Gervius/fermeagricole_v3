import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { veterinaire } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Calendar, Syringe, AlertCircle, CheckCircle } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Veterinaire',
        href: veterinaire().url,
    },
    
];

interface Treatment {
    id: string;
    date: string;
    type: 'vaccination' | 'medication' | 'prevention';
    name: string;
    flock: string;
    doses: number;
    veterinarian: string;
    notes: string;
    status: 'scheduled' | 'completed';
}
  

export default function Veterinaire() {

    const [showForm, setShowForm] = useState(false);
    const [treatments, setTreatments] = useState<Treatment[]>([
        {
            id: '1',
            date: '2023-12-04',
            type: 'vaccination',
            name: 'Vaccin Newcastle',
            flock: 'G-2023-05',
            doses: 250,
            veterinarian: 'Dr. Arnaud Tapsoba',
            notes: 'Vaccination de rappel',
            status: 'scheduled',
        },
        {
            id: '2',
            date: '2023-11-28',
            type: 'medication',
            name: 'Antibiotique - Amoxicilline',
            flock: 'G-2023-04',
            doses: 180,
            veterinarian: 'Dr. OUEDRAOGO',
            notes: 'Traitement respiratoire suite à détection de symptômes',
            status: 'completed',
        },
        {
            id: '3',
            date: '2023-11-20',
            type: 'vaccination',
            name: 'Vaccin Bronchite Infectieuse',
            flock: 'G-2023-06',
            doses: 300,
            veterinarian: 'Dr. John DO',
            notes: 'Première vaccination',
            status: 'completed',
        },
        {
            id: '4',
            date: '2023-11-15',
            type: 'prevention',
            name: 'Vermifuge',
            flock: 'G-2023-04',
            doses: 200,
            veterinarian: 'Dr. foo BAR',
            notes: 'Traitement préventif trimestriel',
            status: 'completed',
        },
    ]);

    const [formData, setFormData] = useState({
        date: '',
        type: 'vaccination' as Treatment['type'],
        name: '',
        flock: '',
        doses: '',
        veterinarian: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTreatment: Treatment = {
            id: Date.now().toString(),
            ...formData,
            doses: parseInt(formData.doses),
            status: 'scheduled',
        };
        setTreatments([newTreatment, ...treatments]);
        setShowForm(false);
        setFormData({
            date: '',
            type: 'vaccination',
            name: '',
            flock: '',
            doses: '',
            veterinarian: '',
            notes: '',
        });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'vaccination':
                return 'bg-blue-100 text-blue-700';
            case 'medication':
                return 'bg-red-100 text-red-700';
            case 'prevention':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'vaccination':
                return 'Vaccination';
            case 'medication':
                return 'Médication';
            case 'prevention':
                return 'Prévention';
            default:
                return type;
        }
    };

    const scheduled = treatments.filter((t) => t.status === 'scheduled');
    const completed = treatments.filter((t) => t.status === 'completed');



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Veterinaire" />

            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-gray-900 mb-2">Traitements vétérinaires</h1>
                        <p className="text-gray-600">Gérez les vaccinations et traitements de vos poules</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                        <Plus className="w-5 h-5" />
                        Nouveau traitement
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-2">Traitements programmés</div>
                        <div className="text-2xl text-gray-900">{scheduled.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-2">Réalisés ce mois</div>
                        <div className="text-2xl text-gray-900">{completed.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-2">Prochain traitement</div>
                        <div className="text-sm text-gray-900">Dans 1 jour</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-sm text-gray-600 mb-2">Coût total ce mois</div>
                        <div className="text-2xl text-gray-900">1,245 €</div>
                    </div>
                </div>

                {/* Scheduled Treatments */}
                <div className="mb-8">
                    <h2 className="text-gray-900 mb-4">Traitements programmés</h2>
                    <div className="space-y-4">
                        {scheduled.map((treatment) => (
                            <div key={treatment.id} className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <Syringe className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-gray-900">{treatment.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(treatment.type)}`}>
                                                    {getTypeLabel(treatment.type)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(treatment.date).toLocaleDateString('fr-FR')}
                                                </div>
                                                <div>Génération: {treatment.flock}</div>
                                                <div>Doses: {treatment.doses}</div>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-2">
                                                Vétérinaire: {treatment.veterinarian}
                                            </div>
                                            {treatment.notes && (
                                                <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    {treatment.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                                        Marquer terminé
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Completed Treatments */}
                <div>
                    <h2 className="text-gray-900 mb-4">Historique des traitements</h2>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Date</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Type</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Traitement</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Génération</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Doses</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Vétérinaire</th>
                                        <th className="px-6 py-3 text-left text-sm text-gray-600">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {completed.map((treatment) => (
                                        <tr key={treatment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-700">
                                                {new Date(treatment.date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(treatment.type)}`}>
                                                    {getTypeLabel(treatment.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">{treatment.name}</td>
                                            <td className="px-6 py-4 text-gray-700">{treatment.flock}</td>
                                            <td className="px-6 py-4 text-gray-700">{treatment.doses}</td>
                                            <td className="px-6 py-4 text-gray-700">{treatment.veterinarian}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-green-700">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Terminé
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Add Treatment Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-gray-900 mb-6">Nouveau traitement</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Treatment['type'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="vaccination">Vaccination</option>
                                        <option value="medication">Médication</option>
                                        <option value="prevention">Prévention</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Nom du traitement</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: Vaccin Newcastle"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Génération</label>
                                    <select
                                        value={formData.flock}
                                        onChange={(e) => setFormData({ ...formData, flock: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Sélectionner une génération</option>
                                        <option value="G-2023-04">G-2023-04</option>
                                        <option value="G-2023-05">G-2023-05</option>
                                        <option value="G-2023-06">G-2023-06</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Nombre de doses</label>
                                    <input
                                        type="number"
                                        value={formData.doses}
                                        onChange={(e) => setFormData({ ...formData, doses: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: 250"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Vétérinaire</label>
                                    <input
                                        type="text"
                                        value={formData.veterinarian}
                                        onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Ex: Dr. Martin Dubois"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Notes additionnelles..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                        >
                                        Créer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            
        </AppLayout>
    );
}