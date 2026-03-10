<?php

namespace App\Http\Controllers;

use App\Models\Building;
use Illuminate\Http\Request;


class BuildingController extends Controller
{
    public function __construct()
    {
        //
    }

    public function index()
    {
        $buildings = Building::paginate(10);
        return Inertia::render('Buildings/Index', ['buildings' => $buildings]);
    }

    public function create()
    {
        return Inertia::render('Buildings/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'nullable|integer|min:1',
        ]);

        Building::create($validated);

        return redirect()->route('buildings.index')->with('success', 'Bâtiment créé.');
    }

    public function edit(Building $building)
    {
        return Inertia::render('Buildings/Edit', ['building' => $building]);
    }

    public function update(Request $request, Building $building)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'nullable|integer|min:1',
        ]);

        $building->update($validated);

        return redirect()->route('buildings.index')->with('success', 'Bâtiment mis à jour.');
    }

    public function destroy(Building $building)
    {
        $building->delete();
        return redirect()->route('buildings.index')->with('success', 'Bâtiment supprimé.');
    }
}
