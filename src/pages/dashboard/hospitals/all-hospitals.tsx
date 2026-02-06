import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useMemo, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

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
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {Pagination} from '@/components/ui/pagination';
import AddHospital from '@/components/form/hospitals/add-hospital';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/services/store';
import {fetchHospitals, exportHospitals} from '@/services/thunks';
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from '@/components/ui/dropdown-menu';
import {Download} from 'lucide-react';
import {Loader} from '@/components/ui/loading';

export const AllHospitals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  interface HospitalRow {
    sn: number;
    code: string;
    name: string;
    email: string;
    hospitalAddress: string;
    clinic_no: number;
    ip: string;
    date?: string | null;
    id: string | number;
  }
  // Server-side pagination state (1-based page for backend)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // get hospitals from redux
  const {hospitals, loading, error, totalCount, totalPages, currentPage, pageSize: storePageSize} = useSelector(
    (state: RootState) => state.hospitals,
  );

  // Sync local pageSize with store (in case backend overrides)
  useEffect(() => {
    if (storePageSize && storePageSize !== pageSize) {
      setPageSize(storePageSize);
    }
  }, [storePageSize, pageSize]);

  // Fetch hospitals whenever page or pageSize changes
  useEffect(() => {
    dispatch(fetchHospitals({ page, pageSize, search: activeSearch }));
  }, [dispatch, page, pageSize, activeSearch]);

  // map into table data
  const mappedHospitals = useMemo(() => {
    // Ensure hospitals is an array before mapping
    if (!hospitals || !Array.isArray(hospitals)) {
      return [];
    }
    
    // Server-side search now, so no client filtering
    return hospitals.map((item, index) => ({
      sn: index + 1 + (page - 1) * pageSize,
      code: item.hospitalCode || '',
      name: item.hospitalName || '',
      email: item.email || '--',
      hospitalAddress: item.address || '--',
      clinic_no: Number(item.hospitalNumber) || 0,
      ip: item.hospitalAddresses
        ? item.hospitalAddresses.length > 15
          ? item.hospitalAddresses.slice(0, 15) + '...'
          : item.hospitalAddresses
        : '--',
      date: item.date,
      id: item.id,
    }));
  }, [hospitals, page, pageSize]);

  const columns: ColumnDef<HospitalRow>[] = [
    {accessorKey: 'sn', header: () => <span className="whitespace-nowrap">S/N</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('sn')}</span>},
    {accessorKey: 'code', header: () => <span className="whitespace-nowrap">Hospital Code</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('code')}</span>},
    {accessorKey: 'name', header: () => <span className="whitespace-nowrap">Hospital Name</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('name')}</span>},
    {accessorKey: 'email', header: () => <span className="whitespace-nowrap">Email</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('email')}</span>},
    {accessorKey: 'hospitalAddress', header: () => <span className="whitespace-nowrap">Hospital Address</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('hospitalAddress')}</span>},
    {accessorKey: 'clinic_no', header: () => <span className="whitespace-nowrap">No. Clinics</span>, cell: ({row}) => <span className="whitespace-nowrap">{row.getValue('clinic_no')}</span>},
    // {accessorKey: 'ip', header: 'Ip Address'},
    {
      id: 'action',
      enableHiding: false,
      cell: ({row}) => {
        if (!row.original.id && !row.original.name) return null;
        return (
          <div
            onClick={() => navigate(`/hospitals/details/${row.original.id}`)}
            className="flex text-center justify-center text-sm whitespace-nowrap cursor-pointer font-semibold items-center gap-2 bg-[#E4F1FC] p-2 rounded-md text-[#135E9B]"
          >
            View Details
          </div>
        );
      },
    },
  ];

  // Client-side table (no internal pagination since server-side is used)
  const table = useReactTable({
    data: mappedHospitals,
    columns,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="lg:mx-8 mt-10 bg-white rounded-md flex flex-col mb-36">
          {/* Header */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <h1 className="text-lg text-gray-800">All Hospitals</h1>
              <div className="hidden lg:flex lg:items-center lg:gap-3">
                <div className="lg:w-96 lg:max-w-2xl">
                  <Input
                    label="Search Hospital Name"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        setPage(1);
                        setActiveSearch(searchTerm.trim() || undefined);
                      }
                    }}
                    fullWidth
                  />
                </div>
                <Button
                  onClick={() => {
                    setPage(1);
                    setActiveSearch(searchTerm.trim() || undefined);
                  }}
                  disabled={loading}
                  className="mt-6"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <AddHospital />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="py-2.5 w-36 rounded-md flex items-center gap-2">
                    <Download size={16} /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    dispatch(exportHospitals({format: 0}))
                      .unwrap()
                      .then(payload => {
                        const blob = payload.blob as Blob;
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'hospitals.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                      })
                      .catch(() => {/* error handled via rejectWithValue */});
                  }}>CSV</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    dispatch(exportHospitals({format: 1}))
                      .unwrap()
                      .then(payload => {
                        const blob = payload.blob as Blob;
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'hospitals.xlsx';
                        a.click();
                        URL.revokeObjectURL(url);
                      })
                      .catch(() => {/* swallow - state can reflect error */});
                  }}>Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div>
            {loading ? (
              <div className="flex items-center justify-center h-screen">
                <Loader />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-10">
                Failed to load hospitals: {error}
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="flex-1 lg:px-0 lg:mt-4">
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
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                              <TableCell key={cell.id}>
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
                            <div className="flex flex-col items-center gap-4">
                              <span className="font-medium">
                                You have no hospital
                              </span>
                              <span className="font-medium">
                                All your hospitals appear here
                              </span>
                              <AddHospital />
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
                    totalEntriesSize={totalCount ?? hospitals.length}
                    currentPage={currentPage ?? page}
                    totalPages={totalPages ?? 1}
                    pageSize={pageSize}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
