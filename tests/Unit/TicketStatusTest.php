<?php

use App\Enums\TicketStatus;

it('has the four expected cases', function () {
    expect(TicketStatus::cases())->toBe([
        TicketStatus::Open,
        TicketStatus::InProgress,
        TicketStatus::Resolved,
        TicketStatus::Closed,
    ]);
});

it('resolves a case from its backing value', function () {
    expect(TicketStatus::from('in_progress'))->toBe(TicketStatus::InProgress);
});

it('returns null when trying an unknown value', function () {
    expect(TicketStatus::tryFrom('bogus'))->toBeNull();
});
