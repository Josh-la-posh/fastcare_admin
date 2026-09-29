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
import { activateDriver, deactivateDriver, fetchDrivers } from '@/services/thunks';
import { Loader } from '@/components/ui/loading';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import toast from 'react-hot-toast';
import StatusConfirmation from '@/features/modules/ambulance/status-confirmation';

const Drivers = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<{id: string; isActive: boolean} | null>(null);
  const pageSize = 10;

  const dispatch = useDispatch<AppDispatch>();
  const { drivers, loading, error, metaData } = useSelector((state: RootState) => state.drivers);
  useEffect(() => {
    dispatch(fetchDrivers({
      Page: page,
      PageSize: 10,
      paginated: true,
      isActive: statusFilter === 'active',
    }));
  }, [dispatch, page, statusFilter]);

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
      isActive: driver.isActive ?? statusFilter === 'active',
    }));
  }, [drivers, statusFilter]);

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    const {id, isActive} = statusTarget;
    setTogglingId(id);
    try {
      await dispatch(isActive ? deactivateDriver(id) : activateDriver(id)).unwrap();
      toast.success(`Driver ${isActive ? 'deactivated' : 'activated'} successfully`);
      setStatusTarget(null);
      await dispatch(fetchDrivers({Page: page, PageSize: pageSize, paginated: true, isActive: statusFilter === 'active'}));
    } catch (message) {
      toast.error(String(message));
    } finally {
      setTogglingId(null);
    }
  };

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
              <DriverDetails
                data={{...row.original.rawData, isActive: row.original.isActive}}
                statusUpdating={togglingId === row.original.id}
                onStatusAction={() => setStatusTarget({
                  id: row.original.id,
                  isActive: row.original.isActive,
                })}
              />
            </div>
            <div>
              <EditDriver data={row.original.rawData} />
            </div>
            <Button
              size="sm"
              variant={row.original.isActive ? 'destructive' : 'default'}
              disabled={togglingId === row.original.id}
              onClick={() => setStatusTarget({
                id: row.original.id,
                isActive: row.original.isActive,
              })}
            >
              {togglingId === row.original.id
                ? 'Updating...'
                : row.original.isActive ? 'Deactivate' : 'Activate'}
            </Button>
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
      <div className="bg-gray-100 overflow-visible min-h-full">
        <div className="lg:mx-8 mt-10 bg-white rounded-md flex flex-col mb-36">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <h1 className="text-xl text-gray-800">
                All Drivers ({transformedDrivers.length})
              </h1>
            </div>
            <div className="flex gap-4 items-center">
              <Select
                value={statusFilter}
                onValueChange={(value: 'active' | 'inactive') => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Deactivated</SelectItem>
                </SelectContent>
              </Select>
              <AddDriver />
            </div>
          </div>

          <div className="lg:px-0 lg:mt-4">
            <Table className="min-w-full">
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
        <StatusConfirmation
          open={Boolean(statusTarget)}
          setOpen={open => !open && setStatusTarget(null)}
          entityName="Driver"
          isActive={statusTarget?.isActive ?? true}
          loading={Boolean(togglingId)}
          onConfirm={handleStatusChange}
        />
      </div>
    </DashboardLayout>
  );
};

export default Drivers;
