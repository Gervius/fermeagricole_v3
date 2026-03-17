import UserForm from '@/components/Users/UserForm';
import SettingsLayout from '@/layouts/settings/layout';
import { usersIndex, usersUpdate } from '@/routes';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        roles: number[]; // IDs des rôles
    };
    roles: { id: number; name: string }[];
}

export default function Edit({ user, roles }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(usersUpdate.url(user.id), {
            onSuccess: () => router.get(usersIndex.url()),
        });
    };

    return (
        <SettingsLayout
            breadcrumbs={[
                { title: 'Utilisateurs', href: usersIndex.url() },
                { title: 'Modifier', href: usersUpdate.url(user.id) },
            ]}
        >
            <Head title="Modifier utilisateur" />
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-xl border border-stone-200 bg-white p-6">
                    <h1 className="mb-6 text-xl font-semibold text-stone-900">
                        Modifier {user.name}
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <UserForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            roles={roles}
                            isEditing
                        />
                        <p className="text-xs text-stone-500 italic">
                            Laissez le mot de passe vide pour ne pas le changer.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.get(usersIndex.url())}
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
