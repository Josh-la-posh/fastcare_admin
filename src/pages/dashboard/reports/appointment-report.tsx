import { useEffect } from 'react';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { fetchAppointmentReports } from '@/services/thunks';
import { setAppointmentPage, setAppointmentPageSize, setAppointmentFilters } from '@/services/slice/appointmentReportsSlice';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ReportingFilter } from '@/features/modules/report/reporting-filter';

interface AppointmentRow { patientName: string; doctorName: string | null; date: string | null; duration: string | null; }

const AppointmentReport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: apptList, metaData: apptMeta, loading: apptLoading, error: apptError, filters: apptFilters } = useSelector((s: RootState) => s.appointmentReports);

  useEffect(() => { dispatch(fetchAppointmentReports({ ...apptFilters })); }, [dispatch, apptFilters]);

  // Appointment table
  const apptColumns: ColumnDef<AppointmentRow>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string | null>(); return raw && raw.includes('T') ? raw.split('T')[0] : raw || '-'; } },
    { accessorKey: 'patientName', header: 'Patient Name', cell: ({ getValue }) => getValue<string | null>() || '-' },
    { accessorKey: 'duration', header: 'Session Duration', cell: ({ getValue }) => getValue<string | null>() || '-' },
  ];
  const apptTable = useReactTable({ data: apptList as AppointmentRow[], columns: apptColumns, getCoreRowModel: getCoreRowModel() });
  const apptEmpty = !apptLoading && apptList.length === 0;

  return (
    <DashboardLayout>
      <div className="bg-gray-100 h-screen pb-20 overflow-auto">
        <div className="mx-4 md:mx-8 mt-10 bg-white rounded-md px-2 py-6 lg:p-6">
          {/* <h1 className="text-xl font-semibold text-gray-800 mb-4">Appointment Report</h1> */}
          
          <div className="flex flex-col h-[750px]">
            <div className="bg-white p-4 rounded-md mb-4">
              <ReportingFilter
                onApply={(f: { startDate?: string; endDate?: string; doctor?: string; hospital?: string; clinic?: string; duration?: string }) => {
                  const payload: Partial<typeof apptFilters> = {};
                  if (f.startDate) payload.StartDate = f.startDate;
                  if (f.endDate) payload.EndDate = f.endDate;
                  if (f.doctor) payload.DoctorName = f.doctor;
                  if (f.hospital) payload.HospitalId = f.hospital;
                  if (f.clinic) payload.ClinicId = f.clinic;
                  if (f.duration) payload.MinDuration = { ticks: 0 };
                  dispatch(setAppointmentFilters(payload));
                }}
                onReset={() => dispatch(setAppointmentFilters({ StartDate: undefined, EndDate: undefined, DoctorName: undefined, HospitalId: undefined, ClinicId: undefined, MinDuration: { ticks: 0 } }))}
              />
            </div>
            <div className="flex-1 overflow-auto">
              {apptLoading ? (
                <div className="flex items-center justify-center h-64 text-sm text-gray-500">Loading appointment reports...</div>
              ) : apptEmpty ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                  <p className="font-medium">No appointment report data</p>
                  <p className="text-sm">Adjust filters or date range.</p>
                </div>
              ) : (
                <Table className="min-w-[600px]">
                  <TableHeader>
                    {apptTable.getHeaderGroups().map(hg => (
                      <TableRow key={hg.id}>
                        {hg.headers.map(h => (
                          <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {apptTable.getRowModel().rows.map(r => (
                      <TableRow key={r.id}>
                        {r.getVisibleCells().map(c => (
                          <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {apptError && <div className="p-4 text-sm text-red-600">{apptError}</div>}
            </div>
            <div className="p-4 flex items-center justify-end">
              <Pagination
                totalEntriesSize={apptMeta?.totalCount || apptList.length}
                currentPage={apptFilters.Page || 1}
                totalPages={apptMeta?.totalPages || 1}
                onPageChange={p => dispatch(setAppointmentPage(p))}
                pageSize={apptFilters.PageSize || 20}
                onPageSizeChange={s => dispatch(setAppointmentPageSize(s))}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentReport;
