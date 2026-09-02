import { useState } from 'react';
import type { JSX } from 'react';
import { Check, ListFilter, Search, X } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { COMPUTER_ENGINEERING_COURSES } from '../../constants';
import type { CourseFilterPopoverProps } from '../../@types';

export function CourseFilterPopover({
  selectedCourses,
  onChange,
}: CourseFilterPopoverProps): JSX.Element {
  const [search, setSearch] = useState('');

  const visibleCourses = COMPUTER_ENGINEERING_COURSES.filter((course) =>
    course.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleCourse = (course: string): void => {
    onChange(
      selectedCourses.includes(course)
        ? selectedCourses.filter((c) => c !== course)
        : [...selectedCourses, course],
    );
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className="h-10 gap-2 rounded-xl">
            <ListFilter className="h-4 w-4" />
            Course
            {selectedCourses.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {selectedCourses.length}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-80 p-0">
        <div className="border-b border-border p-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="h-9 pl-9"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-1.5">
          {visibleCourses.length === 0 ? (
            <p className="px-2.5 py-3 text-center text-sm text-muted-foreground">
              No courses match.
            </p>
          ) : (
            visibleCourses.map((course) => {
              const isSelected = selectedCourses.includes(course);
              return (
                <button
                  key={course}
                  type="button"
                  onClick={() => toggleCourse(course)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-accent-soft text-primary'
                      : 'text-foreground hover:bg-accent-soft/60',
                  )}
                >
                  <span className="truncate">{course}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
        {selectedCourses.length > 0 && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground"
              onClick={() => onChange([])}
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
