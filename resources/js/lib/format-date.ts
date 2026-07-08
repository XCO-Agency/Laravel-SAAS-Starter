/**
 * Dependency-free date formatting that honours a user's saved `timezone` and
 * `date_format` preference. Uses the native `Intl.DateTimeFormat` API with the
 * `timeZone` option, so no additional dependency (e.g. `date-fns-tz`) is needed.
 *
 * The five supported `date_format` tokens mirror the whitelist validated by
 * `App\Http\Requests\Settings\ProfileUpdateRequest`. If that whitelist changes,
 * update `DATE_FORMAT_TOKENS` here to match.
 */

export type DateFormatToken = 'Y-m-d' | 'd/m/Y' | 'm/d/Y' | 'Y/m/d' | 'M j, Y';

export const DATE_FORMAT_TOKENS: DateFormatToken[] = [
    'Y-m-d',
    'd/m/Y',
    'm/d/Y',
    'Y/m/d',
    'M j, Y',
];

export type DateInput = string | number | Date | null | undefined;

export interface FormatDateOptions {
    /** IANA timezone name (e.g. `America/New_York`); defaults to `UTC`. */
    timezone?: string | null;
    /** One of the whitelisted `date_format` tokens; defaults to `Y-m-d`. */
    dateFormat?: string | null;
    /** Append a 24-hour `HH:MM` time to the formatted date. */
    withTime?: boolean;
    /** Returned when the input is empty or unparseable; defaults to `''`. */
    fallback?: string;
    /** Preferred locale for month names (e.g. `en-US`, `fr-FR`); defaults to `en-US`. */
    locale?: string | null;
}

const DEFAULT_TIMEZONE = 'UTC';
const DEFAULT_FORMAT: DateFormatToken = 'Y-m-d';

function isSupportedToken(value: unknown): value is DateFormatToken {
    return (
        typeof value === 'string' &&
        (DATE_FORMAT_TOKENS as string[]).includes(value)
    );
}

function toDate(value: DateInput): Date | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

const DEFAULT_LOCALE = 'en-US';

/**
 * Resolve a usable BCP 47 locale, falling back to `en-US` when the preference is
 * empty or a structurally invalid tag (which would otherwise make
 * `Intl.DateTimeFormat` throw), keeping the formatter's no-throw guarantee.
 */
function resolveLocale(locale?: string | null): string {
    if (!locale) {
        return DEFAULT_LOCALE;
    }

    try {
        Intl.DateTimeFormat.supportedLocalesOf(locale);
        return locale;
    } catch {
        return DEFAULT_LOCALE;
    }
}

/**
 * Extract zero-padded year/month/day and a short month name for the given date
 * in the target timezone. Falls back to `UTC` when the timezone is invalid so a
 * bad preference can never make the formatter throw.
 */
function zonedParts(
    date: Date,
    timeZone: string,
    locale?: string | null,
): { year: string; month: string; day: string; monthShort: string } {
    let zone = timeZone;
    const activeLocale = resolveLocale(locale);

    const build = (tz: string) => {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(date);

        const map: Record<string, string> = {};
        for (const part of parts) {
            if (part.type !== 'literal') {
                map[part.type] = part.value;
            }
        }

        const monthShort = new Intl.DateTimeFormat(activeLocale, {
            timeZone: tz,
            month: 'short',
        }).format(date);

        return {
            year: map.year ?? '',
            month: map.month ?? '',
            day: map.day ?? '',
            monthShort,
        };
    };

    try {
        return build(zone);
    } catch {
        zone = DEFAULT_TIMEZONE;
        return build(zone);
    }
}

function zonedTime(date: Date, timeZone: string): string {
    try {
        return new Intl.DateTimeFormat('en-GB', {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date);
    } catch {
        return new Intl.DateTimeFormat('en-GB', {
            timeZone: DEFAULT_TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date);
    }
}

function assemble(
    token: DateFormatToken,
    parts: { year: string; month: string; day: string; monthShort: string },
): string {
    const { year, month, day, monthShort } = parts;

    switch (token) {
        case 'd/m/Y':
            return `${day}/${month}/${year}`;
        case 'm/d/Y':
            return `${month}/${day}/${year}`;
        case 'Y/m/d':
            return `${year}/${month}/${day}`;
        case 'M j, Y':
            return `${monthShort} ${Number(day)}, ${year}`;
        case 'Y-m-d':
        default:
            return `${year}-${month}-${day}`;
    }
}

/**
 * Format a date value according to the supplied timezone/date_format
 * preference. Empty or invalid input returns the `fallback` (default `''`).
 */
export function formatDate(
    value: DateInput,
    options: FormatDateOptions = {},
): string {
    const {
        timezone,
        dateFormat,
        withTime = false,
        fallback = '',
        locale,
    } = options;

    const date = toDate(value);
    if (!date) {
        return fallback;
    }

    const zone = timezone || DEFAULT_TIMEZONE;
    const token = isSupportedToken(dateFormat) ? dateFormat : DEFAULT_FORMAT;

    const formatted = assemble(token, zonedParts(date, zone, locale));

    return withTime ? `${formatted} ${zonedTime(date, zone)}` : formatted;
}
