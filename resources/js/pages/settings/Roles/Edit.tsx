import RoleForm from '@/components/Roles/RoleForm';
import SettingsLayout from '@/layouts/settings/layout';
import { rolesIndex, rolesUpdate } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    role: {
        id: number;
        name: string;
        permissions: number[]; // IDs des permissions
    };
    permissions: { id: number; name: string }[];
}

export default function Edit({ role, permissions }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(rolesUpdate.url(role.id), {
            onSuccess: () => router.get(rolesIndex.url()),
        });
    };

    return (
        <SettingsLayout
            breadcrumbs={[
                { title: 'Rôles', href: rolesIndex.url() },
                { title: 'Modifier', href: rolesUpdate.url(role.id) },
            ]}
        >
            <Head title="Modifier rôle" />
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <h1 className="mb-6 text-xl font-semibold text-stone-900">
                        Modifier le rôle {role.name}
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <RoleForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            permissions={permissions}
                        />
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.get(rolesIndex.url())}
                                className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm text-white transition-colors hover:bg-amber-600 disabled:opacity-40"
                            >
                                Mettre à jour
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SettingsLayout>
    );
}
