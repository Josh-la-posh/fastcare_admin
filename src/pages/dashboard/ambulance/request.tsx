import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useMemo, useEffect} from 'react';
import claim from '/svg/totalamb.svg';
import approved from '/svg/avbamb.svg';
import disputed from '/svg/unamb.svg';
import en from '/svg/enroute.svg';
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
import RequestDetails from '@/features/modules/ambulance/request-details';
import {RequestFilter} from '@/features/modules/ambulance/filter';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { fetchAmbulanceRequests, fetchAmbulanceSummary } from '@/services/thunks';
import { Loader } from '@/components/ui/loading';

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return dateString.replace(';', ',');
};

// Helper function to get pickup address
const getPickupAddress = (request: any) => {
  return request.pickupAddress || 
         `${request.pickupLocation?.latitude?.toFixed(4)}, ${request.pickupLocation?.longitude?.toFixed(4)}` || 
         'Location not specified';
};

// Helper function to get ambulance display number
const getAmbulanceDisplay = (request: any) => {
  return request.ambulanceNumber || request.ambulanceId?.slice(-8) || 'N/A';
};

const claimStats = [
  {
    id: 1,
    title: 'Total Ambulance',
    value: 0,
    borderColor: 'gray',
    bgColor: 'white',
    icon: claim,
  },
  {
    id: 2,
    title: 'Available Ambulance',
    value: 0,
    borderColor: '#0e9f2e',
    bgColor: 'rgba(14, 159, 46, 0.05)',
    icon: approved,
  },
  {
    id: 3,
    title: 'En Route',
    value: 0,
    borderColor: '#CFC923',
    bgColor: 'rgba(207, 201, 35, 0.05)',
    icon: en,
  },
  {
    id: 4,
    title: 'Unavailable',
    value: 0,
    borderColor: '#cf2323',
    bgColor: 'rgba(207, 35, 35, 0.05)',
    icon: disputed,
  },
];

const Request = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading, error, metaData } = useSelector((state: RootState) => state.ambulanceRequests);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [requestDateFilter, setRequestDateFilter] = useState<string>('');
  const [addressFilter, setAddressFilter] = useState<string>('');
  const [ambulanceLicensePlateFilter, setAmbulanceLicensePlateFilter] = useState<string>('');
  const [summary, setSummary] = useState({
    totalAmbulances: 0,
    availableAmbulances: 0,
    busyAmbulances: 0,
    unAvailableAmbulances: 0,
  });

  useEffect(() => {
    dispatch(
      fetchAmbulanceRequests({
        Page: page,
        PageSize: 10,
        RequestDate: requestDateFilter || undefined,
        Address: addressFilter || undefined,
        AmbulanceLicencePlate: ambulanceLicensePlateFilter || undefined,
      }),
    );
  }, [dispatch, page, requestDateFilter, addressFilter, ambulanceLicensePlateFilter]);

  useEffect(() => {
    const loadSummary = async () => {
      const result = await dispatch(fetchAmbulanceSummary());
      if (fetchAmbulanceSummary.fulfilled.match(result)) {
        setSummary({
          totalAmbulances: result.payload?.totalAmbulances ?? 0,
          availableAmbulances: result.payload?.availableAmbulances ?? 0,
          busyAmbulances: result.payload?.busyAmbulances ?? 0,
          unAvailableAmbulances: result.payload?.unAvailableAmbulances ?? 0,
        });
      }
    };
    void loadSummary();
  }, [dispatch]);

  // Transform API data to match table structure
  const transformedRequests = useMemo(() => {
    return requests.map(request => ({
      id: request.id,
      location: getPickupAddress(request),
      request_id: request.id.slice(-8).toUpperCase(), 
      type: request.emergencyType || 'General',
      no: getAmbulanceDisplay(request),
      time: formatDate(request.creationDate ?? null),
      action: 'View details',
      isNew: false, 
      rawData: request, // Keep original data for details
    }));
  }, [requests]);

  const filteredClaims = transformedRequests;

  const totalPages = metaData?.totalPages || 1;
  const paginatedRequests = filteredClaims;

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'location',
      header: 'Pickup Location',
      cell: ({row}) => (
        <div
          className={
            row.original.isNew
              ? 'font-semibold text-gray-900 flex flex-col'
              : 'flex flex-col'
          }
        >
          {row.original.isNew && (
            <span className="text-sm text-red-500">New</span>
          )}
          <span className={row.original.isNew ? 'font-semibold' : ''}>
            {row.original.location}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'time',
      header: 'Request Time',
      cell: ({row}) => (
        <span className={row.original.isNew ? 'font-semibold text-gray-900' : ''}>
          {row.original.time}
        </span>
      ),
    },
    {
      accessorKey: 'client_name',
      header: 'Client Name',
      cell: ({row}) => (
        <span className={row.original.isNew ? 'font-semibold text-gray-900' : ''}>
          {row.original?.rawData?.clientName}
        </span>
      ),
    },
    {
      accessorKey: 'no',
      header: 'Ambulance Number',
      cell: ({row}) => (
        <span className={row.original.isNew ? 'font-semibold text-gray-900' : ''}>
          {row.original.no}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Emergency Type',
      cell: ({row}) => (
        <span className={row.original.isNew ? 'font-semibold text-gray-900' : ''}>
          {row.original.type}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({row}) => <RequestDetails data={row.original.rawData} />,
    },
  ];

  const table = useReactTable({
    data: paginatedRequests,
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
    setRequestDateFilter(filters.requestDate || '');
    setAddressFilter(filters.address || '');
    setAmbulanceLicensePlateFilter(filters.ambulanceLicensePlate || '');
    setPage(1);
  };

  // Function to reset filters
  const handleResetFilter = () => {
    setRequestDateFilter('');
    setAddressFilter('');
    setAmbulanceLicensePlateFilter('');
    setPage(1);
  };

  // Update stats from /ambulances/summary
  const updatedClaimStats = useMemo(() => {
    return claimStats.map(stat => {
      switch (stat.id) {
        case 1:
          return {...stat, value: summary.totalAmbulances};
        case 2:
          return {...stat, value: summary.availableAmbulances};
        case 3:
          return {...stat, value: summary.busyAmbulances};
        case 4:
          return {...stat, value: summary.unAvailableAmbulances};
        default:
          return stat;
      }
    });
  }, [summary]);

  if (loading && requests.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader/>
        </div>
      </DashboardLayout>
    );
  }

  if (error && requests.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="my-10 mx-8 flex flex-col lg:flex-row justify-between gap-6 items-center">
          {updatedClaimStats.map(stat => (
            <div
              key={stat.id}
              className="flex justify-between items-center rounded-md bg-white p-6 w-full"
              style={{
                border: `2px solid ${stat.borderColor}`,
                backgroundColor: stat.bgColor,
              }}
            >
              <div>
                <h4 className="text-2xl leading-tight mb-2">{stat.value}</h4>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
              <div>
                <img src={stat.icon} alt={stat.title} className='w-8 h-8' />
              </div>
            </div>
          ))}
        </div>

        <div className="lg:mx-8 mt-10 bg-white mb-32 rounded-md flex flex-col">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg text-gray-800">All Ambulance Requests</h1>
            </div>
            <div className="flex items-center gap-3">
              <RequestFilter onApply={handleApplyFilter} onReset={handleResetFilter} />
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 lg:px-0 mt-4">
            {error && requests.length > 0 && (
              <div className="px-6 py-2 text-sm text-red-500">
                Failed to refresh requests. Showing last loaded data.
              </div>
            )}
            {loading && (
              <div className="px-6 py-2 text-sm text-gray-500">Refreshing requests...</div>
            )}
            <Table className="min-w-[600px]">
              <TableHeader>
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
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === 'actions' ? 'text-right' : ''
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
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-medium">No ambulance requests found</span>
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
              totalEntriesSize={metaData?.totalCount || filteredClaims.length}
             
              currentPage={metaData?.currentPage || page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={() => {
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Request;
