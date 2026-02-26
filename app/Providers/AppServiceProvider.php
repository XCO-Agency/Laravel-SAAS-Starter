<?php

namespace App\Providers;

use App\Listeners\LogWebhookCall;
use App\Models\FeatureFlag;
use App\Models\Workspace;
use App\Policies\WorkspacePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;
use Laravel\Pennant\Feature;
use Spatie\WebhookServer\Events\WebhookCallFailedEvent;
use Spatie\WebhookServer\Events\WebhookCallSucceededEvent;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register pennant features dynamically.
     */
    public static function registerFeatureFlags(): void
    {
        try {
            if (Schema::hasTable('feature_flags')) {
                $flags = Cache::remember('feature_flags_definitions', 3600, fn () => FeatureFlag::all());
                foreach ($flags as $flag) {
                    Feature::define($flag->key, function ($scope) use ($flag) {
                        if ($flag->is_global) {
                            return true;
                        }
                        if ($scope instanceof Workspace) {
                            return in_array($scope->id, $flag->workspace_ids ?? []);
                        }

                        return false;
                    });
                }
            }
        } catch (\Exception $e) {
            // Table might not exist yet during migrations
        }
    }

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\Stripe\StripeClient::class, function ($app) {
            return new \Stripe\StripeClient(config('services.stripe.secret'));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Spatie\Activitylog\Models\Activity::observe(\App\Observers\ActivityLogObserver::class);

        Gate::policy(Workspace::class, WorkspacePolicy::class);

        Event::listen(WebhookCallSucceededEvent::class, [LogWebhookCall::class, 'handleSuccessfulCall']);
        Event::listen(WebhookCallFailedEvent::class, [LogWebhookCall::class, 'handleFailedCall']);

        // Tell Cashier to use Workspace as the billable model instead of User
        Cashier::useCustomerModel(Workspace::class);

        // Rate limiters
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('invitations', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        self::registerFeatureFlags();
    }
}
