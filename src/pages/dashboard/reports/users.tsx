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
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/services/store';
import {fetchPatientReports} from '@/services/thunks';
import {setPatientPage, setPatientPageSize} from '@/services/slice/userReportsSlice';

interface UserReportRow {
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  role: string;
  creationDate: string;
}

const Users = () => {
  const dispatch = useDispatch<AppDispatch>();
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
      accessorKey: 'creationDate',
      header: 'Date',
      cell: ({getValue}) => {
        const raw = getValue<string>();
        return raw?.includes('T') ? raw.split('T')[0] : raw;
      },
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phoneNumber', header: 'Phone Number' },
    { accessorKey: 'countryCode', header: 'Country Code' },
    { accessorKey: 'role', header: 'Role' },
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
