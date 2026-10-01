import { useEffect, useRef, useState } from 'react';
import type { JSX, KeyboardEvent } from 'react';
import { useFieldArray, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MAX_OPTIONS, MIN_OPTIONS } from '../../constants';
import { choiceProblem } from '../../utils';
import type { OptionsEditorProps } from '../../@types';
import type { AssignmentBuilderSchemaValues } from './schema';

/**
 * The options of one single/multiple choice question. The radio/checkbox beside each
 * option IS the answer key — the same control the student will see, but marking the
 * correct one(s). Native inputs for the same reason as on the student side.
 */
export function OptionsEditor({ questionIndex, type }: OptionsEditorProps): JSX.Element {
  const { control, setValue } = useFormContext<AssignmentBuilderSchemaValues>();
  // Local subscriptions: watch()/formState on the context would re-render the whole screen.
  const { submitCount } = useFormState({ control });
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const options = useWatch({ control, name: `questions.${questionIndex}.options` }) ?? [];
  const problem = choiceProblem(type, options);
  const isSingle = type === 'single';

  const markCorrect = (optionIndex: number, checked: boolean): void => {
    if (isSingle) {
      // Radio: exactly one answer — choosing one clears the rest.
      options.forEach((_, index) =>
        setValue(`questions.${questionIndex}.options.${index}.isCorrect`, index === optionIndex, {
          shouldDirty: true,
        }),
      );
      return;
    }
    setValue(`questions.${questionIndex}.options.${optionIndex}.isCorrect`, checked, {
      shouldDirty: true,
    });
  };

  const listRef = useRef<HTMLUListElement>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  // Move the cursor into a freshly added option once it has rendered.
  useEffect(() => {
    if (focusIndex === null) return;
    listRef.current?.querySelectorAll<HTMLInputElement>('[data-option-label]')[focusIndex]?.focus();
    setFocusIndex(null);
  }, [focusIndex, fields.length]);

  const addOption = (): void => {
    append({ label: '', isCorrect: false }, { shouldFocus: false });
    setFocusIndex(fields.length);
  };

  /**
   * Enter in an option adds the next one and moves to it — the natural way to type a
   * list — instead of submitting the whole form.
   */
  const handleOptionEnter = (event: KeyboardEvent<HTMLInputElement>, optionIndex: number): void => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (optionIndex === fields.length - 1 && fields.length < MAX_OPTIONS) {
      addOption();
    }
  };

  return (
    <div className="space-y-3">
      <ul ref={listRef} className="space-y-2">
        {fields.map((field, optionIndex) => (
          <li key={field.id} className="flex items-start gap-3">
            <input
              type={isSingle ? 'radio' : 'checkbox'}
              name={`correct-${questionIndex}`}
              checked={options[optionIndex]?.isCorrect ?? false}
              onChange={(event) => markCorrect(optionIndex, event.target.checked)}
              aria-label={`Mark option ${optionIndex + 1} as correct`}
              className="mt-3.5 h-4 w-4 shrink-0 accent-primary"
            />

            <FormField
              control={control}
              name={`questions.${questionIndex}.options.${optionIndex}.label`}
              render={({ field: labelField }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder={`Option ${optionIndex + 1}`}
                      aria-label={`Option ${optionIndex + 1} text`}
                      data-option-label=""
                      className="scroll-mb-28"
                      onKeyDown={(event) => handleOptionEnter(event, optionIndex)}
                      {...labelField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-11 w-9 shrink-0 px-0 text-muted-foreground"
              disabled={fields.length <= MIN_OPTIONS}
              onClick={() => remove(optionIndex)}
              aria-label={`Remove option ${optionIndex + 1}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 pl-7">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={fields.length >= MAX_OPTIONS}
          onClick={addOption}
        >
          <Plus className="h-4 w-4" />
          Add option
        </Button>

        <p
          className={cn(
            'text-xs text-muted-foreground',
            // Calm until the admin tries to publish, then it says what is wrong.
            problem && submitCount > 0 && 'text-destructive',
          )}
        >
          {problem ??
            (isSingle
              ? 'The selected option is the correct answer.'
              : 'Ticked options are the correct answers.')}
        </p>
      </div>
    </div>
  );
}
