<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganisationController extends Controller
{
    public function current(Request $request): JsonResponse
    {
        $organisation = $request->user()
                                ->organisations()
                                ->first();

        return response()->json([
                                    'organisation' => $organisation,
                                ]);
    }
}
