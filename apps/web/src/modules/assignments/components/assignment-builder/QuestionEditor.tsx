import type { JSX } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MIN_OPTIONS, QUESTION_TYPE_OPTIONS } from '../../constants';
import { emptyQuestion, isChoiceType } from '../../utils';
import type { QuestionEditorProps, QuizQuestionType } from '../../@types';
import type { AssignmentBuilderSchemaValues } from './schema';
import { OptionsEditor } from './OptionsEditor';
import { QUESTION_TYPE_ICONS } from './questionTypeIcons';

const TYPE_LABELS = Object.fromEntries(
  QUESTION_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<QuizQuestionType, string>;

const ICON_BUTTON = 'h-9 w-9 px-0 text-muted-foreground hover:text-primary';

export function QuestionEditor({
  index,
  total,
  onDuplicate,
  onMove,
  onRemove,
}: QuestionEditorProps): JSX.Element {
  const { control, getValues, setValue } = useFormContext<AssignmentBuilderSchemaValues>();
  // useWatch subscribes this card alone; watch() would re-render the whole screen.
  const type = useWatch({ control, name: `questions.${index}.type` });

  /**
   * Switching type keeps what still makes sense: the prompt always, and option text
   * between the two choice types. Single choice can only hold one correct answer, so
   * moving to it keeps just the first one marked.
   */
  const changeType = (next: QuizQuestionType): void => {
    const current = getValues(`questions.${index}`);
    if (next === current.type) return;

    if (isChoiceType(next)) {
      const base =
        current.options.length >= MIN_OPTIONS ? current.options : emptyQuestion(next).options;
      const firstCorrect = base.findIndex((option) => option.isCorrect);
      const options =
        next === 'single'
          ? base.map((option, optionIndex) => ({
              ...option,
              isCorrect: optionIndex === firstCorrect,
            }))
          : base;
      setValue(`questions.${index}.options`, options, { shouldDirty: true });
    } else {
      setValue(`questions.${index}.options`, [], { shouldDirty: true });
    }
    setValue(`questions.${index}.type`, next, { shouldDirty: true });
  };

  return (
    <section
      id={`question-${index}`}
      aria-label={`Question ${index + 1}`}
      className={cn(
        'space-y-5 rounded-xl border border-l-4 border-border border-l-border bg-card p-5 transition-all',
        // The card being edited stands out, like the active card in a form builder.
        'hover:border-primary/30 hover:border-l-primary/40',
        'focus-within:border-primary/30 focus-within:border-l-primary focus-within:shadow-glow-sm',
      )}
    >
      <div className="flex flex-wrap items-start gap-3 md:flex-nowrap">
        <span
          aria-hidden="true"
          className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-primary"
        >
          {index + 1}
        </span>

        <FormField
          control={control}
          name={`questions.${index}.prompt`}
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1 basis-full md:basis-0">
              <FormLabel className="sr-only">Question {index + 1}</FormLabel>
              <FormControl>
                <Input placeholder="Write your question" className="scroll-mb-28" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`questions.${index}.type`}
          render={({ field }) => {
            const Icon = QUESTION_TYPE_ICONS[field.value];
            return (
              <FormItem className="w-full shrink-0 md:w-56">
                <FormLabel className="sr-only">Question {index + 1} type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => changeType(value as QuizQuestionType)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <span className="flex items-center gap-2.5 whitespace-nowrap">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {TYPE_LABELS[field.value]}
                      </span>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {QUESTION_TYPE_OPTIONS.map((option) => {
                      const OptionIcon = QUESTION_TYPE_ICONS[option.value];
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2.5 whitespace-nowrap">
                            <OptionIcon className="h-4 w-4 text-muted-foreground" />
                            {option.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormItem>
            );
          }}
        />
      </div>

      <div className="md:pl-10">
        {isChoiceType(type) ? (
          <OptionsEditor questionIndex={index} type={type} />
        ) : (
          <div className="space-y-2">
            <div
              className={cn(
                'border-b border-dashed border-border text-sm text-muted-foreground',
                type === 'descriptive' ? 'h-20' : 'pb-2',
              )}
            >
              {type === 'descriptive' ? 'Long answer text' : 'Short answer text'}
            </div>
            <p className="text-xs text-muted-foreground">
              Students type their own answer. You mark written answers by hand.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={ICON_BUTTON}
          onClick={onDuplicate}
          aria-label={`Duplicate question ${index + 1}`}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={ICON_BUTTON}
          disabled={index === 0}
          onClick={() => onMove('up')}
          aria-label={`Move question ${index + 1} up`}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={ICON_BUTTON}
          disabled={index === total - 1}
          onClick={() => onMove('down')}
          aria-label={`Move question ${index + 1} down`}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0 text-destructive hover:bg-destructive/5 hover:text-destructive"
          onClick={onRemove}
          aria-label={`Delete question ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
