<?php

namespace App\Enums;

enum TicketPriority: string
{
    case Low = 'low';
    case Normal = 'normal';
    case High = 'high';
    case Urgent = 'urgent';

    /**
     * Relative sort weight for the priority, highest is most urgent.
     */
    public function weight(): int
    {
        return match ($this) {
            self::Urgent => 4,
            self::High => 3,
            self::Normal => 2,
            self::Low => 1,
        };
    }

    /**
     * A portable SQL CASE expression that orders tickets most urgent first.
     *
     * Uses CASE (not MySQL's FIELD()) so it runs on sqlite, MySQL and Postgres.
     */
    public static function sortOrderByRaw(string $column = 'priority'): string
    {
        if (! preg_match('/^[a-zA-Z0-9_.]+$/', $column)) {
            throw new \InvalidArgumentException('Invalid column name for priority sort.');
        }

        $whens = '';
        foreach (self::cases() as $case) {
            $whens .= sprintf("WHEN '%s' THEN %d ", $case->value, $case->weight());
        }

        return sprintf('CASE %s %sELSE 0 END DESC', $column, $whens);
    }
}
