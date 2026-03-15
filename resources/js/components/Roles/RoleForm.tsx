interface RoleFormData {
    name: string;
    permissions: number[]; // IDs des permissions sélectionnées
}

interface Props {
    data: RoleFormData;
    setData: (key: keyof RoleFormData, value: any) => void;
    errors: Record<string, string>;
    permissions: { id: number; name: string }[];
}

export default function RoleForm({
    data,
    setData,
    errors,
    permissions,
}: Props) {
    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Nom du rôle *
                </label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ex: Gestionnaire"
                    required
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600">
                    Permissions
                </label>
                <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-stone-200 p-3">
                    {permissions.map((perm) => (
                        <label
                            key={perm.id}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="checkbox"
                                checked={data.permissions.includes(perm.id)}
                                onChange={(e) => {
                                    const newPerms = e.target.checked
                                        ? [...data.permissions, perm.id]
                                        : data.permissions.filter(
                                              (id) => id !== perm.id,
                                          );
                                    setData('permissions', newPerms);
                                }}
                                className="rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                            />
                            <span className="text-sm text-stone-700">
                                {perm.name}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.permissions && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.permissions}
                    </p>
                )}
            </div>
        </div>
    );
}
