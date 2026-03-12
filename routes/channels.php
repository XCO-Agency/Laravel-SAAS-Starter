<?php

use App\Models\Workspace;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('workspace.{id}', function ($user, $id) {
    return $user->belongsToWorkspace(Workspace::find($id));
});
