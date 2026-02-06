import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useMemo, useEffect} from 'react';
import {Button} from '@/components/ui/button';

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
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {Pagination} from '@/components/ui/pagination';
import {DoctorFilter} from '@/features/modules/doctor/filter';
import RespondersNoteDetails from '@/features/modules/ambulance/responder-note-details';
import {AppDispatch, RootState} from '@/services/store';
import {useDispatch, useSelector} from 'react-redux';
import {fetchRespondents} from '@/services/thunks';
import {Loader} from '@/components/ui/loading';

const ResponderNote = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {respondents, loading, error} = useSelector(
    (state: RootState) => state.respondents,
  );

  useEffect(() => {
    const ambulanceProviderId = 'c4ac7df8-1873-42db-97ba-8b240abc99df';
    dispatch(fetchRespondents(ambulanceProviderId));
  }, [dispatch]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  const tableData = useMemo(() => {
    if (!respondents.length) return [];

    return respondents.map((respondent, index) => ({
      id: respondent.id,
      note_id: `N-${1000 + index}`, // Generate note ID based on index
      name: 'Patient Name', 
      amb_id: 'AMB-007 (Jude)', 
      res_name: respondent.name, 
      note: `Medical note for ${respondent.name}`, 
      date: '2023-01-01', 
      action: '',
    }));
  }, [respondents]);

  const totalPages = Math.ceil(tableData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, page, pageSize]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'note_id',
      header: 'Note ID',
    },
    {
      accessorKey: 'name',
      header: 'Patient Name',
    },
    {
      accessorKey: 'amb_id',
      header: 'Ambulance ID',
    },
    {
      accessorKey: 'res_name',
      header: 'Responder Name',
    },
    {
      accessorKey: 'note',
      header: 'Note Preview',
      cell: ({row}) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          {row.original.note}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'View',
      enableHiding: false,
      cell: ({row}) => {
        const isEmptyRow = !row.original.id && !row.original.name;
        if (isEmptyRow) {
          return null;
        }
        return (
          <div>
            <RespondersNoteDetails data={row.original} />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: paginatedData, 
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Function to apply filters from FilterDialog
  const handleApplyFilter = (filters: any) => {
    const newFilters: any[] = [];
    if (filters.status) newFilters.push({id: 'status', value: filters.status});
    if (filters.name) newFilters.push({id: 'name', value: filters.name});
    if (filters.date) newFilters.push({id: 'date', value: filters.date});
    setColumnFilters(newFilters);
  };

  // Function to reset filters
  const handleResetFilter = () => {
    setColumnFilters([]);
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-gray-100 h-full flex items-center justify-center">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-gray-100 h-full flex items-center justify-center">
          <div className="bg-white rounded-md p-8">
            <div className="text-lg text-red-500">Error: {error}</div>
            <Button
              onClick={() => {
                const ambulanceProviderId =
                  'c4ac7df8-1873-42db-97ba-8b240abc99df';
                dispatch(fetchRespondents(ambulanceProviderId));
              }}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="lg:mx-8 mt-10 bg-white rounded-md flex flex-col h-[600px] mb-36">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <h1 className="text-lg text-gray-800">All Responder's Notes</h1>
              {loading && (
                <div className="flex items-center gap-2">
                  <Loader />
                 
                </div>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <DoctorFilter
                onApply={handleApplyFilter}
                onReset={handleResetFilter}
              />
              <Button variant="ghost" className="py-2.5 w-36 rounded-md">
                Export
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto lg:px-0 lg:mt-4">
            <Table className="min-w-[600px]">
              <TableHeader className="border-y border-[#CDE5F9]">
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-gray-100"
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === 'action' ? 'text-right' : ''
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-medium">
                          {respondents.length === 0
                            ? 'No respondents found'
                            : 'No responder notes found'}
                        </span>
                        <span className="text-sm text-gray-600 mt-1">
                          {respondents.length === 0
                            ? 'Add respondents to see their notes here'
                            : 'Notes will appear here once available'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-end">
            <Pagination
              totalEntriesSize={tableData.length}
            
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={size => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResponderNote;
