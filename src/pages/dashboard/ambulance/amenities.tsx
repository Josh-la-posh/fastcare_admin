import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useEffect} from 'react';

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
import CreateAmenities from '@/components/form/ambulance/amenities/create-amenities';
import EditAmenities from '@/components/form/ambulance/amenities/edit-amenities';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/services/store';
import { fetchAmenities } from '@/services/thunks';
import { Loader } from '@/components/ui/loading';


const Amenities = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const dispatch = useDispatch<AppDispatch>();
  const { amenities, loading, error, metaData } = useSelector((state: RootState) => state.amenities);
  const ambulanceProviderId = useSelector((state: RootState) => state.ambulanceProviders.selectedProvider?.id);
  const userRole = useSelector((state: RootState) => state.auth.user?.userRole);
  const isAmbulanceProviderAdmin = userRole === 'AmbulanceProviderAdmin';

  useEffect(() => {
    if (isAmbulanceProviderAdmin || ambulanceProviderId) {
      dispatch(fetchAmenities({
        ambulanceProviderId,
        Page: page,
        PageSize: pageSize,
      }));
    }
  }, [dispatch, ambulanceProviderId, isAmbulanceProviderAdmin, page, pageSize]);

  // Define columns and table data regardless of loading state
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name', 
      header: 'Equipment Name', 
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'action',
      header: 'Action',
      enableHiding: false,
      cell: ({row}) => {
        const amenityName = row.original.name ?? row.original.equipmentName;
        const isEmptyRow = !amenityName && !row.original.description;
        if (isEmptyRow) {
          return null; 
        }
        return (
          <div className="flex items-center gap-4">
            <div>
              <EditAmenities data={row.original} />
            </div>
          </div>
        );
      },
    },
  ];

  const totalPages = metaData?.totalPages || 1;

  // Call useReactTable unconditionally - use empty data when not available
  const table = useReactTable({
    data: amenities || [],
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

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader/>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="text-red-500 p-4 text-center">
          Error: {error}
        </div>
      </DashboardLayout>
    );
  }

  // Show no provider selected state
  if (!ambulanceProviderId && !isAmbulanceProviderAdmin) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">
            Please select an ambulance provider first
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full ">
        <div className="lg:mx-8 mt-10 bg-white  rounded-md flex flex-col h-[500px] mb-36">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <h1 className="text-xl text-gray-800">All Amenities</h1>
            </div>
            <div className="flex gap-4 items-center">
              <CreateAmenities />
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
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="font-medium">
                          No ambulance amenities found
                        </span>
                        <span className="font-medium">
                          All added amenities appear here
                        </span>
                        <CreateAmenities />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 flex items-center justify-end">
            <Pagination
              totalEntriesSize={metaData?.totalCount || amenities.length}
          
              currentPage={metaData?.currentPage || page}
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

export default Amenities;
