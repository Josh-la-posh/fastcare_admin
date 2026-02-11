import {DashboardLayout} from '@/layout/dashboard-layout';
import {useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from '@/components/ui/dropdown-menu';
import {Download} from 'lucide-react';
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
import {ReportingFilter} from '@/features/modules/report/reporting-filter';
import {Pagination} from '@/components/ui/pagination';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/services/store';
import {
  fetchAppointmentReports,
  exportAppointmentReports,
} from '@/services/thunks';
import {
  setAppointmentFilters,
  setAppointmentPage,
  setAppointmentPageSize,
} from '@/services/slice/appointmentReportsSlice';

interface AppointmentRow {
  patientName: string;
  doctorName: string | null;
  date: string | null;
  duration: string | null;
}

const Reporting = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    list,
    metaData,
    loading,
    error,
    filters,
    exporting,
  } = useSelector((s: RootState) => s.appointmentReports);
  const page = filters.Page || 1;
  const pageSize = filters.PageSize || 20;

  useEffect(() => {
    dispatch(fetchAppointmentReports({...filters}));
  }, [dispatch, filters]);

  const columns: ColumnDef<AppointmentRow>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({getValue}) => {
        const raw = getValue<string | null>();
        if (!raw) return '-';
        return raw.includes('T') ? raw.split('T')[0] : raw;
      },
    },
    {
      accessorKey: 'doctorName',
      header: 'Doctor in charge',
      cell: ({getValue}) => getValue<string | null>() || '-',
    },
    {
      accessorKey: 'patientName',
      header: 'Patient Name',
      cell: ({getValue}) => getValue<string | null>() || '-',
    },
    {
      accessorKey: 'duration',
      header: 'Session Duration',
      cell: ({getValue}) => getValue<string | null>() || '-',
    },
  ];

  const table = useReactTable({
    data: list as AppointmentRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const totalPages = metaData?.totalPages || 1;
  const empty = !loading && list.length === 0;

  interface RawFilterFormValues {
    startDate?: string;
    endDate?: string;
    doctor?: string;
    hospital?: string;
    clinic?: string;
    duration?: string;
    appointment?: string;
  }

  const handleApplyFilter = (f: RawFilterFormValues) => {
    const payload: Partial<typeof filters> = {};
    if (f.startDate) payload.StartDate = f.startDate; // assume already yyyy-mm-dd
    if (f.endDate) payload.EndDate = f.endDate;
    if (f.doctor) payload.DoctorName = f.doctor;
    if (f.hospital) payload.HospitalId = f.hospital;
    if (f.clinic) payload.ClinicId = f.clinic;
    if (f.duration) {
      // parse the duration input as minutes and wrap in ticks object
      const match = f.duration.match(/\d+/);
      if (match) payload.MinDuration = { ticks: parseInt(match[0], 10) };
    }
    // appointment filter currently unused (not in API spec) so ignored
    dispatch(setAppointmentFilters(payload));
  };

  const handleResetFilter = () => {
    dispatch(
      setAppointmentFilters({
        StartDate: undefined,
        EndDate: undefined,
        DoctorName: undefined,
        HospitalId: undefined,
        ClinicId: undefined,
        MinDuration: undefined,
      }),
    );
  };

  const handleExport = (format: number) => {
    dispatch(
      exportAppointmentReports({
        format,
        StartDate: filters.StartDate,
        EndDate: filters.EndDate,
        MinDuration: filters.MinDuration,
        DoctorName: filters.DoctorName,
        HospitalId: filters.HospitalId,
        ClinicId: filters.ClinicId,
      }),
    )
      .unwrap()
      .then(res => {
        const blob = res.blob as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download =
          format === 1
            ? 'appointment_reports.xlsx'
            : 'appointment_reports.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-200 overflow-scroll h-full ">
        <div className="bg-white p-6 rounded-md flex justify-between items-center mx-8 mt-10">
          <ReportingFilter
            onApply={handleApplyFilter}
            onReset={handleResetFilter}
          />
        </div>
        <div className="lg:mx-8 mt-10 bg-white mb-32 pb-10 rounded-md flex flex-col">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-8">
              <h1 className="text-xl text-gray-800">Appointment</h1>
            </div>
            <div className="flex gap-4 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" disabled={exporting} className="py-2.5 w-44 flex items-center gap-2">
                    <Download size={18}/> {exporting ? 'Exporting...' : 'Export'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleExport(0)} className="cursor-pointer">CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(1)} className="cursor-pointer">Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex-1 overflow-auto px-6 lg:px-0 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-sm text-gray-500">
                Loading appointment reports...
              </div>
            ) : empty ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                <p className="font-medium">No appointment report data</p>
                <p className="text-sm">Adjust filters or date range.</p>
              </div>
            ) : (
              <Table className="min-w-[600px]">
                <TableHeader>
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
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-gray-100"
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === 'actions'
                              ? 'text-right px-16'
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
            {error && (
              <div className="p-4 text-sm text-red-600">{error}</div>
            )}
          </div>
          <div className="p-4 flex items-center justify-end ">
            <Pagination
              totalEntriesSize={metaData?.totalCount || list.length}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={p => dispatch(setAppointmentPage(p))}
              pageSize={pageSize}
              onPageSizeChange={s => dispatch(setAppointmentPageSize(s))}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reporting;
