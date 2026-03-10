<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            ['code' => '512', 'name' => 'Banque', 'type' => 'asset'],
            ['code' => '411', 'name' => 'Clients', 'type' => 'asset'],
            ['code' => '701', 'name' => 'Ventes d\'œufs', 'type' => 'revenue'],
            ['code' => '601', 'name' => 'Achats d\'aliments', 'type' => 'expense'],
            ['code' => '602', 'name' => 'Soins vétérinaires', 'type' => 'expense'],
            ['code' => '603', 'name' => 'Autres charges', 'type' => 'expense'],
            ['code' => '4457', 'name' => 'TVA collectée', 'type' => 'liability'],
            ['code' => '4456', 'name' => 'TVA déductible', 'type' => 'asset'],
            ['code' => '604', 'name' => 'Achats de poules', 'type' => 'expense'],
        ];

        foreach ($accounts as $acc) {
            Account::firstOrCreate(
                ['code' => $acc['code']],
                $acc
            );
        }
    }
}
