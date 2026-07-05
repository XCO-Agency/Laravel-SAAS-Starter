import {
    formatDate as formatDateBase,
    type DateInput,
    type FormatDateOptions,
} from '@/lib/format-date';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

type BoundOptions = Omit<FormatDateOptions, 'timezone' | 'dateFormat'>;

/**
 * Date formatting hook that reads the authenticated user's `timezone` and
 * `date_format` from shared Inertia props, so components can format dates in the
 * user's preference without threading props. Mirrors `useTranslations`.
 */
export function useDateFormatter() {
    const { auth } = usePage<SharedData>().props;
    const timezone = auth?.user?.timezone;
    const dateFormat = auth?.user?.date_format;

    const formatDate = useCallback(
        (value: DateInput, options: BoundOptions = {}) =>
            formatDateBase(value, { timezone, dateFormat, ...options }),
        [timezone, dateFormat],
    );

    const formatDateTime = useCallback(
        (value: DateInput, options: BoundOptions = {}) =>
            formatDateBase(value, {
                timezone,
                dateFormat,
                withTime: true,
                ...options,
            }),
        [timezone, dateFormat],
    );

    return { formatDate, formatDateTime };
}
