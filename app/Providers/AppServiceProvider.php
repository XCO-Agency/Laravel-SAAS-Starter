<?php

namespace App\Providers;

use App\Models\Workspace;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Tell Cashier to use Workspace as the billable model instead of User
        Cashier::useCustomerModel(Workspace::class);
    }
}
