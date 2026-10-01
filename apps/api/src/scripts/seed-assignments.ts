/**
 * Dev-only sample data for the assignment APIs: `yarn seed:assignments`.
 *
 * There is no endpoint to create assignments yet, so this is how a local database
 * gets any. It attaches each sample to a course that already exists *by exact name*
 * and skips the ones whose course is missing — it never creates or edits courses
 * or students. Safe to re-run: a sample with the same title on the same course is
 * left alone.
 *
 * To see them as a student, the signed-in user's verified email must match an
 * active row in `student` whose `course` is one of the course names below.
 */
import AppDataSource from '../config/data-source';

const HOUR_MS = 60 * 60 * 1000;
const hoursFromNow = (hours: number): Date => new Date(Date.now() + hours * HOUR_MS);

type SeedQuestion =
  | { type: 'descriptive'; prompt: string }
  | { type: 'single' | 'multiple'; prompt: string; options: string[]; correct: number[] };

interface SeedAssignment {
  courseName: string;
  kind: 'written' | 'quiz';
  title: string;
  instructions: string;
  dueAt: Date;
  questions?: SeedQuestion[];
}

const SEEDS: SeedAssignment[] = [
  {
    courseName: 'Data Structures & Algorithms',
    kind: 'written',
    title: 'Implement a binary search tree',
    instructions:
      'Implement insert, search and in-order traversal for a binary search tree in the language of your choice, with at least five test cases.',
    dueAt: hoursFromNow(-48),
  },
  {
    courseName: 'Data Structures & Algorithms',
    kind: 'quiz',
    title: 'Quiz: Big-O and sorting',
    instructions:
      'Seven questions on complexity and sorting: four single-answer, two multiple-answer, and one written answer at the end.\n\nYou get one attempt.',
    dueAt: hoursFromNow(-72),
    questions: [
      {
        type: 'single',
        prompt: 'What is the time complexity of binary search on a sorted array?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correct: [1],
      },
      {
        type: 'single',
        prompt: 'What is the worst-case time complexity of quicksort?',
        options: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
        correct: [1],
      },
      {
        type: 'single',
        prompt: 'Which of these sorting algorithms is stable?',
        options: ['Merge sort', 'Heap sort', 'Selection sort', 'Quickselect'],
        correct: [0],
      },
      {
        type: 'single',
        prompt: 'What is the space complexity of merge sort?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct: [2],
      },
      {
        type: 'multiple',
        prompt: 'Which of these run in O(n log n) on average?',
        options: ['Merge sort', 'Heap sort', 'Bubble sort', 'Insertion sort'],
        correct: [0, 1],
      },
      {
        type: 'multiple',
        prompt: 'Which statements about Big-O are true?',
        options: [
          'It describes an upper bound on growth',
          'It ignores constant factors',
          'It measures exact runtime in seconds',
          'It is the same thing as the average case',
        ],
        correct: [0, 1],
      },
      {
        type: 'descriptive',
        prompt:
          'Explain why quicksort is often faster in practice than merge sort despite its worse worst case.',
      },
    ],
  },
  {
    courseName: 'Full Stack Development',
    kind: 'written',
    title: 'Build a REST API with NestJS',
    instructions:
      'Build a small REST API for a library catalogue using NestJS.\n\nRequirements:\n• CRUD endpoints for books\n• Input validation on every write\n• A short README explaining how to run it\n\nSubmit a link to your repository in the answer box, or attach a zip/PDF write-up.',
    dueAt: hoursFromNow(52),
  },
  {
    courseName: 'Full Stack Development',
    kind: 'quiz',
    title: 'Quiz: REST and HTTP fundamentals',
    instructions:
      'Eight questions on HTTP and REST: four single-answer, three multiple-answer, and one written answer at the end.\n\nYou get one attempt. Multiple-answer questions are marked all-or-nothing, so pick every correct option.',
    dueAt: hoursFromNow(30),
    questions: [
      {
        type: 'single',
        prompt: 'Which HTTP method is idempotent and used to fully replace a resource?',
        options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
        correct: [1],
      },
      {
        type: 'single',
        prompt: 'Which status code means a resource was created?',
        options: ['200', '201', '204', '301'],
        correct: [1],
      },
      {
        type: 'single',
        prompt: 'Which status code tells the client it is not authenticated?',
        options: ['401', '403', '404', '409'],
        correct: [0],
      },
      {
        type: 'single',
        prompt: 'Where should a bearer token normally be sent?',
        options: [
          'In the query string',
          'In the Authorization header',
          'In the response body',
          'In the URL fragment',
        ],
        correct: [1],
      },
      {
        type: 'multiple',
        prompt: 'Which HTTP methods are "safe" — they should not change server state?',
        options: ['GET', 'HEAD', 'DELETE', 'POST'],
        correct: [0, 1],
      },
      {
        type: 'multiple',
        prompt: 'Which situations justify a 400 Bad Request?',
        options: [
          'Malformed JSON body',
          'A required field is missing',
          'The database is unreachable',
          'The requested id does not exist',
        ],
        correct: [0, 1],
      },
      {
        type: 'multiple',
        prompt: 'Which headers help with caching?',
        options: ['Cache-Control', 'ETag', 'Content-Length', 'Authorization'],
        correct: [0, 1],
      },
      {
        type: 'descriptive',
        prompt:
          'Explain the difference between authentication and authorization, and give one REST API example of each.',
      },
    ],
  },
  {
    courseName: 'React js',
    kind: 'written',
    title: 'Responsive portfolio page',
    instructions:
      'Design and build a single-page portfolio that works from phone to desktop widths.\n\nUse semantic HTML and no CSS framework. Submit a link or a zipped project.',
    dueAt: hoursFromNow(24 * 9),
  },
];

function assertQuizShape(seed: SeedAssignment): void {
  if ((seed.questions ?? []).length < 1) {
    throw new Error(`"${seed.title}" is a quiz and needs at least one question.`);
  }
}

async function main(): Promise<void> {
  await AppDataSource.initialize();
  let created = 0;

  try {
    for (const seed of SEEDS) {
      if (seed.kind === 'quiz') assertQuizShape(seed);

      const courses = await AppDataSource.query<Array<{ id: string }>>(
        `SELECT id FROM course WHERE name = $1 AND status = 'active'`,
        [seed.courseName],
      );
      if (courses.length === 0) {
        console.log(`skip   "${seed.title}" — no active course named "${seed.courseName}"`);
        continue;
      }

      for (const course of courses) {
        const existing = await AppDataSource.query<Array<{ id: string }>>(
          `SELECT id FROM assignment WHERE course_id = $1 AND title = $2`,
          [course.id, seed.title],
        );
        if (existing.length > 0) {
          console.log(`exists "${seed.title}" (${seed.courseName})`);
          continue;
        }

        await AppDataSource.transaction(async (manager) => {
          const [assignment] = await manager.query<Array<{ id: string }>>(
            `INSERT INTO assignment (kind, title, course_id, instructions, due_at)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [seed.kind, seed.title, course.id, seed.instructions, seed.dueAt],
          );

          for (const [index, question] of (seed.questions ?? []).entries()) {
            const [saved] = await manager.query<Array<{ id: string }>>(
              `INSERT INTO quiz_question (assignment_id, position, type, prompt)
               VALUES ($1, $2, $3, $4) RETURNING id`,
              [assignment.id, index + 1, question.type, question.prompt],
            );
            if (question.type === 'descriptive') continue;

            for (const [optionIndex, label] of question.options.entries()) {
              await manager.query(
                `INSERT INTO quiz_option (question_id, position, label, is_correct)
                 VALUES ($1, $2, $3, $4)`,
                [saved.id, optionIndex + 1, label, question.correct.includes(optionIndex)],
              );
            }
          }
        });

        created += 1;
        console.log(`added  "${seed.title}" (${seed.courseName})`);
      }
    }
  } finally {
    await AppDataSource.destroy();
  }

  console.log(`\n${created} assignment(s) added.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
