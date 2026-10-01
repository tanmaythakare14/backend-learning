import { useState } from 'react';
import type { JSX } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { isQuestionAnswered } from '../../utils';
import type { QuizAnswersApiDto, QuizRunnerProps } from '../../@types';
import { ChoiceQuestion } from './ChoiceQuestion';
import { DescriptiveQuestion } from './DescriptiveQuestion';
import { QuizNavigator } from './QuizNavigator';
import { QuizReview } from './QuizReview';

const EMPTY_DRAFT: QuizAnswersApiDto = { choices: {}, texts: {} };

/** One question at a time, then a review step, then a confirm — answers are kept while navigating. */
export function QuizRunner({ questions, isPastDue, onSubmit }: QuizRunnerProps): JSX.Element {
  const total = questions.length;
  const [draft, setDraft] = useState<QuizAnswersApiDto>(EMPTY_DRAFT);
  // 0..total-1 are the questions; `total` is the review step.
  const [step, setStep] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isAnswered = (index: number): boolean => isQuestionAnswered(questions[index], draft);
  const unanswered = questions.filter((_, index) => !isAnswered(index)).length;

  const setChoice = (questionId: string, optionIds: string[]): void =>
    setDraft((previous) => ({
      ...previous,
      choices: { ...previous.choices, [questionId]: optionIds },
    }));

  const setText = (questionId: string, text: string): void =>
    setDraft((previous) => ({ ...previous, texts: { ...previous.texts, [questionId]: text } }));

  // Throws on failure so the confirm dialog can show the message and stay open.
  const handleConfirm = async (): Promise<void> => {
    await onSubmit(draft);
    toast.success('Quiz submitted');
  };

  const question = step < total ? questions[step] : null;

  return (
    <div className="space-y-6">
      <QuizNavigator total={total} current={step} isAnswered={isAnswered} onGoTo={setStep} />

      <div className="border-t border-border pt-6">
        {question === null ? (
          <QuizReview
            questions={questions}
            isAnswered={isAnswered}
            isPastDue={isPastDue}
            isSubmitting={false}
            onGoTo={setStep}
            onSubmitClick={() => setIsConfirmOpen(true)}
          />
        ) : question.type === 'descriptive' ? (
          <DescriptiveQuestion
            key={question.id}
            question={question}
            value={draft.texts[question.id] ?? ''}
            onChange={(text) => setText(question.id, text)}
          />
        ) : (
          <ChoiceQuestion
            key={question.id}
            question={question}
            selected={draft.choices[question.id] ?? []}
            onChange={(optionIds) => setChoice(question.id, optionIds)}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </Button>
        {question !== null && (
          <Button type="button" onClick={() => setStep((current) => current + 1)}>
            {step === total - 1 ? 'Review answers' : 'Next'}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Submit this quiz?"
        description={
          unanswered > 0
            ? `You have ${unanswered} unanswered ${unanswered === 1 ? 'question' : 'questions'}. You get one attempt, so you can't change your answers after submitting.`
            : "You get one attempt, so you can't change your answers after submitting."
        }
        confirmLabel="Submit quiz"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
