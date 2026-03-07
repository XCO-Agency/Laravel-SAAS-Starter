<?php

namespace App\Services;

use App\Models\AdminNotification;

class AdminNotificationService
{
    /**
     * Create a new admin notification.
     *
     * @param  array<string, mixed>|null  $metadata
     */
    public function create(string $type, string $severity, string $title, string $message, ?array $metadata = null): AdminNotification
    {
        return AdminNotification::create([
            'type' => $type,
            'severity' => $severity,
            'title' => $title,
            'message' => $message,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Notify admins about a webhook delivery failure.
     *
     * @param  array<string, mixed>  $context
     */
    public function webhookFailed(string $url, string $error, array $context = []): AdminNotification
    {
        return $this->create(
            AdminNotification::TYPE_WEBHOOK_FAILURE,
            AdminNotification::SEVERITY_WARNING,
            'Webhook delivery failed',
            "Webhook delivery to {$url} failed: {$error}",
            array_merge(['url' => $url, 'error' => $error], $context),
        );
    }

    /**
     * Notify admins about a subscription cancellation.
     *
     * @param  array<string, mixed>  $context
     */
    public function subscriptionCanceled(string $workspaceName, string $plan, array $context = []): AdminNotification
    {
        return $this->create(
            AdminNotification::TYPE_SUBSCRIPTION_CANCELED,
            AdminNotification::SEVERITY_WARNING,
            'Subscription canceled',
            "{$workspaceName} canceled their {$plan} subscription.",
            array_merge(['workspace' => $workspaceName, 'plan' => $plan], $context),
        );
    }

    /**
     * Notify admins about a past-due subscription.
     *
     * @param  array<string, mixed>  $context
     */
    public function subscriptionPastDue(string $workspaceName, string $plan, array $context = []): AdminNotification
    {
        return $this->create(
            AdminNotification::TYPE_SUBSCRIPTION_PAST_DUE,
            AdminNotification::SEVERITY_CRITICAL,
            'Subscription past due',
            "{$workspaceName}'s {$plan} subscription is past due.",
            array_merge(['workspace' => $workspaceName, 'plan' => $plan], $context),
        );
    }

    /**
     * Notify admins about a system error.
     *
     * @param  array<string, mixed>  $context
     */
    public function systemError(string $title, string $message, array $context = []): AdminNotification
    {
        return $this->create(
            AdminNotification::TYPE_SYSTEM_ERROR,
            AdminNotification::SEVERITY_CRITICAL,
            $title,
            $message,
            $context,
        );
    }

    /**
     * Notify admins about a new user signup.
     *
     * @param  array<string, mixed>  $context
     */
    public function newSignup(string $userName, string $email, array $context = []): AdminNotification
    {
        return $this->create(
            AdminNotification::TYPE_NEW_SIGNUP,
            AdminNotification::SEVERITY_INFO,
            'New user registered',
            "{$userName} ({$email}) signed up.",
            array_merge(['name' => $userName, 'email' => $email], $context),
        );
    }
}
