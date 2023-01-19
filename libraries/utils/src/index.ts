import { DateTime } from 'luxon';

export const getCurrentDate = (): string => DateTime.now().toISO();
