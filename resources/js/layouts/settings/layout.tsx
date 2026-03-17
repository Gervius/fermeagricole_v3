import AppLayout from '@/layouts/app-layout';
import { cn, isSameUrl } from '@/lib/utils';
import {
    accountsIndex,
    buildingsIndex,
    ingredientsIndex,
    unitsIndex,
    usersIndex,
} from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Cookie,
    Lock,
    Palette,
    Settings as SettingsIcon,
    Shield,
    ShieldCheck,
    User,
    Users,
    Weight,
} from 'lucide-react';
import React from 'react';

interface NavSection {
    title: string;
    items: {
        title: string;
        href: string;
        icon: any;
    }[];
}

const navSections: NavSection[] = [
    {
        title: 'Infrastructure',
        items: [
            { title: 'Bâtiments', href: buildingsIndex(), icon: Building2 },
        ],
    },
    {
        title: 'Référentiels',
        items: [
            { title: 'Unités de mesure', href: unitsIndex(), icon: Weight },
            {
                title: "Catalogue d'ingrédients",
                href: ingredientsIndex(),
                icon: Cookie,
            },
        ],
    },
    {
        title: 'Finance',
        items: [
            { title: 'Plan comptable', href: accountsIndex(), icon: BookOpen },
        ],
    },
    {
        title: 'Sécurité & Accès',
        items: [
            { title: 'Utilisateurs', href: usersIndex(), icon: Users },
            {
                title: 'Rôles & Permissions',
                href: '/settings/roles',
                icon: ShieldCheck,
            },
        ],
    },
    {
        title: 'Mon Compte',
        items: [
            { title: 'Profil', href: edit(), icon: User },
            { title: 'Mot de passe', href: editPassword(), icon: Lock },
            { title: 'Double Facteur', href: show(), icon: Shield },
            { title: 'Apparence', href: editAppearance(), icon: Palette },
        ],
    },
];

export default function SettingsLayout({
    children,
    breadcrumbs = [],
}: {
    children: React.ReactNode;
    breadcrumbs?: any[];
}) {
    if (typeof window === 'undefined') return null;

    const currentPath = window.location.pathname;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Paramètres', href: '/settings' },
                ...breadcrumbs,
            ]}
        >
            <div className="min-h-screen bg-stone-50 pb-12 font-sans">
                <div className="mb-8 border-b border-stone-200 bg-white px-8 py-6">
                    <div className="mx-auto flex max-w-7xl items-center gap-3">
                        <SettingsIcon className="h-7 w-7 text-stone-400" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                                Paramètres du système
                            </h1>
                            <p className="mt-1 text-sm text-stone-500">
                                Gérez l'infrastructure, les référentiels, la
                                finance et la sécurité.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-8">
                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* Sidebar Navigation */}
                        <aside className="w-full shrink-0 lg:w-64">
                            <nav className="space-y-8">
                                {navSections.map((section, idx) => (
                                    <div key={idx}>
                                        <h3 className="mb-3 px-3 text-xs font-semibold tracking-wider text-stone-400 uppercase">
                                            {section.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {section.items.map(
                                                (item, itemIdx) => {
                                                    const isActive = isSameUrl(
                                                        currentPath,
                                                        item.href,
                                                    );
                                                    const Icon = item.icon;
                                                    return (
                                                        <Link
                                                            key={`${item.href}-${itemIdx}`}
                                                            href={item.href}
                                                            className={cn(
                                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                                                isActive
                                                                    ? 'bg-amber-100 text-amber-900'
                                                                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                                                            )}
                                                        >
                                                            <Icon
                                                                className={cn(
                                                                    'h-4 w-4',
                                                                    isActive
                                                                        ? 'text-amber-700'
                                                                        : 'text-stone-400',
                                                                )}
                                                            />
                                                            {item.title}
                                                        </Link>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </nav>
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
