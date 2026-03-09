import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { exportEmergencyReports, fetchEmergencyReports } from '@/services/thunks';
import { setEmergencyFilters, setEmergencyPage, setEmergencyPageSize } from '@/services/slice/emergencyReportsSlice';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Download } from 'lucide-react';

interface EmergencyRow { patientName: string; doctorName: string; date: string; duration: string; status: string; }

const EmergencyCallReport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: emergencyList, metaData: emergencyMeta, loading: emergencyLoading, error: emergencyError, filters: emergencyFilters } = useSelector((s: RootState) => s.emergencyReports);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { dispatch(fetchEmergencyReports({ ...emergencyFilters })); }, [dispatch, emergencyFilters]);

  // Emergency table
  const emergencyColumns: ColumnDef<EmergencyRow>[] = [
    { accessorKey: 'patientName', header: 'Patient Name' },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string>(); return raw?.includes('T') ? raw.split('T')[0] : raw; } },
    { accessorKey: 'doctorName', header: 'Scheduled Doctor' },
    { accessorKey: 'duration', header: 'Duration' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = (getValue<string>() || '').trim();
        const lowered = value.toLowerCase();
        const variant =
          lowered === 'missed'
            ? 'destructive'
            : lowered === 'completed'
              ? 'success'
              : 'secondary';
        return <Badge variant={variant as 'destructive' | 'success' | 'secondary'}>{value || '-'}</Badge>;
      },
    },
  ];
  const emergencyTable = useReactTable({ data: emergencyList as EmergencyRow[], columns: emergencyColumns, getCoreRowModel: getCoreRowModel() });
  const emergencyEmpty = !emergencyLoading && emergencyList.length === 0;

  const handleExport = (format: 'CSV' | 'EXCEL') => {
    setExporting(true);
    dispatch(
      exportEmergencyReports({
        format,
        Status: emergencyFilters.Status,
        FromDate: emergencyFilters.FromDate,
        ToDate: emergencyFilters.ToDate,
        PatientName: emergencyFilters.PatientName,
        DoctorName: emergencyFilters.DoctorName,
        Page: emergencyFilters.Page,
        PageSize: emergencyFilters.PageSize,
      }),
    )
      .unwrap()
      .then(res => {
        const blob = res.blob as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = format === 'EXCEL' ? 'emergency_reports.xlsx' : 'emergency_reports.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .finally(() => setExporting(false));
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 h-screen pb-20 overflow-auto">
        <div className="mx-4 md:mx-8 mt-10 bg-white rounded-md px-2 py-6 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Emergency Call Report</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" disabled={exporting} className="py-2.5 w-44 flex items-center gap-2">
                  <Download size={18} /> {exporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleExport('CSV')} className="cursor-pointer">CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('EXCEL')} className="cursor-pointer">Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex flex-col h-[750px]">
            <div className="bg-white p-4 rounded-md mb-4">
              <EmergencyFilter
                onApply={(f) => {
                  const payload: Partial<typeof emergencyFilters> = {
                    FromDate: f.fromDate || undefined,
                    ToDate: f.toDate || undefined,
                    Status: f.status || undefined,
                    PatientName: f.patientName || undefined,
                    DoctorName: f.scheduledDoctor || undefined,
                  };
                  payload.Page = 1;
                  dispatch(setEmergencyFilters(payload));
                }}
                onReset={() =>
                  dispatch(
                    setEmergencyFilters({
                      FromDate: undefined,
                      ToDate: undefined,
                      Status: undefined,
                      PatientName: undefined,
                      DoctorName: undefined,
                      Page: 1,
                    }),
                  )
                }
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
