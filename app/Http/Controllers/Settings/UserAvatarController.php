<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserAvatarController extends Controller
{
    /**
     * Update the user's avatar.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        $oldAvatar = $user->getRawOriginal('avatar_url');

        if ($oldAvatar && ! str_starts_with($oldAvatar, 'http')) {
            Storage::disk('public')->delete($oldAvatar);
        }

        $path = $request->file('image')->store('avatars', 'public');
        $user->update(['avatar_url' => $path]);

        return response()->json([
            'message' => 'Avatar updated successfully.',
            'avatar_url' => $user->avatar_url,
        ]);
    }

    /**
     * Remove the user's avatar.
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();
        $oldAvatar = $user->getRawOriginal('avatar_url');

        if ($oldAvatar && ! str_starts_with($oldAvatar, 'http')) {
            Storage::disk('public')->delete($oldAvatar);
        }

        $user->update(['avatar_url' => null]);

        return response()->json([
            'message' => 'Avatar removed successfully.',
        ]);
    }
}
