export const levelLabels: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  critical: "Критический"
};

export const categoryLabels: Record<string, string> = {
  scope: "Объем работ",
  timeline: "Сроки",
  team: "Команда",
  technical: "Технологии",
  dependency: "Зависимости",
  stakeholder: "Стейкхолдеры",
  quality: "Качество",
  release: "Релиз",
  compliance: "Безопасность и соответствие",
  data: "Данные",
  performance: "Производительность",
  budget: "Бюджет"
};

export const statusLabels: Record<string, string> = {
  draft: "Черновик",
  generating: "Формируется",
  completed: "Готово",
  failed: "Ошибка"
};

export const valueLabels: Record<string, string> = {
  not_defined: "Не описаны",
  partially_defined: "Частично описаны",
  mostly_defined: "В основном описаны",
  fully_defined: "Полностью описаны",
  rarely: "Редко",
  sometimes: "Иногда",
  often: "Часто",
  very_often: "Очень часто",
  no: "Нет",
  partially: "Частично",
  mostly: "В основном",
  yes: "Да",
  flexible: "Гибкий",
  somewhat_flexible: "Скорее гибкий",
  fixed: "Фиксированный",
  immovable: "Нельзя перенести",
  less_than_1_month: "Меньше 1 месяца",
  one_to_three_months: "1-3 месяца",
  three_to_six_months: "3-6 месяцев",
  more_than_six_months: "Больше 6 месяцев",
  none: "Нет",
  small: "Небольшой",
  moderate: "Средний",
  large: "Большой",
  limited: "Ограниченная",
  unknown: "Неизвестно",
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  very_high: "Очень высокий",
  fast: "Быстрая",
  normal: "Обычная",
  slow: "Медленная",
  unpredictable: "Непредсказуемая",
  clear: "Понятная",
  mostly_clear: "В основном понятная",
  unclear: "Непонятная",
  chaotic: "Хаотичная"
};

export function labelFor(value?: string | null) {
  if (!value) return "";
  return valueLabels[value] ?? categoryLabels[value] ?? levelLabels[value] ?? statusLabels[value] ?? value;
}
