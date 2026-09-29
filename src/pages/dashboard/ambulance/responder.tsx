import { DashboardLayout } from '@/layout/dashboard-layout';
import { useState, useMemo, useEffect } from 'react'; // Added useEffect
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
import { Pagination } from '@/components/ui/pagination';
import ResponderDetails from '@/features/modules/ambulance/responder-details';
import EditResponder from '@/components/form/ambulance/responder/edit-responder';
import AddResponder from '@/components/form/ambulance/responder/add-responder';
import { AppDispatch, RootState } from '@/services/store';
import { useDispatch, useSelector } from 'react-redux';
import { activateRespondent, deactivateRespondent, fetchRespondents } from '@/services/thunks';
import { Loader } from '@/components/ui/loading';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import toast from 'react-hot-toast';
import StatusConfirmation from '@/features/modules/ambulance/status-confirmation';


const Responders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { respondents, loading, error, metaData } = useSelector((state: RootState) => state.respondents);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<{id: string; isActive: boolean} | null>(null);
  const pageSize = 10;

  useEffect(() => {
    dispatch(
      fetchRespondents({
        Page: page,
        PageSize: 10,
        paginated: true,
        isActive: statusFilter === 'active',
      }),
    );
  }, [dispatch, page, statusFilter]);

  // Transform respondents data to match your table structure
  const tableData = useMemo(() => {
    return respondents.map(respondent => ({
      id: respondent.id,
      res_id: respondent.id, 
      name: respondent.name,
      license: respondent.certificationStatus,
      professionalLicense: respondent.professionalLicense,
      phoneNumber: respondent.phoneNumber,
      email: respondent.email,
      address: respondent.address,
      date: '2023-01-01', 
      action: '',
      isActive: respondent.isActive ?? statusFilter === 'active',
    }));
  }, [respondents, statusFilter]);

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    const {id, isActive} = statusTarget;
    setTogglingId(id);
    try {
      await dispatch(isActive ? deactivateRespondent(id) : activateRespondent(id)).unwrap();
      toast.success(`Respondent ${isActive ? 'deactivated' : 'activated'} successfully`);
      setStatusTarget(null);
      await dispatch(fetchRespondents({Page: page, PageSize: pageSize, paginated: true, isActive: statusFilter === 'active'}));
    } catch (message) {
      toast.error(String(message));
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = metaData?.totalPages || 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Full Name',
    },
    {
      accessorKey: 'license',
      header: 'License Status',
    },
    {
      accessorKey: 'professionalLicense',
      header: 'Professional License',
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          {row.original.address}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      enableHiding: false,
      cell: ({ row }) => {
        const isEmptyRow = !row.original.id && !row.original.name;
        if (isEmptyRow) {
          return null;
        }
        return (
          <div className="flex items-center gap-4">
            <div>
              <ResponderDetails
                data={row.original}
                statusUpdating={togglingId === row.original.id}
                onStatusAction={() => setStatusTarget({
                  id: row.original.id,
                  isActive: row.original.isActive,
                })}
              />
            </div>
            <div>
              <EditResponder data={row.original} />
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
    data: tableData,
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
              <h1 className="text-xl text-gray-800">Created Responders</h1>
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
              <AddResponder />
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
                      <div className="flex flex-col items-center">
                        <span className="font-medium">
                          No respondents found
                        </span>
                        <span className="font-medium">
                          All added respondents will appear here
                        </span>
                        <AddResponder />
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
              totalEntriesSize={metaData?.totalCount || tableData.length}

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
          entityName="Respondent"
          isActive={statusTarget?.isActive ?? true}
          loading={Boolean(togglingId)}
          onConfirm={handleStatusChange}
        />
      </div>
    </DashboardLayout>
  );
};

export default Responders;
