import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchInput } from '@/components/common/SearchInput';
import { ApiError } from '@/utils/apiError';
import { logger } from '@/utils/logger';
import { ASSIGNMENT_NEW_PATH, ASSIGNMENT_TABS } from '../constants';
import { sortForTab, summarizeAssignments, tabForState } from '../utils';
import { apiDtoToAssignment, listAssignments } from '../service';
import type { AssignmentListState, AssignmentTab } from '../@types';
import { AssignmentRow } from './assignment-list';

export function AssignmentsScreen(): JSX.Element {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AssignmentTab>('todo');
  const [search, setSearch] = useState('');
  const [loadState, setLoadState] = useState<AssignmentListState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    listAssignments()
      .then((dtos) => {
        if (cancelled) return;
        setLoadState({ status: 'success', assignments: dtos.map(apiDtoToAssignment) });
      })
      .catch((error: unknown) => {
        logger.error('Could not load assignments', error);
        if (cancelled) return;
        setLoadState({
          status: 'error',
          message: error instanceof ApiError ? error.message : 'Failed to load assignments.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const assignments = useMemo(
    () => (loadState.status === 'success' ? loadState.assignments : []),
    [loadState],
  );

  // Search narrows every tab, so the counts always reflect what the search finds.
  const matching = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assignments;
    return assignments.filter(
      (assignment) =>
        assignment.title.toLowerCase().includes(query) ||
        assignment.courseName.toLowerCase().includes(query),
    );
  }, [assignments, search]);

  const forTab = (tab: AssignmentTab) =>
    sortForTab(
      matching.filter((assignment) => tabForState(assignment.state) === tab),
      tab,
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Assignments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loadState.status === 'success'
              ? summarizeAssignments(assignments)
              : 'Your coursework, due dates and submissions in one place.'}
          </p>
        </div>
        <Button onClick={() => navigate(ASSIGNMENT_NEW_PATH)} className="h-10 gap-2">
          <Plus className="h-4 w-4" />
          Add New Assignment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AssignmentTab)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            {ASSIGNMENT_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}{' '}
                <span className="ml-1 text-muted-foreground">({forTab(tab.value).length})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or course"
            containerClassName="w-72"
          />
        </div>

        {loadState.status === 'error' ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {loadState.message}
          </p>
        ) : loadState.status === 'loading' ? (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading assignments…
          </div>
        ) : (
          ASSIGNMENT_TABS.map((tab) => {
            const rows = forTab(tab.value);
            return (
              <TabsContent key={tab.value} value={tab.value}>
                {rows.length === 0 ? (
                  <p className="rounded-xl border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
                    {search.trim() ? 'No assignments match your search.' : tab.emptyMessage}
                  </p>
                ) : (
                  <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                    {rows.map((assignment) => (
                      <AssignmentRow key={assignment.id} assignment={assignment} />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })
        )}
      </Tabs>
    </div>
  );
}
