import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useEffect} from 'react';
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
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '@/services/store';
import {fetchDoctors} from '@/services/thunks';
import {Pagination} from '@/components/ui/pagination';
import DoctorVerificationDetails from '@/features/modules/doctor/doctor-veri-details';
import {Loader} from '@/components/ui/loading';
import { Doctor } from '@/types';

const VerificationRequest = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {doctors, loading, error, totalCount, currentPage, totalPages, pageSize: storePageSize} = useSelector(
    (state: RootState) => state.doctors,
  );

  const [searchTerm, setSearchTerm] = useState('');
  // activeSearch holds the term last sent to backend; decouples input typing from network calls
  const [activeSearch, setActiveSearch] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<import('@tanstack/react-table').ColumnFiltersState>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(storePageSize || 10);
  const [status, setStatus] = useState<undefined | number>(undefined);

  // We can rely directly on Doctor type (updated to allow nullable isApproved & optional createdAt)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [openVerify, setOpenVerify] = useState(false);

 useEffect(() => {
   // Fetch doctors when page, pageSize or status changes; include activeSearch if present
   dispatch(fetchDoctors({ page, pageSize, status, search: activeSearch }));
 }, [dispatch, page, pageSize, status, activeSearch]);

  // Removed client-side filteredDoctors; backend search used instead

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: 'firstName',
      header: () => <span className="whitespace-nowrap">Doctor Name</span>,
      cell: ({row}) => <span className="whitespace-nowrap">{`${row.original.firstName} ${row.original.lastName}`}</span>,
    },
    {
      accessorKey: 'specialization',
      header: () => <span className="whitespace-nowrap">Speciality</span>,
      cell: ({row}) => <span className="whitespace-nowrap">{row.original.specialization}</span>,
    },
    {
      accessorKey: 'licenseNumber',
      header: () => <span className="whitespace-nowrap">License Number</span>,
      cell: ({row}) => <span className="whitespace-nowrap">{row.original.licenseNumber}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: () => <span className="whitespace-nowrap">Submission Date</span>,
      cell: ({ row }) => {
        const value = (row.original as Doctor).createdAt;
        return <span className="whitespace-nowrap">{value ? new Date(value).toLocaleDateString() : '--'}</span>;
      }
    },
    {
      accessorKey: 'registrationStatus',
      header: () => <span className="whitespace-nowrap">Status</span>,
      cell: ({ getValue }) => {
        const raw = (getValue() as string | null | undefined) || 'Pending';
        const status = raw.toLowerCase();
        let label = raw;
        // Normalize common statuses
        if (status === 'pending') label = 'Pending';
        else if (status === 'approved') label = 'Approved';
        else if (status === 'rejected') label = 'Rejected';
        else if (status === 'inreview' || status === 'in_review') label = 'In Review';
        else label = raw.charAt(0).toUpperCase() + raw.slice(1);

        let classes = 'px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ';
        if (status === 'approved') classes += 'bg-green-100 text-green-700';
        else if (status === 'pending') classes += 'bg-yellow-100 text-yellow-700';
        else if (status === 'rejected') classes += 'bg-red-100 text-red-700';
        else if (status === 'inreview' || status === 'in_review') classes += 'bg-blue-100 text-blue-700';
        else classes += 'bg-gray-100 text-gray-600';
        return <span className={classes}>{label}</span>;
      },
    },
    {
      id: 'action',
      enableHiding: false,
      header: 'Action',
      cell: ({row}) => {
       
        return (
          <Button
            className="flex whitespace-nowrap text-center border-none justify-center cursor-pointer font-semibold items-center gap-2 bg-[#E4F1FC] p-2 rounded-md text-[#135E9B]"
            onClick={() => {
              setSelectedDoctor(row.original);
              setOpenVerify(true);
            }}
          >
            View Details
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: doctors,
    columns,
    state: {sorting, columnVisibility, rowSelection, columnFilters},
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Removed handleApplyFilter / handleResetFilter (filter UI removed)

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="lg:mx-8 mt-10 bg-white rounded-md flex flex-col mb-36">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center flex-wrap gap-4 lg:gap-8">
              <h1 className="text-xl text-gray-800 whitespace-nowrap">
                Pending Doctor Approvals
              </h1>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    setActiveSearch(searchTerm.trim() || undefined);
                  }
                }}
                className="border rounded-lg hidden lg:block px-4 py-2 lg:w-72 xl:w-96 focus:outline-none"
              />
              <Button
                variant="default"
                className="hidden lg:inline-flex"
                onClick={() => {
                  setPage(1);
                  setActiveSearch(searchTerm.trim() || undefined);
                }}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {/* Filter and export controls removed per request */}
            
            <div className="flex items-center gap-2">
              <label htmlFor="statusFilter" className="text-sm text-gray-600">Status:</label>
              <select
                id="statusFilter"
                value={status}
                onChange={e => { const v = e.target.value; setStatus(v === '' ? undefined : Number(v)); setPage(1); }}
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">All</option>
                <option value="1">Pending</option>
                <option value="2">Approved</option>
                <option value="3">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex-1  lg:px-0 lg:mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <Loader />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-10">{error}</div>
            ) : (
              <>
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
                          <span className="font-medium">
                            No pending doctors
                          </span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="p-4 flex items-center justify-end">
                  <Pagination
                    totalEntriesSize={totalCount}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p:number) => {
                      setPage(p);
                    }}
                    pageSize={pageSize}
                    onPageSizeChange={size => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <DoctorVerificationDetails
          data={selectedDoctor || undefined}
          open={openVerify}
          setOpen={setOpenVerify}
        />
      </div>
    </DashboardLayout>
  );
};

export default VerificationRequest;
