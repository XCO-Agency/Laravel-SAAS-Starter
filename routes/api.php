<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Workspace API v1 (authenticated via workspace API keys)
|--------------------------------------------------------------------------
|
| These routes are authenticated using the wsk_ workspace API keys
| generated in the workspace settings. Each route requires the
| api-key middleware with the appropriate scope.
|
*/
Route::prefix('v1')->middleware('api-key:read')->group(function () {
    Route::get('/workspace', function (Request $request) {
        $workspace = $request->attributes->get('workspace');

        return response()->json([
            'id' => $workspace->id,
            'name' => $workspace->name,
            'slug' => $workspace->slug,
            'plan' => $workspace->plan_name,
            'created_at' => $workspace->created_at->toIso8601String(),
        ]);
    });

    Route::get('/members', function (Request $request) {
        $workspace = $request->attributes->get('workspace');

        $members = $workspace->users()->get()->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->pivot->role,
            'joined_at' => $user->pivot->created_at?->toIso8601String(),
        ]);

        return response()->json(['members' => $members]);
    });
});
