import {DashboardLayout} from '@/layout/dashboard-layout';
import {useMemo, useState} from 'react';
//import {ArrowDownLeft, Edit2Icon, InfoIcon, MoreVertical} from 'lucide-react';

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

//import {Pagination} from '@/components/ui/pagination';

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

import {Pagination} from '@/components/ui/pagination';
import {EmergencyFilter} from '@/features/modules/report/filter';

const emergency = [
  {
    id: '1',
    doctor: 'Dr Thelma George',
    req_id: 'ER00231',
    name: 'Wisdom Fredis',
    res_time: '4mins',
    time: '15-06-2015, 10:25AM',
    status: 'Missed',
    date: '24/07/2023',
    action: '',
  },
  {
    id: '2',
    doctor: 'Dr Thelma George',
    req_id: 'ER00231',
    name: 'Wisdom Fredis',
    res_time: '4mins',
    time: '15-06-2015, 10:25AM',
    status: 'Attended',
    date: '24/07/2023',
    action: '',
  },
  {
    id: '3',
    doctor: 'Dr Thelma George',
    req_id: 'ER00231',
    name: 'Wisdom Fredis',
    res_time: '4mins',
    time: '15-06-2015, 10:25AM',
    status: 'Missed',
    date: '24/07/2023',
    action: '',
  },
  {
    id: '4',
    doctor: 'Dr Thelma George',
    req_id: 'ER00231',
    name: 'Wisdom Fredis',
    res_time: '4mins',
    time: '15-06-2015, 10:25AM',
    status: 'Attended',
    date: '24/07/2023',
    action: '',
  },
];

const EmergencyCall = () => {
  //const [searchTerm, setSearchTerm] = useState('');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(emergency.length / pageSize);
  const paginatedReporting = useMemo(() => {
    const start = (page - 1) * pageSize;
    return emergency.slice(start, start + pageSize);
  }, [emergency, page]);

  const columns: ColumnDef<any>[] = [
    // {
    //   accessorKey: 'date',
    //   header: 'Date',
    //   filterFn: (row, id, filterValue) => {
    //     const rowDate = new Date(row.getValue(id));
    //     const start = filterValue?.start ? new Date(filterValue.start) : null;
    //     const end = filterValue?.end ? new Date(filterValue.end) : null;

    //     if (start && rowDate < start) return false;
    //     if (end && rowDate > end) return false;
    //     return true;
    //   },
    // },

    {
      accessorKey: 'req_id',
      header: 'Request ID',
      cell: ({row}) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          {row.original.req_id}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Patient Name',
      cell: ({row}) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          {row.original.name}
        </span>
      ),
    },

    {
      accessorKey: 'doctor',
      header: 'Doctor Assigned',
    },
    
    {
      accessorKey: 'res_time',
      header: 'Response Time',
    },
    
    {
      accessorKey: 'time',
      header: 'Time',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({getValue}) => {
        const value = getValue() as string; // ✅ cast from unknown to string
        const status = (value || '').toLowerCase();

        let statusClasses = ' py-1  text-md font-semibold w-fit';

        if (status === 'successful' || status === 'attended') {
          statusClasses += '  text-green-700';
        } else if (status === 'pending') {
          statusClasses += '  text-yellow-600';
        } else if (status === 'missed' || status === 'failed') {
          statusClasses += '  text-red-800';
        } else {
          statusClasses += '  text-gray-500';
        }

        return <span className={statusClasses}>{value || '-'}</span>;
      },
    },
  ];

  const table = useReactTable({
    data: paginatedReporting,
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

  const handleApplyFilter = (filters: {
    fromDate?: string | null;
    toDate?: string | null;
    status?: string | null;
    patientName?: string | null;
    scheduledDoctor?: string | null;
  }) => {
    const newFilters: any[] = [];

    if (filters.status) newFilters.push({id: 'status', value: filters.status});

    if (filters.patientName) newFilters.push({id: 'patientName', value: filters.patientName});

    if (filters.scheduledDoctor) newFilters.push({id: 'scheduledDoctor', value: filters.scheduledDoctor});

    if (filters.fromDate || filters.toDate) {
      newFilters.push({
        id: 'date',
        value: {start: filters.fromDate, end: filters.toDate},
      });
    }

    setColumnFilters(newFilters);
  };

  // Function to reset filters
  const handleResetFilter = () => {
    setColumnFilters([]);
  };

  const hasData = emergency.length > 0;

  return (
    <DashboardLayout>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[70vh] ">
          <p className="text-lg font-semibold text-gray-800">
            You have emergency calls yet
          </p>
          <p className="text-gray-500 mt-2">All emergency calls appear here</p>
        </div>
      ) : (
        <div className="bg-gray-100 overflow-scroll h-full ">
          <div className="bg-white p-6 rounded-md flex justify-between items-center mx-8 mt-10">
            <EmergencyFilter
              onApply={handleApplyFilter}
              onReset={handleResetFilter}
            />
          </div>

          <div className="lg:mx-8 mt-10 bg-white mb-32 pb-10 rounded-md flex flex-col">
            <div className="flex-1 overflow-auto px-6 lg:px-0 mt-4">
              <Table className="min-w-[600px]">
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead  key={header.id}>
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
                          <>
                            <TableCell
                              key={cell.id}
                              className={
                                cell.column.id === 'actions'
                                  ? 'text-right'
                                  : ''
                              }
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          </>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">No data available</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination stuck at bottom */}
            <div className="p-4 flex items-center justify-end ">
              <Pagination
                totalEntriesSize={emergency.length}
              
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
      )}
    </DashboardLayout>
  );
};

export default EmergencyCall;
