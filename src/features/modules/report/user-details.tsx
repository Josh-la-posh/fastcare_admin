import {DashboardLayout} from '@/layout/dashboard-layout';
import {useEffect} from 'react';
import {Button} from '@/components/ui/button';
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
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {Pagination} from '@/components/ui/pagination';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/services/store';
import {fetchPatientReportDetail, fetchDoctorReportDetail, exportUserReportDetail} from '@/services/thunks';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {setDetailPage, setDetailPageSize} from '@/services/slice/userReportsSlice';

interface UserReportDetailRow {
  date: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

const UsersDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {id: dateParam} = useParams<{id: string}>();
  const [searchParams] = useSearchParams();
  const reportType = searchParams.get('type') || 'patient'; // default to patient
  const decodedDate = dateParam ? decodeURIComponent(dateParam) : '';
  const {
    detail,
    detailMeta,
    loadingDetail,
    errorDetail,
    detailFilters,
    exportingDetail,
  } = useSelector((s: RootState) => s.userReports);

  const page = detailFilters.Page || 1;
  const pageSize = detailFilters.PageSize || 20;

  useEffect(() => {
    if (decodedDate) {
      const fetchThunk = reportType === 'doctor' ? fetchDoctorReportDetail : fetchPatientReportDetail;
      dispatch(
        fetchThunk({Date: decodedDate, Page: page, PageSize: pageSize}),
      );
    }
  }, [dispatch, decodedDate, page, pageSize, reportType]);

  const columns: ColumnDef<UserReportDetailRow>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({getValue}) => {
        const raw = getValue<string>();
        return raw?.includes('T') ? raw.split('T')[0] : raw;
      },
    },
    {accessorKey: 'fullName', header: 'Full name'},
    {accessorKey: 'email', header: 'Email'},
    {accessorKey: 'phoneNumber', header: 'Phone Number'},
  ];

  const table = useReactTable({
    data: detail as UserReportDetailRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = detailMeta?.totalPages || 1;
  const empty = !loadingDetail && detail.length === 0;

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full ">
        <div className="lg:mx-8 mt-10 bg-white  rounded-md flex flex-col h-[600px] mb-36">
          <div
            onClick={() => navigate('/reports?tab=signup')}
            className="flex items-center m-4 gap-2 cursor-pointer"
          >
            <span className="text-white bg-black p-1 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </span>
            Back
          </div>
          <div className="flex flex-wrap gap-4 justify-between items-center px-6 pb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl text-gray-900 font-medium">
                {decodedDate?.split('T')[0]}
              </h1>
              {loadingDetail && (
                <span className="text-xs text-gray-500">Loading...</span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="py-2.5 w-44"
                  disabled={loadingDetail || !detail.length || exportingDetail}
                >
                  {exportingDetail ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={async () => {
                    try {
                      const res = await dispatch(exportUserReportDetail({ Date: decodedDate, format: 0 })).unwrap();
                      const { blob } = res as { blob: Blob };
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `user-report-${decodedDate}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    } catch (e) { console.error(e); }
                  }}
                >
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={async () => {
                    try {
                      const res = await dispatch(exportUserReportDetail({ Date: decodedDate, format: 1 })).unwrap();
                      const { blob } = res as { blob: Blob };
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `user-report-${decodedDate}.xlsx`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    } catch (e) { console.error(e); }
                  }}
                >
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1 overflow-auto lg:px-0 lg:mt-2">
            {loadingDetail ? (
              <div className="flex items-center justify-center h-64 text-sm text-gray-500">
                Loading user details...
              </div>
            ) : empty ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                <p className="font-medium">No users for this date</p>
                <p className="text-sm">Try another report date.</p>
              </div>
            ) : (
              <Table className="min-w-[600px]">
                <TableHeader className="border-y border-[#CDE5F9]">
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead className="px-16" key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === 'actions'
                              ? 'text-right px-24'
                              : 'px-16'
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {errorDetail && (
              <div className="p-4 text-sm text-red-600">{errorDetail}</div>
            )}
          </div>
          <div className="p-4 flex items-center justify-end">
            <Pagination
              totalEntriesSize={detailMeta?.totalCount || detail.length}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={p => dispatch(setDetailPage(p))}
              pageSize={pageSize}
              onPageSizeChange={s => dispatch(setDetailPageSize(s))}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UsersDetails;
