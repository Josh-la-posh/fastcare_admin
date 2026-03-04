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
import {Download, Filter} from 'lucide-react';
import {Loader} from '@/components/ui/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const AllHospitals = () => {
  // const [searchTerm, setSearchTerm] = useState('');
  // const [activeSearch, setActiveSearch] = useState<string | undefined>(undefined);
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

  const [filterOpen, setFilterOpen] = useState(false);

  // applied filters (used for requests)
  const [hospitalNameFilter, setHospitalNameFilter] = useState('');
  const [hospitalCodeFilter, setHospitalCodeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [regFeeEnabledFilter, setRegFeeEnabledFilter] = useState<'all' | 'true' | 'false'>('all');

  // draft filters (edited in dialog; do not trigger requests)
  const [draftHospitalName, setDraftHospitalName] = useState('');
  const [draftHospitalCode, setDraftHospitalCode] = useState('');
  const [draftStatus, setDraftStatus] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [draftRegFeeEnabled, setDraftRegFeeEnabled] = useState<'all' | 'true' | 'false'>('all');

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

  // When dialog opens, seed draft filters from applied filters
  useEffect(() => {
    if (!filterOpen) return;
    setDraftHospitalName(hospitalNameFilter);
    setDraftHospitalCode(hospitalCodeFilter);
    setDraftStatus(statusFilter);
    setDraftRegFeeEnabled(regFeeEnabledFilter);
  }, [filterOpen, hospitalNameFilter, hospitalCodeFilter, statusFilter, regFeeEnabledFilter]);

  // Fetch hospitals whenever page/pageSize/applied-filters change
  useEffect(() => {
    dispatch(
      fetchHospitals({
        page,
        pageSize,
        hospitalName: hospitalNameFilter.trim() || undefined,
        hospitalCode: hospitalCodeFilter.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        isRegistrationFeeEnabled:
          regFeeEnabledFilter === 'all' ? undefined : regFeeEnabledFilter === 'true',
      })
    );
  }, [dispatch, page, pageSize, hospitalNameFilter, hospitalCodeFilter, statusFilter, regFeeEnabledFilter]);

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
            </div>
            <div className="flex gap-4 items-center">
              <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="py-2.5 w-12 rounded-md flex items-center justify-center" aria-label="Filter">
                    <Filter size={18} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      id="hospitalName"
                      label="Hospital Name"
                      placeholder="Hospital name"
                      value={draftHospitalName}
                      onChange={(e) => setDraftHospitalName(e.target.value)}
                    />
                    <Input
                      id="hospitalCode"
                      label="Hospital Code"
                      placeholder="Hospital code"
                      value={draftHospitalCode}
                      onChange={(e) => setDraftHospitalCode(e.target.value)}
                    />

                    <div className="flex flex-col gap-1">
                      <Label className="text-gray-700">Status</Label>
                      <Select
                        value={draftStatus}
                        onValueChange={(val) => setDraftStatus(val as 'all' | 'Active' | 'Inactive')}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* <div className="flex flex-col gap-1">
                      <Label className="text-gray-700">Registration Fee</Label>
                      <Select
                        value={draftRegFeeEnabled}
                        onValueChange={(val) => setDraftRegFeeEnabled(val as 'all' | 'true' | 'false')}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="true">Enabled</SelectItem>
                          <SelectItem value="false">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div> */}
                  </div>

                  <DialogFooter className="flex justify-end gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setHospitalNameFilter(draftHospitalName);
                        setHospitalCodeFilter(draftHospitalCode);
                        setStatusFilter(draftStatus);
                        setRegFeeEnabledFilter(draftRegFeeEnabled);
                        setPage(1);
                        setFilterOpen(false);
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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
