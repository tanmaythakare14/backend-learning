import { AlignLeft, CircleDot, Minus, SquareCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { QuizQuestionType } from '../../@types';

/** One icon per question type, shared by the type dropdown, quick-add bar and outline. */
export const QUESTION_TYPE_ICONS: Record<QuizQuestionType, LucideIcon> = {
  short: Minus,
  descriptive: AlignLeft,
  single: CircleDot,
  multiple: SquareCheck,
};
