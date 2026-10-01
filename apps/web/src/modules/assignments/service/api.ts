import { ApiError } from '@/utils/apiError';
import type {
  AssignmentApiDto,
  QuizAnswersApiDto,
  QuizAttemptApiDto,
  QuizQuestionApiDto,
  SubmitAssignmentPayload,
  SubmitQuizPayload,
} from '../@types';
import { isChoiceCorrect, validateQuizShape } from '../utils';

/*
 * MOCK:API — there is no assignments endpoint yet. These functions are the only
 * place that knows that: their signatures are what a real API would expose, so
 * wiring the backend later means replacing the bodies with fetch calls (see the
 * other modules' service/api.ts) and nothing else.
 *
 * Data lives in memory and resets on reload. Dates are anchored to "now" so the
 * To do / Overdue / Submitted tabs stay populated whenever the app is opened.
 *
 * The quiz ANSWER_KEY below is deliberately private to this file. A real server
 * would never send correct answers to the browser while a quiz is open, and the
 * mock behaves the same way: the UI only ever gets a score back, and the correct
 * answers only once the due date has passed and the student has submitted.
 */

const MOCK_LATENCY_MS = 350;

const HOUR_MS = 60 * 60 * 1000;
const fromNow = (hours: number): string => new Date(Date.now() + hours * HOUR_MS).toISOString();

// ---------------------------------------------------------------------------
// Quiz authoring helpers
// ---------------------------------------------------------------------------

/** question id → correct option ids, per quiz. Never leaves this file. */
const ANSWER_KEY: Record<string, Record<string, string[]>> = {};

const LETTERS = ['a', 'b', 'c', 'd', 'e'];

interface SeedQuestion {
  question: QuizQuestionApiDto;
  correct: string[];
}

function choice(
  id: string,
  type: 'single' | 'multiple',
  prompt: string,
  labels: string[],
  correctIndexes: number[],
): SeedQuestion {
  const options = labels.map((label, index) => ({ id: `${id}-${LETTERS[index]}`, label }));
  return {
    question: { id, type, prompt, options },
    correct: correctIndexes.map((index) => options[index].id),
  };
}

function descriptive(id: string, prompt: string): SeedQuestion {
  return { question: { id, type: 'descriptive', prompt, options: [] }, correct: [] };
}

function makeQuiz(
  id: string,
  title: string,
  courseName: string,
  instructions: string,
  dueAt: string,
  seeds: SeedQuestion[],
): AssignmentApiDto {
  const questions = seeds.map((seed) => seed.question);
  const problems = validateQuizShape(questions);
  if (problems.length > 0) {
    // Fail loudly at load time — a malformed quiz is a bug in the data, not a runtime condition.
    throw new Error(`Invalid quiz "${title}": ${problems.join(' ')}`);
  }

  ANSWER_KEY[id] = Object.fromEntries(
    seeds
      .filter((seed) => seed.question.type !== 'descriptive')
      .map((s) => [s.question.id, s.correct]),
  );

  return {
    id,
    kind: 'quiz',
    title,
    courseName,
    instructions,
    dueAt,
    submission: null,
    questions,
    quizAttempt: null,
  };
}

function scoreChoices(
  assignmentId: string,
  questions: QuizQuestionApiDto[],
  choices: Record<string, string[]>,
): { correct: number; total: number } {
  const key = ANSWER_KEY[assignmentId] ?? {};
  const choiceQuestions = questions.filter((q) => q.type !== 'descriptive');
  const correct = choiceQuestions.filter((q) =>
    isChoiceCorrect(choices[q.id] ?? [], key[q.id] ?? []),
  ).length;
  return { correct, total: choiceQuestions.length };
}

function buildAttempt(
  assignment: AssignmentApiDto,
  answers: QuizAnswersApiDto,
  submittedAt: number,
  existingId?: string,
): QuizAttemptApiDto {
  return {
    id: existingId ?? `att-${assignment.id}`,
    answers,
    submittedAt: new Date(submittedAt).toISOString(),
    isLate: submittedAt > new Date(assignment.dueAt).getTime(),
    choiceScore: scoreChoices(assignment.id, assignment.questions, answers.choices),
    reviewStatus: 'pending',
    correctAnswers: null,
  };
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const restQuiz = makeQuiz(
  'asg-007',
  'Quiz: REST and HTTP fundamentals',
  'Backend Development',
  'Eight questions on HTTP and REST: four single-answer, three multiple-answer, and one written answer at the end.\n\nYou get one attempt. Multiple-answer questions are marked all-or-nothing, so pick every correct option.',
  fromNow(30),
  [
    choice(
      'q1',
      'single',
      'Which HTTP method is idempotent and used to fully replace a resource?',
      ['POST', 'PUT', 'PATCH', 'CONNECT'],
      [1],
    ),
    choice(
      'q2',
      'single',
      'Which status code means a resource was created?',
      ['200', '201', '204', '301'],
      [1],
    ),
    choice(
      'q3',
      'single',
      'Which status code tells the client it is not authenticated?',
      ['401', '403', '404', '409'],
      [0],
    ),
    choice(
      'q4',
      'single',
      'Where should a bearer token normally be sent?',
      [
        'In the query string',
        'In the Authorization header',
        'In the response body',
        'In the URL fragment',
      ],
      [1],
    ),
    choice(
      'q5',
      'multiple',
      'Which HTTP methods are "safe" — they should not change server state?',
      ['GET', 'HEAD', 'DELETE', 'POST'],
      [0, 1],
    ),
    choice(
      'q6',
      'multiple',
      'Which situations justify a 400 Bad Request?',
      [
        'Malformed JSON body',
        'A required field is missing',
        'The database is unreachable',
        'The requested id does not exist',
      ],
      [0, 1],
    ),
    choice(
      'q7',
      'multiple',
      'Which headers help with caching?',
      ['Cache-Control', 'ETag', 'Content-Length', 'Authorization'],
      [0, 1],
    ),
    descriptive(
      'q8',
      'Explain the difference between authentication and authorization, and give one REST API example of each.',
    ),
  ],
);

const sqlQuiz = makeQuiz(
  'asg-008',
  'Quiz: SQL joins and indexes',
  'Database Management Systems',
  'Seven questions on joins, grouping and indexes: four single-answer, two multiple-answer, and one written answer at the end.\n\nYou get one attempt.',
  fromNow(24 * 6),
  [
    choice(
      'q1',
      'single',
      'Which join returns only the rows that match in both tables?',
      ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'],
      [0],
    ),
    choice(
      'q2',
      'single',
      'Which clause filters rows after GROUP BY has run?',
      ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
      [1],
    ),
    choice(
      'q3',
      'single',
      'What does a PRIMARY KEY guarantee?',
      [
        'Unique and not null',
        'Unique but may be null',
        'Not null but may repeat',
        'Only that the column is indexed',
      ],
      [0],
    ),
    choice(
      'q4',
      'single',
      'Which join keeps every row from the left table?',
      ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'NATURAL JOIN'],
      [1],
    ),
    choice(
      'q5',
      'multiple',
      'Which statements about indexes are true?',
      [
        'They speed up reads on the indexed column',
        'They can slow down writes',
        'They improve every possible query',
        'They take no extra storage',
      ],
      [0, 1],
    ),
    choice(
      'q6',
      'multiple',
      'Which of these are aggregate functions?',
      ['COUNT', 'AVG', 'UPPER', 'ROUND'],
      [0, 1],
    ),
    descriptive(
      'q7',
      'Describe when you would add an index to a column, and one situation where adding one would not help.',
    ),
  ],
);

const bigOQuiz = makeQuiz(
  'asg-009',
  'Quiz: Big-O and sorting',
  'Data Structures & Algorithms',
  'Seven questions on complexity and sorting: four single-answer, two multiple-answer, and one written answer at the end.\n\nYou get one attempt.',
  fromNow(-72),
  [
    choice(
      'q1',
      'single',
      'What is the time complexity of binary search on a sorted array?',
      ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      [1],
    ),
    choice(
      'q2',
      'single',
      'What is the worst-case time complexity of quicksort?',
      ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
      [1],
    ),
    choice(
      'q3',
      'single',
      'Which of these sorting algorithms is stable?',
      ['Merge sort', 'Heap sort', 'Selection sort', 'Quickselect'],
      [0],
    ),
    choice(
      'q4',
      'single',
      'What is the space complexity of merge sort?',
      ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      [2],
    ),
    choice(
      'q5',
      'multiple',
      'Which of these run in O(n log n) on average?',
      ['Merge sort', 'Heap sort', 'Bubble sort', 'Insertion sort'],
      [0, 1],
    ),
    choice(
      'q6',
      'multiple',
      'Which statements about Big-O are true?',
      [
        'It describes an upper bound on growth',
        'It ignores constant factors',
        'It measures exact runtime in seconds',
        'It is the same thing as the average case',
      ],
      [0, 1],
    ),
    descriptive(
      'q7',
      'Explain why quicksort is often faster in practice than merge sort despite its worse worst case.',
    ),
  ],
);

// A finished attempt on the past-due quiz: one multiple-answer question wrong (5 of 6 correct).
bigOQuiz.quizAttempt = buildAttempt(
  bigOQuiz,
  {
    choices: {
      q1: ['q1-b'],
      q2: ['q2-b'],
      q3: ['q3-a'],
      q4: ['q4-c'],
      q5: ['q5-a', 'q5-c'],
      q6: ['q6-a', 'q6-b'],
    },
    texts: {
      q7: 'Quicksort works in place and is cache friendly, and the worst case is very unlikely with a good pivot, so the constant factors usually beat merge sort.',
    },
  },
  Date.now() - 90 * HOUR_MS,
);

const written = (
  dto: Omit<AssignmentApiDto, 'kind' | 'questions' | 'quizAttempt'>,
): AssignmentApiDto => ({
  ...dto,
  kind: 'written',
  questions: [],
  quizAttempt: null,
});

let store: AssignmentApiDto[] = [
  written({
    id: 'asg-001',
    title: 'Build a REST API with NestJS',
    courseName: 'Backend Development',
    instructions:
      'Build a small REST API for a library catalogue using NestJS.\n\nRequirements:\n• CRUD endpoints for books\n• Input validation on every write\n• A short README explaining how to run it\n\nSubmit a link to your repository in the answer box, or attach a zip/PDF write-up.',
    dueAt: fromNow(52),
    submission: null,
  }),
  written({
    id: 'asg-002',
    title: 'Normalise a database schema to 3NF',
    courseName: 'Database Management Systems',
    instructions:
      'You are given an unnormalised orders table (attached in class). Identify the functional dependencies and normalise it to third normal form.\n\nShow each step and justify every decomposition.',
    dueAt: fromNow(5),
    submission: null,
  }),
  written({
    id: 'asg-003',
    title: 'Responsive portfolio page',
    courseName: 'Web Development',
    instructions:
      'Design and build a single-page portfolio that works from phone to desktop widths.\n\nUse semantic HTML and no CSS framework. Submit a link or a zipped project.',
    dueAt: fromNow(24 * 9),
    submission: null,
  }),
  written({
    id: 'asg-004',
    title: 'Implement a binary search tree',
    courseName: 'Data Structures & Algorithms',
    instructions:
      'Implement insert, search and in-order traversal for a binary search tree in the language of your choice, with at least five test cases.',
    dueAt: fromNow(-48),
    submission: null,
  }),
  written({
    id: 'asg-005',
    title: 'Linked list reversal write-up',
    courseName: 'Data Structures & Algorithms',
    instructions:
      'Explain, with diagrams, how to reverse a singly linked list iteratively and recursively, and compare their space complexity.',
    dueAt: fromNow(72),
    submission: {
      id: 'sub-005',
      answerText: 'Both approaches are covered in the attached PDF, with diagrams on page 2.',
      fileName: 'linked-list-reversal.pdf',
      fileSize: 482_000,
      submittedAt: fromNow(-20),
      isLate: false,
    },
  }),
  written({
    id: 'asg-006',
    title: 'Operating systems: scheduling comparison',
    courseName: 'Operating Systems',
    instructions:
      'Compare FCFS, SJF and Round Robin scheduling on the provided process set. Report average waiting time for each.',
    dueAt: fromNow(-24 * 6),
    submission: {
      id: 'sub-006',
      answerText: 'Sorry for the delay — comparison table is below.\nFCFS 8.2 · SJF 5.6 · RR 7.1',
      fileName: null,
      fileSize: null,
      submittedAt: fromNow(-24 * 5),
      isLate: true,
    },
  }),
  restQuiz,
  sqlQuiz,
  bigOQuiz,
];

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

const wait = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

/**
 * What the "server" sends back: a copy the caller can't use to mutate the store,
 * with correct answers attached only once the quiz is submitted and past its due date.
 */
function present(dto: AssignmentApiDto): AssignmentApiDto {
  const copy = structuredClone(dto);
  if (copy.quizAttempt) {
    const pastDue = Date.now() > new Date(copy.dueAt).getTime();
    copy.quizAttempt.correctAnswers = pastDue ? { ...(ANSWER_KEY[copy.id] ?? {}) } : null;
  }
  return copy;
}

export async function listAssignments(): Promise<AssignmentApiDto[]> {
  await wait();
  return store.map(present);
}

export async function getAssignment(id: string): Promise<AssignmentApiDto> {
  await wait();
  const found = store.find((assignment) => assignment.id === id);
  if (!found) throw new ApiError('Assignment not found.', 404);
  return present(found);
}

/** Submit or resubmit a written assignment — a resubmission replaces the previous one. */
export async function submitAssignment(
  id: string,
  payload: SubmitAssignmentPayload,
): Promise<AssignmentApiDto> {
  await wait();
  const found = store.find((assignment) => assignment.id === id);
  if (!found) throw new ApiError('Assignment not found.', 404);
  if (found.kind !== 'written') throw new ApiError('This assignment is a quiz.', 400);

  const now = Date.now();
  const updated: AssignmentApiDto = {
    ...found,
    submission: {
      id: found.submission?.id ?? `sub-${id}`,
      answerText: payload.answerText || null,
      fileName: payload.file?.name ?? null,
      fileSize: payload.file?.size ?? null,
      submittedAt: new Date(now).toISOString(),
      isLate: now > new Date(found.dueAt).getTime(),
    },
  };

  store = store.map((assignment) => (assignment.id === id ? updated : assignment));
  return present(updated);
}

/** Submit a quiz. One attempt only — there is no resubmitting. */
export async function submitQuiz(
  id: string,
  payload: SubmitQuizPayload,
): Promise<AssignmentApiDto> {
  await wait();
  const found = store.find((assignment) => assignment.id === id);
  if (!found) throw new ApiError('Assignment not found.', 404);
  if (found.kind !== 'quiz') throw new ApiError('This assignment is not a quiz.', 400);
  if (found.quizAttempt) throw new ApiError('You have already submitted this quiz.', 409);

  // Keep only answers to real questions and real options.
  const choices: Record<string, string[]> = {};
  const texts: Record<string, string> = {};
  for (const question of found.questions) {
    if (question.type === 'descriptive') {
      const text = (payload.texts[question.id] ?? '').trim();
      if (text) texts[question.id] = text;
      continue;
    }
    const validIds = new Set(question.options.map((option) => option.id));
    const picked = (payload.choices[question.id] ?? []).filter((optionId) =>
      validIds.has(optionId),
    );
    // A single-choice question can only ever hold one answer.
    const kept = question.type === 'single' ? picked.slice(0, 1) : picked;
    if (kept.length > 0) choices[question.id] = kept;
  }

  const updated: AssignmentApiDto = {
    ...found,
    quizAttempt: buildAttempt(found, { choices, texts }, Date.now()),
  };

  store = store.map((assignment) => (assignment.id === id ? updated : assignment));
  return present(updated);
}
