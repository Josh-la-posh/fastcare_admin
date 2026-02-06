import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

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
import {EyeIcon, Trash} from 'lucide-react';
import AddProviders from '@/components/form/ambulance/providers/add-provider';

import {fetchAmbulanceProviders} from '@/services/thunks';
import {AmbulanceProvider} from '@/types';
import {AppDispatch, RootState} from '@/services/store';
import {Loader} from '@/components/ui/loading';
import ProvidersDetails from '@/features/modules/ambulance/provider/provider-details';

const Providers = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {providers, loading, error} = useSelector(
    (state: RootState) => state.ambulance,
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAmbulanceProviders({page, pageSize}));
  }, [dispatch, page, pageSize]);

  const columns: ColumnDef<AmbulanceProvider>[] = [
    {accessorKey: 'registrationNumber', header: () => <span className="whitespace-nowrap">Registration Number</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('registrationNumber')}</span>},
    {accessorKey: 'address', header: () => <span className="whitespace-nowrap">Address</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('address')}</span>},
    {accessorKey: 'adminName', header: () => <span className="whitespace-nowrap">Admin Name</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('adminName')}</span>},
    {accessorKey: 'email', header: () => <span className="whitespace-nowrap">Company Email</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('email')}</span>},
    {accessorKey: 'phoneNumber', header: () => <span className="whitespace-nowrap">Phone Number</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('phoneNumber')}</span>},
    {accessorKey: 'serviceCharge', header: () => <span className="whitespace-nowrap">Service Charge</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('serviceCharge')}</span>},
    {
      id: 'action',
      header: () => <span className="whitespace-nowrap">Action</span>,
      enableHiding: false,
      cell: ({row}) => {
        if (!row.original.id && !row.original.adminName) return null;
        return (
          <div className="flex items-center gap-4">
            <EyeIcon
              onClick={() => {
                setSelectedProvider(row.original);
                setOpen(true);
              }}
              className="cursor-pointer w-4 h-4"
            />
            <Trash className="text-red-500 w-4 h-4 cursor-pointer" />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: providers,
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

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="lg:mx-8 mt-10 bg-white rounded-md flex flex-col  mb-36">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <h1 className="text-lg text-gray-800">All Providers</h1>
            <AddProviders />
          </div>

          <div className="flex-1 ">
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <Loader />
              </div>
            ) : error ? (
              <div className="p-6 text-red-500 text-center">{error}</div>
            ) : (
              <>
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
                              No ambulance provider found
                            </span>
                            <AddProviders />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* 🔹 API-driven Pagination */}
                <div className="p-4 flex items-center justify-end">
                  <Pagination
                    totalEntriesSize={100} // 🔹 Replace with API total count if available
                    currentPage={page}
                    totalPages={Math.ceil(100 / pageSize)} // 🔹 update with backend response
                    onPageChange={setPage}
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

        <ProvidersDetails
          open={open}
          setOpen={setOpen}
          data={selectedProvider}
        />
      </div>
    </DashboardLayout>
  );
};

export default Providers;