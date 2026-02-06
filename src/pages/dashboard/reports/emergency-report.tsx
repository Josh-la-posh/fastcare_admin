import { useEffect } from 'react';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { fetchEmergencyReports } from '@/services/thunks';
import { setEmergencyFilters, setEmergencyPage, setEmergencyPageSize } from '@/services/slice/emergencyReportsSlice';
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
import { EmergencyFilter } from '@/features/modules/report/filter';

interface EmergencyRow { patientName: string; doctorName: string; date: string; duration: string; responseTime: string; status: string; }

const EmergencyCallReport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: emergencyList, metaData: emergencyMeta, loading: emergencyLoading, error: emergencyError, filters: emergencyFilters } = useSelector((s: RootState) => s.emergencyReports);

  useEffect(() => { dispatch(fetchEmergencyReports({ ...emergencyFilters })); }, [dispatch, emergencyFilters]);

  // Emergency table
  const emergencyColumns: ColumnDef<EmergencyRow>[] = [
    { accessorKey: 'patientName', header: 'Patient Name' },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string>(); return raw?.includes('T') ? raw.split('T')[0] : raw; } },
    { accessorKey: 'duration', header: 'Duration' },
    { accessorKey: 'responseTime', header: 'Response Time' },
    { accessorKey: 'status', header: 'Status' },
  ];
  const emergencyTable = useReactTable({ data: emergencyList as EmergencyRow[], columns: emergencyColumns, getCoreRowModel: getCoreRowModel() });
  const emergencyEmpty = !emergencyLoading && emergencyList.length === 0;

  return (
    <DashboardLayout>
      <div className="bg-gray-100 h-screen pb-20 overflow-auto">
        <div className="mx-4 md:mx-8 mt-10 bg-white rounded-md px-2 py-6 lg:p-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Emergency Call Report</h1>
          
          <div className="flex flex-col h-[750px]">
            <div className="bg-white p-4 rounded-md mb-4">
              <EmergencyFilter
                onApply={(f: { startDate?: string | null; endDate?: string | null; speciality?: string | null; status?: string | null }) => {
                  const payload: Partial<typeof emergencyFilters> = {};
                  if (f.startDate) payload.StartDate = f.startDate;
                  if (f.endDate) payload.EndDate = f.endDate;
                  if (f.speciality) payload.Speciality = f.speciality;
                  if (f.status) payload.Status = f.status;
                  dispatch(setEmergencyFilters(payload));
                }}
                onReset={() => dispatch(setEmergencyFilters({ StartDate: undefined, EndDate: undefined, Speciality: undefined, Status: undefined }))}
              />
            </div>
            <div className="flex-1 overflow-auto">
              {emergencyLoading ? (
                <div className="flex items-center justify-center h-64 text-sm text-gray-500">Loading emergency call reports...</div>
              ) : emergencyEmpty ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                  <p className="font-medium">No emergency call data</p>
                  <p className="text-sm">Adjust filters or timeframe.</p>
                </div>
              ) : (
                <Table className="min-w-[800px]">
                  <TableHeader>
                    {emergencyTable.getHeaderGroups().map(hg => (
                      <TableRow key={hg.id}>
                        {hg.headers.map(h => (
                          <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {emergencyTable.getRowModel().rows.map(r => (
                      <TableRow key={r.id}>
                        {r.getVisibleCells().map(c => (
                          <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {emergencyError && <div className="p-4 text-sm text-red-600">{emergencyError}</div>}
            </div>
            <div className="p-4 flex items-center justify-end">
              <Pagination
                totalEntriesSize={emergencyMeta?.totalCount || emergencyList.length}
                currentPage={emergencyFilters.Page || 1}
                totalPages={emergencyMeta?.totalPages || 1}
                onPageChange={p => dispatch(setEmergencyPage(p))}
                pageSize={emergencyFilters.PageSize || 20}
                onPageSizeChange={s => dispatch(setEmergencyPageSize(s))}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmergencyCallReport;
