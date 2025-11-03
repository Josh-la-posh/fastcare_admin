import { DashboardLayout } from '@/layout/dashboard-layout';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
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

import { CheckerFilter } from '@/features/modules/checker/checker-filter';
import CheckerDetails from '@/features/modules/checker/checker-details';
import { InfoIcon, MoreVertical } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { fetchRefunds } from '@/services/thunks';
import { Refund } from '@/types';

interface CheckerFilters {
  status?: string;
  account?: string;
  startDate?: string;
  endDate?: string;
}

const Checkers = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters] = useState<import('@tanstack/react-table').ColumnFiltersState>([]);

  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Refund | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { refunds, loading, error, metaData } = useSelector((s: RootState) => s.refunds);

  // pagination (1-based)
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // persist API-level filters so paging reuses them
  const [apiFilters, setApiFilters] = useState<{ Status: number; PatientName?: string; Date?: string }>({
    Status: 1, // Pending for checker view
  });

  // Fetch whenever page/pageSize/apiFilters change
  useEffect(() => {
    dispatch(fetchRefunds({ ...apiFilters, Page: pageNumber, PageSize: pageSize }));
  }, [dispatch, apiFilters, pageNumber, pageSize]);
  // Show only pending in the table (server already returns Status=1, but it’s safe)
  const data: Refund[] = useMemo(
    () => (refunds || []).filter((r) => (r.status || '').toLowerCase() === 'pending'),
    [refunds]
  );

  const columns: ColumnDef<Refund>[] = [
    { accessorKey: 'patientName', header: 'Name' },
    {
      accessorKey: 'requestDate',
      header: 'Request Date',
      filterFn: (row, id, filterValue) => {
        const raw = row.getValue(id) as string | Date | undefined;
        const rowDate = raw ? new Date(raw) : null;
        const start = filterValue?.start ? new Date(filterValue.start) : null;
        const end = filterValue?.end ? new Date(filterValue.end) : null;
        if (!rowDate || isNaN(rowDate.getTime())) return false;
        if (start && rowDate < start) return false;
        if (end && rowDate > end) return false;
        return true;
      },
      cell: ({ getValue }) => {
        const raw = getValue() as string | Date | undefined;
        if (!raw) return '-';
        const d = new Date(raw);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
      },
    },
    { accessorKey: 'refundReference', header: 'Refund Reference' },
    { accessorKey: 'refundAmount', header: 'Refund Amount' },
    // { accessorKey: 'walletNumber', header: 'Wallet ID' },
    { accessorKey: 'refundReason', header: 'Refund Reason' },
    {
      accessorKey: 'disputeDate',
      header: 'Dispute Date',
      cell: ({ getValue }) => {
        const raw = getValue() as string | Date | undefined;
        if (!raw) return '-';
        const d = new Date(raw);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = (getValue() as string) || '-';
        const s = value.toLowerCase();
        let cls = 'py-1 text-md font-semibold w-fit';
        if (s === 'successful' || s === 'approved') cls += ' text-green-700';
        else if (s === 'pending') cls += ' text-yellow-600';
        else if (s === 'disputed' || s === 'failed') cls += ' text-red-800';
        else cls += ' text-gray-500';
        return <span className={cls}>{value}</span>;
      },
    },
    {
      id: 'action', // <-- keep this 'action' (not 'actions')
      header: 'Action',
      enableHiding: false,
      cell: ({ row }) => {
        const refund = row.original;
        const openDetails = () => {
          const mapped = {
            id: refund.id,
            refundReason: refund.refundReason,
            refundAmount: refund.refundAmount,
            requestDate: refund.requestDate,
            disputeDate: refund.disputeDate,
            refundReference: refund.refundReference,
            status: refund.status,
            transactionId: refund.transactionId,
            walletNumber: refund.walletNumber,
            patientName: refund.patientName,
            patientId: refund.patientId || undefined,
            approver: refund.approver || undefined,
            createdBy: refund.createdBy || undefined,
            document: refund.document || undefined,
          } as unknown as Refund;
          setSelectedTransaction(mapped);
          setOpen(true);
        };

        return (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="Row actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-neutral-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[180px]"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetails();
                  }}
                  className="cursor-pointer gap-2"
                >
                  <InfoIcon className="h-4 w-4 text-neutral-600" />
                  <span>View details</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable<Refund>({
    data,
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
  onColumnFiltersChange: () => {},
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  /** Build CSV for current page rows */
  const exportCurrentPageCSV = useCallback(() => {
    const headers = [
      'Request Date',
      'Refund Reference',
      'Refund Amount',
      'Wallet ID',
      'Refund Reason',
      'Dispute Date',
      'Status',
    ];

    const rows = table.getRowModel().rows.map((r) => {
      const x = r.original;
      const d1 = x.requestDate ? new Date(x.requestDate) : null;
      const d2 = x.disputeDate ? new Date(x.disputeDate) : null;
      return [
        d1 && !isNaN(d1.getTime()) ? d1.toLocaleDateString() : '',
        x.refundReference ?? '',
        x.refundAmount ?? '',
        x.walletNumber ?? '',
        (x.refundReason ?? '').toString().replace(/\r?\n/g, ' '),
        d2 && !isNaN(d2.getTime()) ? d2.toLocaleDateString() : '',
        x.status ?? '',
      ];
    });

    const csv =
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => {
              const s = String(cell ?? '');
              // Wrap in quotes if contains comma/quote/newline
              if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
              return s;
            })
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-refunds-page-${pageNumber}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [table, pageNumber]);

  const handleApplyFilter = (filters: CheckerFilters) => {
    const api: { Status: number; PatientName?: string; Date?: string } = { Status: 1 };
    if (filters.account) api.PatientName = filters.account.trim();
    if (filters.startDate) api.Date = filters.startDate;
    setApiFilters(api);
    setPageNumber(1);
  };

  const handleResetFilter = () => {
    setApiFilters({ Status: 1 });
    setPageNumber(1);
  };

  return (
    <DashboardLayout>
      {/* Content restored below */}
      {!(data.length > 0) && !loading && !error ? (
        <div className="flex h-[70vh] flex-col items-center justify-center">
          <p className="text-lg font-semibold text-gray-800">You have no initiated a refund yet</p>
          <p className="mt-2 mb-6 text-gray-500">All refund appears here</p>
        </div>
      ) : (
        <div className="h-full overflow-auto bg-gray-200">
          <div className="mx-8 mt-10 rounded-md bg-white p-6">
            <CheckerFilter onApply={handleApplyFilter} onReset={handleResetFilter} />
          </div>

          <div className="mx-0 lg:mx-8 mt-10 mb-32 flex flex-col rounded-md bg-white pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-8">
                <h1 className="text-xl text-gray-800">Pending Refund Requests</h1>
                {metaData && (
                  <span className="text-sm text-gray-500">
                    Showing {(metaData.currentPage - 1) * metaData.pageSize + 1} -{' '}
                    {Math.min(metaData.currentPage * metaData.pageSize, metaData.totalCount)} of{' '}
                    {metaData.totalCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-44 py-2.5">
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {/* Radix uses onSelect for menu items */}
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={exportCurrentPageCSV}
                      disabled={!data.length}
                    >
                      Current page (CSV)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-4 flex-1 overflow-auto px-6 lg:px-0">
              {loading && <div className="p-6 text-sm text-gray-500">Loading refunds...</div>}
              {error && !loading && <div className="p-6 text-sm text-red-600">{error}</div>}

              {!loading && !error && (
                <Table className="min-w-[600px]">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>

                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedTransaction(row.original);
                            setOpen(true);
                          }}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={cell.column.id === 'action' ? 'text-right' : ''}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">No data available</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {metaData && (
              <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t px-6 pb-4 pt-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 text-sm">
                  <button
                    disabled={!metaData.hasPrevious || loading}
                    onClick={() => metaData.hasPrevious && setPageNumber((p) => Math.max(1, p - 1))}
                    className="rounded border px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-gray-600">
                    Page {metaData.currentPage} of {metaData.totalPages}
                  </span>
                  <button
                    disabled={!metaData.hasNext || loading}
                    onClick={() => metaData.hasNext && setPageNumber((p) => p + 1)}
                    className="rounded border px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <label htmlFor="pageSize" className="text-gray-600">
                    Rows per page:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageNumber(1);
                    }}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    {[10, 20, 30, 50].map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <CheckerDetails open={open} setOpen={setOpen} data={selectedTransaction} />
    </DashboardLayout>
  );
};

export default Checkers;
