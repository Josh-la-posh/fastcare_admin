import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useEffect} from 'react';

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
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import clsx from 'clsx';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { fetchAppFeedbacks, exportAppFeedbacks } from '@/services/thunks';
import { setFeedbackPage, setFeedbackPageSize } from '@/services/slice/appFeedbackSlice';

const Feedbacks = () => {
  //   const [searchTerm, setSearchTerm] = useState('');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, metaData, filters, exporting } = useSelector((s: RootState) => s.appFeedback);
  const page = filters.Page || 1;
  const pageSize = filters.PageSize || 10;

  useEffect(() => { dispatch(fetchAppFeedbacks({ Page: page, PageSize: pageSize })); }, [dispatch, page, pageSize]);

  //   const filteredProviders = hospitals.filter(item =>
  //     item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  //   );

  const totalPages = metaData?.totalPages || 1;

  const columns: ColumnDef<{ creationDate: string; patientName: string; patientId: string; rating: number; feedbackCategory: string; comment: string }>[] = [
    {
      accessorKey: 'creationDate',
      header: 'Date',
      cell: ({ getValue }) => {
        const raw = getValue<string>();
        return raw?.includes('T') ? raw.split('T')[0] : raw;
      }
    },

    {
      accessorKey: 'patientName', // patient name
      header: 'Patient name',
    },
    {
      accessorKey: 'patientId',
      header: 'Patient ID',
    },
    {
  accessorKey: 'rating',
      header: 'Rating',
       cell: ({ row }) => {
                const rating = row.getValue<number>('rating') || 0;
                return (
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={clsx(
                                    'w-4 h-4',
                                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                )}
                            />
                        ))}
                    </div>
                );
            },
    },
    {
      accessorKey: 'feedbackCategory',
      header: 'Category',
    },
     {
      accessorKey: 'comment',
      header: 'Comment',
    },
  ];

  const table = useReactTable({
  data: list,
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
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Function to apply filters from FilterDialog
  //   const handleApplyFilter = (filters: any) => {
  //     const newFilters: any[] = [];
  //     if (filters.status) newFilters.push({id: 'status', value: filters.status});
  //     if (filters.location)
  //       newFilters.push({id: 'location', value: filters.location});
  //     if (filters.ranking)
  //       newFilters.push({id: 'ranking', value: filters.ranking});
  //     if (filters.date) newFilters.push({id: 'date', value: filters.date}); // make sure your data has a 'date' field
  //     setColumnFilters(newFilters);
  //   };
  // Function to reset filters
  //   const handleResetFilter = () => {
  //     setColumnFilters([]);
  //   };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full ">
        <div className="lg:mx-8 mt-10 bg-white  rounded-md flex flex-col h-[500px] mb-36">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <h1 className="text-xl text-gray-800">{metaData?.totalCount || list.length} Feedbacks</h1>

              {/* <input
                type="text"
                placeholder="Search hospital"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border rounded-lg hidden lg:block px-4 py-2 lg:w-96 lg:max-w-2xl focus:outline-none"
              /> */}
            </div>
            <div className="flex gap-4 items-center">
              <Button
                variant="ghost"
                className="py-2.5 w-36 rounded-md"
                disabled={exporting || !list.length}
                onClick={async () => {
                  try {
                    const res = await dispatch(exportAppFeedbacks({ format: 0 })).unwrap();
                    const { blob } = res as { blob: Blob };
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'app-feedback.csv';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch (e) { console.error(e); }
                }}
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
              <Button
                variant="ghost"
                className="py-2.5 w-36 rounded-md"
                disabled={exporting || !list.length}
                onClick={async () => {
                  try {
                    const res = await dispatch(exportAppFeedbacks({ format: 1 })).unwrap();
                    const { blob } = res as { blob: Blob };
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'app-feedback.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch (e) { console.error(e); }
                }}
              >
                {exporting ? 'Exporting...' : 'Export Excel'}
              </Button>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-gray-500">Loading feedbacks...</TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map(cell => (
                        <>
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
                        </>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-red-600 text-sm">{error}</TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          You have no feedback yet
                        </span>
                        <span className="font-medium">
                          All feedbacks appears here
                        </span>
                        
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
              totalEntriesSize={metaData?.totalCount || list.length}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => dispatch(setFeedbackPage(p))}
              pageSize={pageSize}
              onPageSizeChange={(s) => { dispatch(setFeedbackPageSize(s)); dispatch(setFeedbackPage(1)); }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Feedbacks;
