import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { fetchPatientReports, fetchDoctorReports, exportPatientSignupReports, exportDoctorSignupReports } from '@/services/thunks';
import { setPatientPage, setPatientPageSize, setDoctorPage, setDoctorPageSize } from '@/services/slice/userReportsSlice';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface UserReportRow {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  role: string;
  creationDate: string;
}

const SignupReport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    patientList, 
    doctorList, 
    patientMeta, 
    doctorMeta, 
    loadingPatient, 
    loadingDoctor, 
    errorPatient, 
    errorDoctor, 
    patientFilters, 
    doctorFilters 
  } = useSelector((s: RootState) => s.userReports);

  // Nested signup tab (patient/doctor)
  const [signupTab, setSignupTab] = useState('patient');

  // Frontend date filters
  const [patientStartDate, setPatientStartDate] = useState('');
  const [patientEndDate, setPatientEndDate] = useState('');
  const [doctorStartDate, setDoctorStartDate] = useState('');
  const [doctorEndDate, setDoctorEndDate] = useState('');
  const [exportingPatient, setExportingPatient] = useState(false);
  const [exportingDoctor, setExportingDoctor] = useState(false);

  const toDateRange = (startDate: string, endDate: string) => {
    if (!startDate && !endDate) return {};
    const from = startDate || endDate;
    const to = endDate || startDate;
    return {
      FromDate: `${from}T00:00:00`,
      ToDate: `${to}T23:59:59`,
    };
  };
  
  // Fetch patient reports
  useEffect(() => { 
    dispatch(fetchPatientReports({
      ...toDateRange(patientStartDate, patientEndDate),
      Page: patientFilters.Page || 1,
      PageSize: patientFilters.PageSize || 10,
    }));
  }, [dispatch, patientFilters.Page, patientFilters.PageSize, patientStartDate, patientEndDate]);
  
  // Fetch doctor reports
  useEffect(() => { 
    dispatch(fetchDoctorReports({
      ...toDateRange(doctorStartDate, doctorEndDate),
      Page: doctorFilters.Page || 1,
      PageSize: doctorFilters.PageSize || 10,
    }));
  }, [dispatch, doctorFilters.Page, doctorFilters.PageSize, doctorStartDate, doctorEndDate]);

  // Frontend filtered lists
  const filteredPatientList = useMemo(() => patientList, [patientList]);

  const filteredDoctorList = useMemo(() => doctorList, [doctorList]);

  // Users table - Patient
  const patientColumns: ColumnDef<UserReportRow>[] = [
    { accessorKey: 'creationDate', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string>(); return raw?.includes('T') ? raw.split('T')[0] : raw; } },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phoneNumber', header: 'Phone Number' },
    { accessorKey: 'countryCode', header: 'Country Code' },
    { accessorKey: 'role', header: 'Role' },
  ];
  const patientTable = useReactTable({ data: filteredPatientList as UserReportRow[], columns: patientColumns, getCoreRowModel: getCoreRowModel() });
  const patientEmpty = !loadingPatient && filteredPatientList.length === 0;

  // Users table - Doctor
  const doctorColumns: ColumnDef<UserReportRow>[] = [
    { accessorKey: 'creationDate', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string>(); return raw?.includes('T') ? raw.split('T')[0] : raw; } },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phoneNumber', header: 'Phone Number' },
    { accessorKey: 'countryCode', header: 'Country Code' },
    { accessorKey: 'role', header: 'Role' },
  ];
  const doctorTable = useReactTable({ data: filteredDoctorList as UserReportRow[], columns: doctorColumns, getCoreRowModel: getCoreRowModel() });
  const doctorEmpty = !loadingDoctor && filteredDoctorList.length === 0;

  return (
    <DashboardLayout>
      <div className="bg-gray-100 h-screen pb-20 overflow-auto">
        <div className="mx-4 md:mx-8 mt-10 bg-white rounded-md px-2 py-6 lg:p-6">
          {/* <h1 className="text-xl font-semibold text-gray-800 mb-4">Signup Report</h1> */}
          
          {/* Nested tabs for Patient and Doctor */}
          <Tabs value={signupTab} onValueChange={setSignupTab} className="w-full">
            <TabsList className="flex gap-2 mb-4">
              <TabsTrigger value="patient">Patient Signup</TabsTrigger>
              <TabsTrigger value="doctor">Doctor Signup</TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="focus:outline-none" hidden={signupTab !== 'patient'}>
              {/* Date Filter */}
              <div className="mb-4 rounded-md border bg-gray-50/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-gray-600">Start Date</span>
                      <Input
                        type="date"
                        value={patientStartDate}
                        onChange={(e) => setPatientStartDate(e.target.value)}
                        className="w-full min-w-[180px] bg-white"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-gray-600">End Date</span>
                      <Input
                        type="date"
                        value={patientEndDate}
                        onChange={(e) => setPatientEndDate(e.target.value)}
                        className="w-full min-w-[180px] bg-white"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {(patientStartDate || patientEndDate) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPatientStartDate('');
                          setPatientEndDate('');
                        }}
                      >
                        Clear
                      </Button>
                    )}
                    <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={loadingPatient || !filteredPatientList.length || exportingPatient}>
                      {exportingPatient ? 'Exporting...' : 'Export'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={async () => {
                        try {
                          setExportingPatient(true);
                          const res = await dispatch(exportPatientSignupReports({
                            ...toDateRange(patientStartDate, patientEndDate),
                            Page: patientFilters.Page || 1,
                            PageSize: patientFilters.PageSize || 20,
                            format: 'CSV',
                          })).unwrap();
                          const { blob } = res as { blob: Blob };
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          const rangeLabel = (patientStartDate || patientEndDate)
                            ? `${patientStartDate || patientEndDate}_to_${patientEndDate || patientStartDate}`
                            : 'all';
                          a.href = url;
                          a.download = `patient-signups-${rangeLabel}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        } catch (e) { console.error(e); } finally { setExportingPatient(false); }
                      }}
                    >
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={async () => {
                        try {
                          setExportingPatient(true);
                          const res = await dispatch(exportPatientSignupReports({
                            ...toDateRange(patientStartDate, patientEndDate),
                            Page: patientFilters.Page || 1,
                            PageSize: patientFilters.PageSize || 20,
                            format: 'Excel',
                          })).unwrap();
                          const { blob } = res as { blob: Blob };
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          const rangeLabel = (patientStartDate || patientEndDate)
                            ? `${patientStartDate || patientEndDate}_to_${patientEndDate || patientStartDate}`
                            : 'all';
                          a.href = url;
                          a.download = `patient-signups-${rangeLabel}.xlsx`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        } catch (e) { console.error(e); } finally { setExportingPatient(false); }
                      }}
                    >
                      Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              <div className="flex-1 h-full overflow-y-scroll">
                {loadingPatient ? (
                  <div className="flex items-center justify-center h-64 text-sm text-gray-500">Loading patient signup reports...</div>
                ) : patientEmpty ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <p className="font-medium">No patient signup report data {(patientStartDate || patientEndDate) ? 'for this date range' : 'yet'}</p>
                    <p className="text-sm">{(patientStartDate || patientEndDate) ? 'Try selecting a different date range.' : 'Reports will appear once patients register.'}</p>
                  </div>
                ) : (
                  <div className="h-full overflow-auto">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        {patientTable.getHeaderGroups().map(hg => (
                          <TableRow key={hg.id}>
                            {hg.headers.map(h => (
                              <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {patientTable.getRowModel().rows.map(r => (
                          <TableRow key={r.id} className="hover:bg-gray-50">
                            {r.getVisibleCells().map(c => (
                              <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {!(patientStartDate || patientEndDate) && (
                    <div className="p-4 flex items-center justify-end">
                      <Pagination
                        totalEntriesSize={patientMeta?.totalCount || patientList.length}
                        currentPage={patientFilters.Page || 1}
                        totalPages={patientMeta?.totalPages || 1}
                        onPageChange={p => dispatch(setPatientPage(p))}
                        pageSize={patientFilters.PageSize || 20}
                        onPageSizeChange={s => dispatch(setPatientPageSize(s))}
                      />
                    </div>
                    )}
                  </div>
                )}
                {errorPatient && <div className="p-4 text-sm text-red-600">{errorPatient}</div>}
              </div>
            </TabsContent>

            <TabsContent value="doctor" className="focus:outline-none" hidden={signupTab !== 'doctor'}>
              {/* Date Filter */}
              <div className="mb-4 rounded-md border bg-gray-50/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-gray-600">Start Date</span>
                      <Input
                        type="date"
                        value={doctorStartDate}
                        onChange={(e) => setDoctorStartDate(e.target.value)}
                        className="w-full min-w-[180px] bg-white"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-gray-600">End Date</span>
                      <Input
                        type="date"
                        value={doctorEndDate}
                        onChange={(e) => setDoctorEndDate(e.target.value)}
                        className="w-full min-w-[180px] bg-white"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {(doctorStartDate || doctorEndDate) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDoctorStartDate('');
                          setDoctorEndDate('');
                        }}
                      >
                        Clear
                      </Button>
                    )}
                    <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={loadingDoctor || !filteredDoctorList.length || exportingDoctor}>
                      {exportingDoctor ? 'Exporting...' : 'Export'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={async () => {
                        try {
                          setExportingDoctor(true);
                          const res = await dispatch(exportDoctorSignupReports({
                            ...toDateRange(doctorStartDate, doctorEndDate),
                            Page: doctorFilters.Page || 1,
                            PageSize: doctorFilters.PageSize || 20,
                            format: 'CSV',
                          })).unwrap();
                          const { blob } = res as { blob: Blob };
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          const rangeLabel = (doctorStartDate || doctorEndDate)
                            ? `${doctorStartDate || doctorEndDate}_to_${doctorEndDate || doctorStartDate}`
                            : 'all';
                          a.href = url;
                          a.download = `doctor-signups-${rangeLabel}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        } catch (e) { console.error(e); } finally { setExportingDoctor(false); }
                      }}
                    >
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={async () => {
                        try {
                          setExportingDoctor(true);
                          const res = await dispatch(exportDoctorSignupReports({
                            ...toDateRange(doctorStartDate, doctorEndDate),
                            Page: doctorFilters.Page || 1,
                            PageSize: doctorFilters.PageSize || 20,
                            format: 'Excel',
                          })).unwrap();
                          const { blob } = res as { blob: Blob };
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          const rangeLabel = (doctorStartDate || doctorEndDate)
                            ? `${doctorStartDate || doctorEndDate}_to_${doctorEndDate || doctorStartDate}`
                            : 'all';
                          a.href = url;
                          a.download = `doctor-signups-${rangeLabel}.xlsx`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        } catch (e) { console.error(e); } finally { setExportingDoctor(false); }
                      }}
                    >
                      Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              <div className="flex-1 h-full overflow-y-scroll">
                {loadingDoctor ? (
                  <div className="flex items-center justify-center h-64 text-sm text-gray-500">Loading doctor signup reports...</div>
                ) : doctorEmpty ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <p className="font-medium">No doctor signup report data {(doctorStartDate || doctorEndDate) ? 'for this date range' : 'yet'}</p>
                    <p className="text-sm">{(doctorStartDate || doctorEndDate) ? 'Try selecting a different date range.' : 'Reports will appear once doctors register.'}</p>
                  </div>
                ) : (
                  <div className="h-full overflow-auto">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        {doctorTable.getHeaderGroups().map(hg => (
                          <TableRow key={hg.id}>
                            {hg.headers.map(h => (
                              <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {doctorTable.getRowModel().rows.map(r => (
                          <TableRow key={r.id} className="hover:bg-gray-50">
                            {r.getVisibleCells().map(c => (
                              <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {!(doctorStartDate || doctorEndDate) && (
                    <div className="p-4 flex items-center justify-end">
                      <Pagination
                        totalEntriesSize={doctorMeta?.totalCount || doctorList.length}
                        currentPage={doctorFilters.Page || 1}
                        totalPages={doctorMeta?.totalPages || 1}
                        onPageChange={p => dispatch(setDoctorPage(p))}
                        pageSize={doctorFilters.PageSize || 20}
                        onPageSizeChange={s => dispatch(setDoctorPageSize(s))}
                      />
                    </div>
                    )}
                  </div>
                )}
                {errorDoctor && <div className="p-4 text-sm text-red-600">{errorDoctor}</div>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SignupReport;
