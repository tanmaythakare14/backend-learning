import type { ChatParticipant, ConversationApiDto, MessageApiDto } from '../@types';

export const MOCK_PARTICIPANTS: ChatParticipant[] = [
  { studentDbId: 'p-1', studentId: 'STU-2401', fullName: 'Emma Clarke', course: 'Cloud Computing' },
  { studentDbId: 'p-2', studentId: 'STU-2402', fullName: 'Liam Brooks', course: 'Data Science' },
  { studentDbId: 'p-3', studentId: 'STU-2403', fullName: 'Ava Patel', course: 'Cybersecurity' },
  {
    studentDbId: 'p-4',
    studentId: 'STU-2404',
    fullName: 'Noah Reyes',
    course: 'Full Stack Development',
  },
  { studentDbId: 'p-5', studentId: 'STU-2405', fullName: 'Sophia Turner', course: 'UI/UX Design' },
];

const NOW = Date.now();
const minutesAgo = (minutes: number): string => new Date(NOW - minutes * 60_000).toISOString();

// Inline SVG so the mock "screenshot" attachment doesn't depend on an
// external image host being reachable.
const ERROR_SCREENSHOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300">
  <rect width="100%" height="100%" fill="#1f2937"/>
  <text x="24" y="52" font-family="monospace" font-size="20" fill="#f87171">TypeError: Cannot read properties</text>
  <text x="24" y="84" font-family="monospace" font-size="16" fill="#e5e7eb">at deploy.sh line 42</text>
  <text x="24" y="112" font-family="monospace" font-size="16" fill="#e5e7eb">Exit code: 1</text>
</svg>`;
const ERROR_SCREENSHOT_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(ERROR_SCREENSHOT_SVG)}`;

export const MOCK_MESSAGES: MessageApiDto[] = [
  {
    id: 'msg-1-1',
    conversationId: 'conv-1',
    sender: 'student',
    text: 'Hi! I had a question about the cloud deployment assignment.',
    attachments: [],
    sentAt: minutesAgo(180),
  },
  {
    id: 'msg-1-2',
    conversationId: 'conv-1',
    sender: 'admin',
    text: 'Sure, go ahead — what part are you stuck on?',
    attachments: [],
    sentAt: minutesAgo(175),
  },
  {
    id: 'msg-1-3',
    conversationId: 'conv-1',
    sender: 'student',
    text: 'Here is the error I am seeing when I deploy.',
    attachments: [
      {
        id: 'att-1',
        kind: 'image',
        name: 'error-screenshot.png',
        url: ERROR_SCREENSHOT_DATA_URL,
      },
    ],
    sentAt: minutesAgo(170),
  },
  {
    id: 'msg-1-4',
    conversationId: 'conv-1',
    sender: 'admin',
    text: 'Thanks — attaching the reference guide, check page 4.',
    attachments: [
      { id: 'att-2', kind: 'pdf', name: 'deployment-guide.pdf', url: '#', sizeLabel: '1.2 MB' },
    ],
    sentAt: minutesAgo(12),
  },
  {
    id: 'msg-2-1',
    conversationId: 'conv-2',
    sender: 'student',
    text: 'Could you review my dataset before submission?',
    attachments: [],
    sentAt: minutesAgo(1440),
  },
  {
    id: 'msg-2-2',
    conversationId: 'conv-2',
    sender: 'admin',
    text: 'Looks good overall — clean up the null values in column C.',
    attachments: [],
    sentAt: minutesAgo(1430),
  },
  {
    id: 'msg-3-1',
    conversationId: 'conv-3',
    sender: 'student',
    text: 'Is the certification exam link still valid?',
    attachments: [
      {
        id: 'att-3',
        kind: 'link',
        name: 'https://cognify.dev/certifications/cybersecurity',
        url: 'https://cognify.dev/certifications/cybersecurity',
      },
    ],
    sentAt: minutesAgo(60),
  },
  {
    id: 'msg-4-1',
    conversationId: 'conv-4',
    sender: 'admin',
    text: 'Welcome to the program! Let me know if you need anything.',
    attachments: [],
    sentAt: minutesAgo(4320),
  },
  {
    id: 'msg-4-2',
    conversationId: 'conv-4',
    sender: 'student',
    text: 'Thank you! Looking forward to getting started.',
    attachments: [],
    sentAt: minutesAgo(4300),
  },
];

export const MOCK_CONVERSATIONS: ConversationApiDto[] = [
  { id: 'conv-1', participant: MOCK_PARTICIPANTS[0], lastMessage: null, unreadCount: 2 },
  { id: 'conv-2', participant: MOCK_PARTICIPANTS[1], lastMessage: null, unreadCount: 0 },
  { id: 'conv-3', participant: MOCK_PARTICIPANTS[2], lastMessage: null, unreadCount: 1 },
  { id: 'conv-4', participant: MOCK_PARTICIPANTS[3], lastMessage: null, unreadCount: 0 },
];
