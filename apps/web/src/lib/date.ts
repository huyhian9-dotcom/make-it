import { format, isToday, isTomorrow, isYesterday, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDatePtBR(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM', { locale: ptBR });
}

export function formatMonth(date: Date): string {
  return format(date, 'MMM', { locale: ptBR });
}

export function formatMonthFull(date: Date): string {
  return format(date, 'MMMM', { locale: ptBR });
}

export function formatYear(date: Date): string {
  return format(date, 'yyyy');
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getDeadlineColor(dueDate: string): string {
  const due = parseISO(dueDate);
  const today = parseISO(format(new Date(), 'yyyy-MM-dd'));
  const diff = differenceInDays(due, today);

  if (diff < 0) return 'bg-red-500 text-white';
  if (diff <= 3) return 'bg-orange-400 text-white';
  return 'bg-green-500 text-white';
}

export { isToday, isTomorrow, isYesterday, parseISO, format };
