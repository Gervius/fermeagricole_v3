import { useToasts } from '@/components/ToastProvider';
import AppLayout from '@/layouts/app-layout';
import { permissionsIndex } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PermissionsIndex({
    permissions,
    filters,
    flash,
}: PermissionsPageProps) {
    const { addToast } = useToasts();
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const applySearch = () => {
        router.get(
            permissionsIndex.url(),
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    const resetSearch = () => {
        setSearch('');
        router.get(permissionsIndex.url(), {}, { replace: true });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Permissions', href: permissionsIndex.url() },
            ]}
        >
            <Head title="Permissions" />
            <div className="min-h-screen bg-stone-50 font-sans">
                <div className="border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto max-w-7xl">
                        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                            Permissions
                        </h1>
                        <p className="mt-0.5 text-sm text-stone-500">
                            {permissions.total} permission
                            {permissions.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
                    {/* Recherche */}
                    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
                        <div className="min-w-[250px] flex-1">
                            <label className="mb-1.5 block text-xs font-medium text-stone-500">
                                Recherche
                            </label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && applySearch()
                                    }
                                    placeholder="Nom de la permission..."
                                    className="w-full rounded-lg border border-stone-200 py-2 pr-4 pl-9 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={applySearch}
                                className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white transition-colors hover:bg-stone-800"
                            >
                                Filtrer
                            </button>
                            <button
                                onClick={resetSearch}
                                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* Tableau */}
                    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Nom
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Guard
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Créé le
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {permissions.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-5 py-12 text-center text-sm text-stone-400"
                                            >
                                                Aucune permission trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        permissions.data.map((perm) => (
                                            <tr
                                                key={perm.id}
                                                className="transition-colors hover:bg-stone-50"
                                            >
                                                <td className="px-5 py-4 font-medium text-stone-900">
                                                    {perm.name}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {perm.guard_name}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {perm.created_at}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {permissions.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
                                <span>
                                    Page {permissions.current_page} sur{' '}
                                    {permissions.last_page} —{' '}
                                    {permissions.total} résultats
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={
                                            permissions.current_page === 1
                                        }
                                        onClick={() =>
                                            router.get(permissionsIndex.url(), {
                                                ...filters,
                                                page:
                                                    permissions.current_page -
                                                    1,
                                            })
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        disabled={
                                            permissions.current_page ===
                                            permissions.last_page
                                        }
                                        onClick={() =>
                                            router.get(permissionsIndex.url(), {
                                                ...filters,
                                                page:
                                                    permissions.current_page +
                                                    1,
                                            })
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
