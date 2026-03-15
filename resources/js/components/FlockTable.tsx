import { flocksDestroy, flocksEdit, flocksShow, flocksSubmit } from '@/routes';
import { Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    ClipboardList,
    Edit2,
    MapPin,
    Send,
    Trash2,
} from 'lucide-react';

interface Flock {
    id: number;
    name: string;
    building: string;
    arrival_date: string;
    initial_quantity: number;
    current_quantity: number;
    status: string;
    creator: string;
    can_edit: boolean;
    can_delete: boolean;
    can_submit: boolean;
    can_approve: boolean;
    can_reject: boolean;
}

interface Props {
    flocks: Flock[];
    onApproveClick: (flock: Flock) => void;
}

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    pending: 'En attente',
    active: 'Active',
    rejected: 'Rejetée',
};

export default function FlockTable({ flocks, onApproveClick }: Props) {
    const handleSubmit = (id: number) => {
        router.post(flocksSubmit.url(id));
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer ce lot ?')) {
            router.delete(flocksDestroy.url(id));
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">
                                Génération
                            </th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">
                                Bâtiment
                            </th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">
                                Date arrivée
                            </th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">
                                Effectif
                            </th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-sm text-gray-600">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {flocks.map((flock) => (
                            <tr key={flock.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <Link
                                        href={flocksShow.url({
                                            flock: flock.id,
                                        })}
                                        className="text-gray-900 hover:text-amber-600"
                                    >
                                        {flock.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {flock.building}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {new Date(
                                            flock.arrival_date,
                                        ).toLocaleDateString('fr-FR')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-900">
                                        {flock.current_quantity.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        sur{' '}
                                        {flock.initial_quantity.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`rounded-full px-3 py-1 text-sm ${statusColors[flock.status]}`}
                                    >
                                        {statusLabels[flock.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {flock.can_submit && (
                                            <button
                                                onClick={() =>
                                                    handleSubmit(flock.id)
                                                }
                                                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                title="Soumettre pour approbation"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        )}
                                        {flock.can_approve && (
                                            <button
                                                onClick={() =>
                                                    onApproveClick(flock)
                                                }
                                                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-green-50 hover:text-green-600"
                                                title="Approuver/Rejeter"
                                            >
                                                <AlertCircle className="h-4 w-4" />
                                            </button>
                                        )}
                                        {flock.status === 'active' && (
                                            <Link
                                                href={flocksShow.url({
                                                    flock: flock.id,
                                                })}
                                                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                                title="Voir le détail"
                                            >
                                                <ClipboardList className="h-4 w-4" />
                                            </Link>
                                        )}
                                        {flock.can_edit && (
                                            <Link
                                                href={flocksEdit.url(flock.id)}
                                                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                                title="Modifier"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                        )}
                                        {flock.can_delete && (
                                            <button
                                                onClick={() =>
                                                    handleDelete(flock.id)
                                                }
                                                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
