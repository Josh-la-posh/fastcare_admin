import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useMemo, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {ArrowDownLeft, Download} from 'lucide-react';
import claim from '/svg/claim.svg';
import approved from '/svg/approved.svg';
import disputed from '/svg/top.svg';
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
import Summary from '@/features/modules/marketing/summary';
import { MarketingFilter } from '@/features/modules/marketing/filter';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReferralSummary, fetchReferralCodes, exportReferralCodes, fetchReferralCodeById } from '@/services/thunks';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AppDispatch, RootState } from '@/services/store';
import { Loader } from '@/components/ui/loading';
import { StatsCards } from '@/components/ui/stats-card';

// Dynamic stats will be derived from referral summary endpoint

interface ReferralRow {
  id: string;
  referral_code: string; // original table accessor maintained
  name: string;          // referring staff name
  total: number;         // total users registered
  status: string;        // placeholder (API does not supply) -> '-'
  date?: string;
}

const MarketingCampaign = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { summary, codes, metaData, loadingSummary, loadingList, errorSummary, errorList } = useSelector((s: RootState) => s.referrals);

  const [searchTerm, setSearchTerm] = useState('');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  interface ColumnFilter { id: string; value: unknown }
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]); // retained for table internal needs (currently unused)
  const [codeFilter, setCodeFilter] = useState<string | undefined>(undefined);
  const [staffNameFilter, setStaffNameFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch summary once
  useEffect(() => { dispatch(fetchReferralSummary()); }, [dispatch]);
  // Fetch codes whenever pagination or search term changes
  useEffect(() => {
    dispatch(fetchReferralCodes({
      Page: page,
      PageSize: pageSize,
      StaffName: staffNameFilter || searchTerm || undefined,
      Code: codeFilter || undefined,
    }));
  }, [dispatch, page, pageSize, searchTerm, codeFilter, staffNameFilter]);

  // Map API codes to table rows
  const mappedRows: ReferralRow[] = useMemo(() => (
    codes.map(c => ({
      id: c.id,
      referral_code: c.code,
      name: (c.staffName || '-').trim(),
      total: c.totalUsersRegistered,
      status: '-', // API does not provide status for referral codes
    }))
  ), [codes]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return mappedRows;
    const term = searchTerm.toLowerCase();
    return mappedRows.filter(r => r.name.toLowerCase().includes(term) || r.referral_code.toLowerCase().includes(term));
  }, [mappedRows, searchTerm]);

  // If backend already paginates, we rely on metaData for pagination controls; filteredRows used only for in-memory search highlight.
  const paginatedProviders = filteredRows; // already paginated by server
  const totalPages = metaData?.totalPages || 1;

  const [detailOpen, setDetailOpen] = useState(false);
  const [pendingBase, setPendingBase] = useState<ReferralRow | null>(null);
  const { selected, loadingDetail } = useSelector((s: RootState) => s.referrals);

  const handleViewDetails = (row: ReferralRow) => {
    setPendingBase(row);
    // Fetch detail then open
    dispatch(fetchReferralCodeById(row.id))
      .unwrap()
      .then(() => setDetailOpen(true))
      .catch(() => {
        // You could set some error toast here; keep dialog closed
      });
  };

  const columns: ColumnDef<ReferralRow>[] = [
    {
      accessorKey: 'referral_code',
      header: 'Referral Code',
    },
    {
      accessorKey: 'name',
      header: 'Referring Staff Name',
    },

    {
      accessorKey: 'total',
      header: 'Total Users Registered',
    },

    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({getValue}) => {
        const value = getValue() as string; // ✅ cast from unknown to string
        const status = (value || '').toLowerCase();

        let statusClasses = ' py-1  text-md font-medium w-fit';

        if (status === 'approved' || status === 'active') {
          statusClasses += '  text-green-500';
        } else if (status === 'pending') {
          statusClasses += '  text-yellow-500';
        } else if (status === 'disputed') {
          statusClasses += '  text-red-500';
        } else {
          statusClasses += '  text-gray-500';
        }

        return <span className={statusClasses}>{value || '-'}</span>;
      },
    },

    {
      id: 'action',
      header: 'Action',
      enableHiding: false,
      cell: ({row}) => (
        <button
          type="button"
          onClick={() => handleViewDetails(row.original)}
          className="flex items-center justify-center gap-2 rounded-md bg-[#E4F1FC] px-3 py-2 font-semibold text-[#135E9B] focus:outline-none focus:ring-2 focus:ring-[#135E9B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
          disabled={loadingDetail && pendingBase?.id === row.original.id}
        >
          {loadingDetail && pendingBase?.id === row.original.id ? 'Loading...' : 'View Details'}
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: paginatedProviders,
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
  const handleApplyFilter = (filters: { Code?: string; StaffName?: string }) => {
    setCodeFilter(filters.Code);
    setStaffNameFilter(filters.StaffName);
    // table column filters not required for server filtering
  };
  const handleResetFilter = () => {
    setCodeFilter(undefined);
    setStaffNameFilter(undefined);
  };

  // Dynamic claimStats derived from summary; fallbacks for loading/error states
  const claimStats = [
    {
      id: 1,
      title: 'Total Referrals Used',
      value: loadingSummary ? '...' : (summary?.totalReferralCodeUsed ?? 0),
      borderColor: '#2f80ed',
      bgColor: 'rgba(80, 159, 239, 0.2)',
      icon: claim,
    },
    {
      id: 2,
      title: 'Most Used Code',
      value: loadingSummary ? '...' : (summary?.code ?? '-'),
      borderColor: '#0e9f2e',
      bgColor: 'rgba(14, 159, 46, 0.05)',
      icon: approved,
    },
    {
      id: 3,
      title: 'Top Performing Staff',
      value: loadingSummary ? '...' : (summary?.staffName?.trim() || '-'),
      borderColor: '#CFC923',
      bgColor: 'rgba(207, 201, 35, 0.05)',
      icon: disputed,
    },
  ];

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full ">
        <StatsCards stats={claimStats} error={!!errorSummary} />

        <div className="lg:mx-8 mt-10 bg-white mb-32 rounded-md flex flex-col ">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border rounded-lg hidden lg:block px-4 py-2 lg:w-96 lg:max-w-2xl focus:outline-none"
              />
            </div>
            <div className="flex gap-4 items-center">
              <MarketingFilter onApply={handleApplyFilter} onReset={handleResetFilter} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="py-2.5 w-44" disabled={loadingList}>
                    <ArrowDownLeft size={30} />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => {
                    // CSV (format 0)
                    dispatch(exportReferralCodes({ format: 0, Code: undefined, StaffName: searchTerm || undefined }))
                      .unwrap()
                      .then(p => {
                        const blob = p.blob as Blob;
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'referral-codes.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                      }).catch(()=>{});
                  }} className="cursor-pointer flex items-center gap-2"><Download size={14}/> CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    // Excel (format 1)
                    dispatch(exportReferralCodes({ format: 1, Code: undefined, StaffName: searchTerm || undefined }))
                      .unwrap()
                      .then(p => {
                        const blob = p.blob as Blob;
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'referral-codes.xlsx';
                        a.click();
                        URL.revokeObjectURL(url);
                      }).catch(()=>{});
                  }} className="cursor-pointer flex items-center gap-2"><Download size={14}/> Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 lg:px-0 mt-4">
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
                {loadingList && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex justify-center"><Loader height="h-20" /></div>
                    </TableCell>
                  </TableRow>
                )}
                {!loadingList && table.getRowModel().rows.length ? (
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
                ) : !loadingList ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{errorList ? 'Failed to load referral codes' : 'No data available'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          {/* Pagination stuck at bottom */}
          <div className="p-4 flex items-center justify-end ">
            <Pagination
              totalEntriesSize={metaData?.totalCount || filteredRows.length}
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
          <Summary
            open={detailOpen}
            onOpenChange={(o) => setDetailOpen(o)}
            base={pendingBase ? { id: pendingBase.id, referral_code: pendingBase.referral_code, status: pendingBase.status, date: pendingBase.date } : null}
            selected={selected}
            loadingDetail={loadingDetail}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MarketingCampaign;
