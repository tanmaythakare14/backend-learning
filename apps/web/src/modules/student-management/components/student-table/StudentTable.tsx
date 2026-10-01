import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { STUDENT_LIST_PATH } from '../../constants';
import type { StudentTableProps } from '../../@types';

export function StudentTable({
  students,
  onEdit,
  onDeactivate,
  onDelete,
}: StudentTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student ID</TableHead>
          <TableHead>Full Name</TableHead>
          <TableHead>Email Address</TableHead>
          <TableHead>Phone Number</TableHead>
          <TableHead>Assigned Course</TableHead>
          <TableHead>Assigned On</TableHead>
          <TableHead className="w-12 text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
              No students found.
            </TableCell>
          </TableRow>
        ) : (
          students.map((student) => (
            <TableRow key={student.id} className="group">
              <TableCell className="font-medium text-foreground">{student.studentId}</TableCell>
              <TableCell>
                <Link
                  to={`${STUDENT_LIST_PATH}/${student.id}`}
                  state={{ student }}
                  className="hover:text-primary hover:underline"
                >
                  {student.firstName} {student.lastName}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{student.email}</TableCell>
              <TableCell className="text-muted-foreground">{student.phone}</TableCell>
              <TableCell>{student.course}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(student.assignedOn), 'MM/dd/yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-muted-foreground opacity-70 transition-colors hover:bg-accent-soft hover:text-primary group-hover:opacity-100 data-[popup-open]:bg-accent-soft data-[popup-open]:text-primary data-[popup-open]:opacity-100"
                        aria-label={`Actions for ${student.firstName} ${student.lastName}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    }
                  />
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onEdit(student)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeactivate(student)}>
                      <Power className="h-4 w-4" />
                      {student.status === 'deactivated' ? 'Activate' : 'Deactivate'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onClick={() => onDelete(student)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
