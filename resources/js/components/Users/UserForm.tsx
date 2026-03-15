interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: number[]; // IDs des rôles sélectionnés
}

interface Props {
    data: UserFormData;
    setData: (key: keyof UserFormData, value: any) => void;
    errors: Record<string, string>;
    roles: { id: number; name: string }[];
    isEditing?: boolean;
}

export default function UserForm({
    data,
    setData,
    errors,
    roles,
    isEditing,
}: Props) {
    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Nom *
                </label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Jean Dupont"
                    required
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Email *
                </label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="jean@exemple.com"
                    required
                />
                {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
            </div>

            {!isEditing && (
                <>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-stone-600">
                            Mot de passe *
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            placeholder="••••••••"
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-stone-600">
                            Confirmer le mot de passe *
                        </label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </>
            )}

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Rôles
                </label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-stone-200 p-3">
                    {roles.map((role) => (
                        <label
                            key={role.id}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="checkbox"
                                checked={data.roles.includes(role.id)}
                                onChange={(e) => {
                                    const newRoles = e.target.checked
                                        ? [...data.roles, role.id]
                                        : data.roles.filter(
                                              (id) => id !== role.id,
                                          );
                                    setData('roles', newRoles);
                                }}
                                className="rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                            />
                            <span className="text-sm text-stone-700">
                                {role.name}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.roles && (
                    <p className="mt-1 text-xs text-red-500">{errors.roles}</p>
                )}
            </div>
        </div>
    );
}
