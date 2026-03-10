import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
    dashboard, 
    generation,
    inventaire,
    comptabilite,
    veterinaire,
    treatmentsIndex,
    parametrages,
    vente, 
    eggSalesIndex,
    ingredientsIndex,
    recipesIndex,
    stockMovementsIndex
} from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid, 
    Egg, 
    Stethoscope,  
    Calculator, Package, 
    ShoppingCart, 
    Settings,
    Bird,
    Wheat} from 'lucide-react';
import AppLogo from './app-logo';
import ingredients from '@/routes/ingredients';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Generation',
        href: generation(),
        icon: Bird,
    },
    {
        title: 'Ventes Oeufs',
        href: eggSalesIndex(),
        icon: Egg,
    },
    {
        title: 'Matiere Premieres',
        href: ingredientsIndex(),
        icon: Wheat,
    },
    {
        title: 'Recette Aliments',
        href: recipesIndex(),
        icon: Package,
    },
    
    {
        title: 'Comptabilité',
        href: comptabilite(),
        icon: Calculator,
    },
    {
        title: 'Veterinaire',
        href: treatmentsIndex(),
        icon: Stethoscope,
    },
    {
        title: 'Mvts Stock Aliments',
        href: stockMovementsIndex(),
        icon: ShoppingCart,
    },
    {
        title: 'Parametrages',
        href: parametrages(),
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                            
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
