import { useToasts } from '@/components/ToastProvider';
import SettingsLayout from '@/layouts/settings/layout';
import { usersCreate, usersDestroy, usersEdit, usersIndex } from '@/routes';
import { User, UsersPageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Edit2,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UsersIndex({
    users,
    roles,
    filters,
    flash,
}: UsersPageProps) {
    const { addToast } = useToasts();
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        if (flash?.success)
            addToast({ message: flash.success, type: 'success' });
        if (flash?.error) addToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const applySearch = () => {
        router.get(
            usersIndex.url(),
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    const resetSearch = () => {
        setSearch('');
        router.get(usersIndex.url(), {}, { replace: true });
    };

    const handleDelete = (user: User) => {
        if (!confirm(`Supprimer l'utilisateur "${user.name}" ?`)) return;
        router.delete(usersDestroy.url(user.id));
    };

    return (
        <SettingsLayout
            breadcrumbs={[{ title: 'Utilisateurs', href: usersIndex.url() }]}
        >
            <Head title="Utilisateurs" />
            <div className="rounded-xl bg-white">
                <div className="border-b border-stone-200 px-8 py-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                                Utilisateurs
                            </h1>
                            <p className="mt-0.5 text-sm text-stone-500">
                                {users.total} utilisateur
                                {users.total !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={() => router.get(usersCreate.url())}
                            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvel utilisateur
                        </button>
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
                                    placeholder="Nom ou email..."
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
                                            Email
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Rôles
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Créé le
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-12 text-center text-sm text-stone-400"
                                            >
                                                Aucun utilisateur trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="transition-colors hover:bg-stone-50"
                                            >
                                                <td className="px-5 py-4 font-medium text-stone-900">
                                                    {user.name}
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {user.email}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map(
                                                            (role) => (
                                                                <span
                                                                    key={role}
                                                                    className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700"
                                                                >
                                                                    {role}
                                                                </span>
                                                            ),
                                                        )}
                                                        {user.roles.length ===
                                                            0 && (
                                                            <span className="text-xs text-stone-400">
                                                                Aucun rôle
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-stone-600">
                                                    {user.created_at}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                router.get(
                                                                    usersEdit.url(
                                                                        user.id,
                                                                    ),
                                                                )
                                                            }
                                                            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    user,
                                                                )
                                                            }
                                                            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
                                <span>
                                    Page {users.current_page} sur{' '}
                                    {users.last_page} — {users.total} résultats
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={users.current_page === 1}
                                        onClick={() =>
                                            router.get(usersIndex.url(), {
                                                ...filters,
                                                page: users.current_page - 1,
                                            })
                                        }
                                        className="rounded p-1.5 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        disabled={
                                            users.current_page ===
                                            users.last_page
                                        }
                                        onClick={() =>
                                            router.get(usersIndex.url(), {
                                                ...filters,
                                                page: users.current_page + 1,
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
        </SettingsLayout>
    );
}
