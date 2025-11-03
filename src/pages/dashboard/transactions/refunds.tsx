import {DashboardLayout} from '@/layout/dashboard-layout';
import {useEffect, useMemo, useState} from 'react';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from '@/components/ui/dropdown-menu';
import {Download} from 'lucide-react';
//import {ArrowDownLeft, Edit2Icon, InfoIcon, MoreVertical} from 'lucide-react';

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
  useReactTable,
} from '@tanstack/react-table';

// Removed duplicate dropdown import (consolidated at top)

//import {Pagination} from '@/components/ui/pagination';

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

import { RefundFilter } from '@/features/modules/transactions/refunds/refunds-filter';
import InitiateARefund from '@/components/form/transactions/initiate-refund';
import RefundDetails from '@/features/modules/transactions/refunds/refunds-details';
import { InfoIcon, MoreVertical } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { fetchRefunds, exportRefunds } from '@/services/thunks';
import { Pagination } from '@/components/ui/pagination';
import { Loader } from '@/components/ui/loading';
import type { Refund } from '@/types';

interface RefundRow {
  id: number;
  transaction_id: string;
  name: string;
  reason: string;
  amount: string; // formatted
  status: string;
  date: string;
}

const mapRefundToRow = (r: Refund): RefundRow => ({
  id: r.id,
  transaction_id: r.transactionId,
  name: r.patientName || '-',
  reason: r.refundReason,
  amount: String(r.refundAmount ?? 0), // raw numeric value as string
  status: r.status || '-', // preserve backend casing
  date: r.requestDate,
});

const Refunds = () => {
  //const [searchTerm, setSearchTerm] = useState('');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RefundRow | undefined>(undefined);

  //const [page, setPage] = useState(1);
  //const [pageSize, setPageSize] = useState(10);

  //   const filteredClaims = transactions.filter(
  //     item =>
  //       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       item.claim_id.toLowerCase().includes(searchTerm.toLowerCase()),
  //   );

  //   const totalPages = Math.ceil(filteredClaims.length / pageSize);
  //   const paginatedProviders = useMemo(() => {
  //     const start = (page - 1) * pageSize;
  //     return filteredClaims.slice(start, start + pageSize);
  //   }, [filteredClaims, page]);

  const dispatch = useDispatch<AppDispatch>();
  const { refunds, loading, error, metaData, exporting } = useSelector((s: RootState) => s.refunds);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, unknown>>({});
  const hasAppliedFilters = useMemo(() => {
    return Object.values(appliedFilters).some(v => v !== undefined && v !== null && v !== '');
  }, [appliedFilters]);

  useEffect(() => {
    dispatch(fetchRefunds({
      Page: page,
      PageSize: pageSize,
      Status: appliedFilters.status as number | undefined,
      PatientName: appliedFilters.patient as string | undefined,
      Date: appliedFilters.startDate as string | undefined,
    }));
  }, [dispatch, page, pageSize, appliedFilters]);

  const mappedRefunds = useMemo(() => Array.isArray(refunds) ? refunds.map(mapRefundToRow) : [], [refunds]);

  const columns: ColumnDef<RefundRow>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      filterFn: (row, id, filterValue) => {
        const rowDate = new Date(row.getValue(id));
        const start = filterValue?.start ? new Date(filterValue.start) : null;
        const end = filterValue?.end ? new Date(filterValue.end) : null;

        if (start && rowDate < start) return false;
        if (end && rowDate > end) return false;
        return true;
      },
    },
    {
      accessorKey: 'transaction_id',
      header: 'Transaction ID',
    },

    {
      accessorKey: 'name',
      header: 'Patient Name',
    },
    {
      accessorKey: 'amount',
      header: 'Refund Amount',
      cell: ({ getValue }) => {
        const raw = getValue() as string;
        // Display backend raw numeric; optionally format later if needed
        return <span>{raw}</span>;
      }
    },
    {
      accessorKey: 'reason',
      header: 'Dispute Reason',
    },  
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({getValue}) => {
        const value = getValue() as string; // ✅ cast from unknown to string
        const status = (value || '').toLowerCase();

        let statusClasses = ' py-1  text-md font-semibold w-fit';

        if (status === 'successful' || status === 'approved') {
          statusClasses += '  text-green-700';
        } else if (status === 'pending') {
          statusClasses += '  text-yellow-600';
        } else if (status === 'disputed' || status === 'failed') {
          statusClasses += '  text-red-800';
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
      cell: ({ row }) => {

          // Check if row is empty
          const isEmptyRow = !row.original.id && !row.original.name;

          if (isEmptyRow) {
              return null; // nothing rendered for empty row
          }
          return (
              <div className="flex text-center justify-start items-center gap-2">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <MoreVertical className="text-neutral-400 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem
                              onClick={() => {
                            setSelectedTransaction(row.original); // save row data
                            setOpen(true);
                          }}
                          >
                            <InfoIcon className="text-neutral-600" />
                            View details
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>

              </div>
          );
      },
    },
  ];

  const table = useReactTable({
    data: mappedRefunds,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Server-side filtering only (removed client columnFilters)
  const handleApplyServerFilter = (filters: Record<string, unknown>) => {
    setAppliedFilters(filters);
    setPage(1);
  };
  const handleResetServerFilter = () => {
    setAppliedFilters({});
    setPage(1);
  };

  const hasData = mappedRefunds.length > 0 && !loading;
  const isCompletelyEmpty = !loading && mappedRefunds.length === 0 && !hasAppliedFilters;
  const isFilteredEmpty = !loading && mappedRefunds.length === 0 && hasAppliedFilters;

  return (
    <DashboardLayout>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          {loading ? (
            <Loader height="h-40" />
          ) : isFilteredEmpty ? (
            <>
              <p className="text-lg font-semibold text-gray-800">No results for your current filters</p>
              <p className="text-gray-500 mt-2 mb-6">Adjust the filters or reset to view all refunds.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline" onClick={handleResetServerFilter}>Reset Filters</Button>
                <InitiateARefund />
              </div>
              {metaData && (
                <p className="text-xs text-gray-400 mt-4">Server returned 0 of {metaData.totalCount} total matching entries.</p>
              )}
            </>
          ) : isCompletelyEmpty ? (
            <>
              <p className="text-lg font-semibold text-gray-800">No refunds have been initiated</p>
              <p className="text-gray-500 mt-2 mb-6">Once refunds are created they will appear here.</p>
              <InitiateARefund />
            </>
          ) : null}
        </div>
      ) : (
        <div className="bg-gray-200 overflow-scroll h-full ">
          <div className="bg-white p-6 rounded-md flex justify-between items-center mx-8 mt-10">
            <RefundFilter
              onApply={handleApplyServerFilter}
              onReset={handleResetServerFilter}
            />
          </div>

          <div className="lg:mx-8 mt-10 bg-white mb-32 pb-10 rounded-md flex flex-col">
            <div className="flex flex-wrap gap-4 justify-between items-center p-6">
              <div className="flex items-center gap-8">
                <h1 className="text-xl text-gray-800">All Refunds</h1>
              </div>
              <div className="flex gap-4 items-center">
                <InitiateARefund />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" disabled={exporting} className="py-2.5 w-44 flex items-center gap-2">
                      <Download size={18}/> {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    dispatch(exportRefunds({ format: 0, status: appliedFilters.status as number | undefined, PatientName: appliedFilters.patient as string | undefined, Date: appliedFilters.startDate as string | undefined }))
                      .then(res => {
                        const action = res as { payload?: { blob: Blob; params: { format: number } } };
                        if (action.payload?.blob) {
                          const blob = action.payload.blob;
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'refunds_export.csv';
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        }
                      });
                  }}>CSV</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    dispatch(exportRefunds({ format: 1, status: appliedFilters.status as number | undefined, PatientName: appliedFilters.patient as string | undefined, Date: appliedFilters.startDate as string | undefined }))
                      .then(res => {
                        const action = res as { payload?: { blob: Blob; params: { format: number } } };
                        if (action.payload?.blob) {
                          const blob = action.payload.blob;
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'refunds_export.xlsx';
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        }
                      });
                    }}>Excel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {loading && <Loader height="h-40" />}
            {error && !loading && <div className="text-red-500 px-6">{error}</div>}
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
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow
                        key={row.id}
                          className="cursor-pointer hover:bg-gray-100"
                        // onClick={() => {
                        //   setSelectedTransaction(row.original); // save row data
                        //   setOpen(true);
                        // }}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell
                            key={cell.id}
                            className={cell.column.id === 'actions' ? 'text-right' : ''}
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
                          <span className="font-medium">No data available</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {metaData && (
              <div className="p-4 flex items-center justify-end">
                <Pagination
                  totalEntriesSize={metaData.totalCount}
                  currentPage={metaData.currentPage || page}
                  totalPages={metaData.totalPages || 1}
                  onPageChange={setPage}
                  pageSize={pageSize}
                  onPageSizeChange={(size: number) => { setPageSize(size); setPage(1);} }
                />
              </div>
            )}

            {/* Pagination stuck at bottom */}
            {/* <div className="p-4 flex items-center justify-end ">
            <Pagination
              totalEntriesSize={filteredClaims.length}
              currentEntriesSize={paginatedProviders.length}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={size => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div> */}
          </div>
        </div>
      )}

       {/* transaction details modal */}
      <RefundDetails open={open} setOpen={setOpen} data={selectedTransaction} />
    </DashboardLayout>
  );
};

export default Refunds;
