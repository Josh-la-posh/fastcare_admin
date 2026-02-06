import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useMemo, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';

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

import EditDriver from '@/components/form/ambulance/drivers/edit-driver';
import DriverDetails from '@/features/modules/ambulance/driver-details';
import { Trash } from 'lucide-react';
import AddAmbulance from '@/components/form/ambulance/ambulances/add-ambulance';
import { fetchAmbulances } from '@/services/thunks';
import { Loader } from '@/components/ui/loading';


const formatLocation = (location: { latitude: number; longitude: number } | null) => {
  if (!location) return 'N/A';
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
};

// Helper function to format price
const formatPrice = (price: number | null) => {
  if (price === null || price === undefined) return 'N/A';
  return `$${price.toFixed(2)}`;
};

const AllAmbulances = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { ambulances, loading, error } = useSelector((state: RootState) => state.allAmbulances);

  // const ambulanceProviderId = useSelector((state: RootState) => state.ambulanceProviders.selectedProvider?.id); 
  const ambulanceProviderId = "c4ac7df8-1873-42db-97ba-8b240abc99df"

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

     useEffect(() => {
        if(!ambulances.length && ambulanceProviderId){
          dispatch(fetchAmbulances(ambulanceProviderId));
        }
      }, [dispatch, ambulances.length, ambulanceProviderId]);

  // useEffect(() => {
  //   dispatch(fetchAmbulances());
  // }, [dispatch]);

  // Transform API data to match table structure
  const transformedAmbulances = useMemo(() => {
    return ambulances.map(ambulance => ({
      id: ambulance.id,
      ambulance_id: ambulance.id.slice(-8).toUpperCase(), // Use last 8 chars as ID
      price_per_kilometer: formatPrice(ambulance.pricePerKm),
      Type: ambulance.amenities || 'General', // Using amenities as type for now
      plate_number: ambulance.plateNumber,
      location: formatLocation(ambulance.location),
      email: 'N/A', // Not in API, you might need to add this field
      address: ambulance.address || 'Address not specified',
      status: ambulance.status,
      base_rate_fee: formatPrice(ambulance.baseRateFee),
      rawData: ambulance, // Keep original data for actions
    }));
  }, [ambulances]);

  // Filter ambulances based on search term
  const filteredAmbulances = useMemo(() => {
    if (!searchTerm) return transformedAmbulances;
    
    return transformedAmbulances.filter(ambulance =>
      ambulance.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance.ambulance_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance.Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transformedAmbulances, searchTerm]);

  const totalPages = Math.ceil(filteredAmbulances.length / pageSize);
  const paginatedAmbulances = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAmbulances.slice(start, start + pageSize);
  }, [filteredAmbulances, page, pageSize]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'ambulance_id',
      header: 'Ambulance ID',
      cell: ({row}) => (
        <span className="font-medium">#{row.original.ambulance_id}</span>
      ),
    },
    {
      accessorKey: 'plate_number',
      header: 'Plate Number',
      cell: ({row}) => (
        <span className="font-semibold">{row.original.plate_number}</span>
      ),
    },
    {
      accessorKey: 'price_per_kilometer',
      header: 'Price per Kilometer',
    },
    {
      accessorKey: 'base_rate_fee',
      header: 'Base Rate Fee',
    },
    {
      accessorKey: 'Type',
      header: 'Type',
      cell: ({row}) => (
        <span className="capitalize">{row.original.Type}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({row}) => (
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.status === 'Available' 
              ? 'bg-green-100 text-green-800'
              : row.original.status === 'Unavailable'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({row}) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          {row.original.address}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      enableHiding: false,
      cell: ({row}) => {
        return (
          <div className="flex items-center gap-4">
            <div>
              <DriverDetails data={row.original.rawData} />
            </div>
            <div>
              <EditDriver data={row.original.rawData} />
            </div>
            <div>
              <Trash className="text-red-500 w-4 h-4 cursor-pointer" />
            </div>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: paginatedAmbulances,
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
         <Loader/>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">Error: {error}</div>
          <button 
            onClick={() => ambulanceProviderId && dispatch(fetchAmbulances(ambulanceProviderId))}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="lg:mx-8 mt-10 bg-white rounded-md flex flex-col h-[500px] mb-36">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <h1 className="text-xl text-gray-800">
                All Ambulances ({ambulances.length})
              </h1>

              <input
                type="text"
                placeholder="Search by plate, ID, type, or location"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border rounded-lg hidden lg:block px-4 py-2 lg:w-96 lg:max-w-2xl focus:outline-none"
              />
            </div>
            <div className="flex gap-4 items-center">
              <AddAmbulance />
            </div>
          </div>

          <div className="flex-1 overflow-auto lg:px-0 lg:mt-4">
            <Table className="min-w-[600px]">
              <TableHeader className="border border-[#CDE5F9]">
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
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <span className="font-medium">
                          No ambulances found
                        </span>
                        {searchTerm && (
                          <span className="text-sm text-gray-500">
                            No results for "{searchTerm}". Try different search terms.
                          </span>
                        )}
                        <AddAmbulance />
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
              totalEntriesSize={filteredAmbulances.length}
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

export default AllAmbulances;