<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions pour la gestion des utilisateurs et rôles
        $userPermissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',
        ];

        $rolePermissions = [
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
        ];

        $permissionPermissions = [
            'view permissions',
            'assign permissions',
        ];

        

        $businessPermissions = [
            'view flocks',
            'create flocks',
            'edit flocks',
            'delete flocks',
            'submit flocks',    // pour soumettre à approbation
            'approve flocks',   // pour approuver
            'reject flocks',
            'end flocks',    // pour termine un lot
            'view buildings',
            'create buildings',
            'edit buildings',
            'delete buildings',
            'view daily records',
            'create daily records',
            'approve daily records',
            'reject daily records',
            'view units',
            'create units',
            'edit units',
            'delete units',
            'view ingredients',
            'create ingredients',
            'edit ingredients',
            'delete ingredients',
            'view stock movements',
            'create stock movements',
            'approve stock movements',
            'reject stock movements',
            'view recipes',
            'create recipes',
            'edit recipes',
            'delete recipes',
            'view feed productions',
            'create feed productions',
            'submit feed productions', // soumettre pour approbation
            'approve feed productions',
            'reject feed productions',
            'view treatments',
            'create treatments',
            'edit treatments',
            'delete treatments',
            'complete treatments',
            'view flock sales',
            'create flock sales',
            'edit flock sales',
            'delete flock sales',
            'approve flock sales',
            'reject flock sales',
            'view egg sales',
            'create egg sales',
            'edit egg sales',
            'delete egg sales',
            'approve egg sales',
            'cancel egg sales',
            'view accounting',
            'manage accounts',
        ];


        $secretaryPermissions = [
            'view flocks',
            'create flocks',
            'edit flocks',
            'delete flocks',
            'submit flocks',
            'view daily records',
            'create daily records',
        ];

        $managerPermissions = ['view flocks','edit flocks','submit flocks',    // pour soumettre à approbation
            'approve flocks',   // pour approuver
            'reject flocks',    // pour rejeter
            'view buildings',
            'create buildings',
            'edit buildings',
            'delete buildings',
            'view daily records',
            'approve daily records',
            'reject daily records',
            'end flocks']; // à affiner selon les besoins

        $allPermissions = array_merge($userPermissions, $rolePermissions, $permissionPermissions, $businessPermissions);

        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Création des rôles
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $directorRole = Role::firstOrCreate(['name' => 'Directeur', 'guard_name' => 'web']);
        $managerRole = Role::firstOrCreate(['name' => 'Gestionnaire', 'guard_name' => 'web']);
        $secretaryRole = Role::firstOrCreate(['name' => 'Secretaire', 'guard_name' => 'web']);

        // Attribution des permissions
        // Super Admin : toutes via gates, on ne lui assigne rien explicitement
        // Admin : gestion des utilisateurs, rôles, permissions
        $adminRole->givePermissionTo($userPermissions);
        $adminRole->givePermissionTo($rolePermissions);
        $adminRole->givePermissionTo($permissionPermissions);

        // Directeur : peut voir les utilisateurs et rôles, mais pas créer/modifier ? à définir
        $directorRole->givePermissionTo($businessPermissions);

        // Gestionnaire : permissions métier (à compléter)
        $managerRole->givePermissionTo($managerPermissions);

        // Secretaire : peut-être lecture seule sur certaines parties
        $secretaryRole->givePermissionTo($secretaryPermissions);

        // Création d'utilisateurs par défaut (à adapter)
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            ['name' => 'Super Admin', 'password' => bcrypt('password')]
        );
        $superAdmin->assignRole($superAdminRole);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin User', 'password' => bcrypt('password')]
        );
        $admin->assignRole($adminRole);

        $director = User::firstOrCreate(
            ['email' => 'director@example.com'],
            ['name' => 'Director User', 'password' => bcrypt('password')]
        );
        $director->assignRole($directorRole);

        $manager = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            ['name' => 'Manager User', 'password' => bcrypt('password')]
        );
        $manager->assignRole($managerRole);

        $secretary = User::firstOrCreate(
            ['email' => 'secretary@example.com'],
            ['name' => 'Secretary User', 'password' => bcrypt('password')]
        );
        $secretary->assignRole($secretaryRole);
    }
}
