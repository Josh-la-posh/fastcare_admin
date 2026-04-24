import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useMemo, useEffect} from 'react';

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
import AddDriver from '@/components/form/ambulance/drivers/add-drivers';
import EditDriver from '@/components/form/ambulance/drivers/edit-driver';
import DriverDetails from '@/features/modules/ambulance/driver-details';
import { AppDispatch, RootState } from '@/services/store';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchDrivers } from '@/services/thunks';
import { Loader } from '@/components/ui/loading';

const Drivers = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const dispatch = useDispatch<AppDispatch>();
  const { drivers, loading, error, metaData } = useSelector((state: RootState) => state.drivers);
  useEffect(() => {
    dispatch(fetchDrivers({
      Page: page,
      PageSize: 10,
      paginated: true,
    }));
  }, [dispatch, page]);

  // Safe data transformation - handle undefined/empty drivers
  const transformedDrivers = useMemo(() => {
    if (!drivers || !Array.isArray(drivers)) return [];
    
    return drivers.map(driver => ({
      id: driver.id,
      driver_id: driver.id?.slice(-8)?.toUpperCase() || 'N/A',
      name: driver.name,
      license: driver.certificationStatus,
      license_no: driver.licenseNumber,
      phone: driver.phoneNumber,
      email: driver.email,
      address: driver.address,
      date: '2023-01-01', 
      rawData: driver, // Keep original data for details
    }));
  }, [drivers]);

  const hasServerPagination = Boolean(metaData);
  const totalPages = metaData?.totalPages || Math.ceil(transformedDrivers.length / pageSize) || 1;
  const paginatedDrivers = useMemo(() => {
    if (hasServerPagination) return transformedDrivers;
    const start = (page - 1) * pageSize;
    return transformedDrivers.slice(start, start + pageSize);
  }, [hasServerPagination, transformedDrivers, page, pageSize]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Full Name',
    },
    {
      accessorKey: 'license',
      header: 'Certificate Status',
    },
    {
      accessorKey: 'license_no',
      header: 'Drivers License Number',
    },
    {
      accessorKey: 'phone',
      header: 'Phone Number',
    },
    {
      accessorKey: 'email',
      header: 'Email',
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
        const isEmptyRow = !row.original.id && !row.original.name;
        if (isEmptyRow) return null;
        
        return (
          <div className="flex items-center gap-4">
            <div>
              <DriverDetails data={row.original.rawData} />
            </div>
            <div>
              <EditDriver data={row.original.rawData} />
            </div>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: paginatedDrivers,
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
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">Error: {error}</div>
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
                All Drivers ({transformedDrivers.length})
              </h1>
            </div>
            <div className="flex gap-4 items-center">
              <AddDriver />
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
                        <span className="font-medium">No Drivers found</span>
                        <span className="text-sm text-gray-500">
                          All added Drivers will appear here
                        </span>
                        <AddDriver />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination stuck at bottom */}
          <div className="p-4 flex items-center justify-end">
            <Pagination
              totalEntriesSize={metaData?.totalCount || transformedDrivers.length}
           
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

export default Drivers;
