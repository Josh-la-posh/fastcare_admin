import {DashboardLayout} from '@/layout/dashboard-layout';
import {useEffect} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {Pagination} from '@/components/ui/pagination';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/services/store';
import {fetchPatientReports} from '@/services/thunks';
import {setPatientPage, setPatientPageSize} from '@/services/slice/userReportsSlice';

interface UserReportRow {
  date: string;
  userCount: number;
}

const Users = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {patientList, patientMeta, loadingPatient, errorPatient, patientFilters} = useSelector(
    (s: RootState) => s.userReports,
  );

  const page = patientFilters.Page || 1;
  const pageSize = patientFilters.PageSize || 20;

  useEffect(() => {
    dispatch(fetchPatientReports({Page: page, PageSize: pageSize}));
  }, [dispatch, page, pageSize]);

  const columns: ColumnDef<UserReportRow>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({getValue}) => {
        const raw = getValue<string>();
        // Show only date portion if includes T
        return raw?.includes('T') ? raw.split('T')[0] : raw;
      },
    },

    {
      accessorKey: 'userCount',
      header: 'Number of Users',
    },

    {
      id: 'action',
      header: 'Action',
      cell: ({row}) => (
        <div
          onClick={() =>
            navigate(
              `/reports/users/user-details/${encodeURIComponent(row.original.date)}`,
            )
          }
          className="flex text-center w-36 justify-center cursor-pointer font-semibold items-center gap-2 bg-[#E4F1FC] p-2 rounded-md text-[#135E9B]"
        >
          View Details
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: patientList as UserReportRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = patientMeta?.totalPages || 1;

  const empty = !loadingPatient && patientList.length === 0;

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full ">
        <div className="lg:mx-8 mt-10 bg-white rounded-md flex flex-col h-[600px] mb-36">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <h1 className="text-xl text-gray-800">Users Report</h1>
            </div>
          </div>

          <div className="flex-1 overflow-auto lg:px-0 lg:mt-4">
            {loadingPatient ? (
              <div className="flex items-center justify-center h-64 text-sm text-gray-500">
                Loading reports...
              </div>
            ) : empty ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                <p className="font-medium">No user report data yet</p>
                <p className="text-sm">Reports will appear here once available.</p>
              </div>
            ) : (
              <Table className="min-w-[600px]">
                <TableHeader className="border-y border-[#CDE5F9]">
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead className="px-16" key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === 'actions'
                              ? 'text-right px-24'
                              : 'px-16'
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {errorPatient && (
              <div className="p-4 text-sm text-red-600">{errorPatient}</div>
            )}
          </div>

          <div className="p-4 flex items-center justify-end">
            <Pagination
              totalEntriesSize={patientMeta?.totalCount || patientList.length}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={p => dispatch(setPatientPage(p))}
              pageSize={pageSize}
              onPageSizeChange={s => dispatch(setPatientPageSize(s))}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Users;
