import { AlertCircle, Calendar } from 'lucide-react';

interface DailyRecord {
    id: number;
    date: string;
    losses: number;
    eggs: number;
    notes: string;
    status: string;
    created_by: string;
    approved_by: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    can_approve: boolean;
    can_reject: boolean;
}

interface Props {
    records: DailyRecord[];
    onApproveClick: (record: DailyRecord) => void;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
};

export default function DailyRecordsTable({ records, onApproveClick }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm text-gray-600">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm text-gray-600">
                            Pertes
                        </th>
                        <th className="px-6 py-3 text-left text-sm text-gray-600">
                            Œufs
                        </th>
                        <th className="px-6 py-3 text-left text-sm text-gray-600">
                            Notes
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
                    {records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {new Date(record.date).toLocaleDateString(
                                        'fr-FR',
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                                {record.losses}
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                                {record.eggs.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                                {record.notes || '-'}
                                {record.rejection_reason && (
                                    <div className="mt-1 text-sm text-red-600">
                                        Rejet: {record.rejection_reason}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className={`rounded-full px-3 py-1 text-sm ${statusColors[record.status]}`}
                                >
                                    {statusLabels[record.status]}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {record.can_approve && (
                                    <button
                                        onClick={() => onApproveClick(record)}
                                        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-green-50 hover:text-green-600"
                                        title="Approuver/Rejeter"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
