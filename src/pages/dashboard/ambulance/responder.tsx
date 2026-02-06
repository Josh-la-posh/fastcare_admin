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
import { Trash } from 'lucide-react';
import ResponderDetails from '@/features/modules/ambulance/responder-details';
import EditResponder from '@/components/form/ambulance/responder/edit-responder';
import AddResponder from '@/components/form/ambulance/responder/add-responder';
import { AppDispatch, RootState } from '@/services/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRespondents } from '@/services/thunks';
import { Loader } from '@/components/ui/loading';


const Responders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { respondents, loading, error } = useSelector((state: RootState) => state.respondents);


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

  // Transform respondents data to match your table structure
  const tableData = useMemo(() => {
    return respondents.map(respondent => ({
      id: respondent.id,
      res_id: respondent.id, 
      name: respondent.name,
      license: respondent.certificationStatus,
      prog_license: respondent.professionalLicense,
      phone: respondent.phoneNumber,
      email: respondent.email,
      address: respondent.address,
      date: '2023-01-01', 
      action: '',
    }));
  }, [respondents]);

  const totalPages = Math.ceil(tableData.length / pageSize);
  
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, page, pageSize]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'res_id',
      header: 'Responder ID',
    },
    {
      accessorKey: 'name',
      header: 'Full Name',
    },
    {
      accessorKey: 'license',
      header: 'Certification Status',
    },
    {
      accessorKey: 'prog_license',
      header: 'Professional License',
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
              <ResponderDetails data={row.original} />
            </div>
            <div>
              <EditResponder data={row.original} />
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
              <h1 className="text-xl text-gray-800">Created Responders</h1>
            </div>
            <div className="flex gap-4 items-center">
              <AddResponder />
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

export default Responders;