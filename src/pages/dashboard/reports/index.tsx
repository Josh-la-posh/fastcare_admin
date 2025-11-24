import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { fetchPatientReports, fetchDoctorReports, fetchAppointmentReports } from '@/services/thunks';
import { setReportPage, setReportPageSize } from '@/services/slice/userReportsSlice';
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
import { EmergencyFilter } from '@/features/modules/report/filter';
import { fetchEmergencyReports } from '@/services/thunks';
import { setEmergencyFilters, setEmergencyPage, setEmergencyPageSize } from '@/services/slice/emergencyReportsSlice';

interface EmergencyRow { patientName: string; doctorName: string; date: string; duration: string; responseTime: string; status: string; }

interface UserReportRow { date: string; userCount: number; }
interface AppointmentRow { patientName: string; doctorName: string | null; date: string | null; duration: string | null; }

const UnifiedReports = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: userList, metaData: userMeta, loadingList: userLoading, errorList: userError, filters: userFilters } = useSelector((s: RootState) => s.userReports);
  const { list: apptList, metaData: apptMeta, loading: apptLoading, error: apptError, filters: apptFilters } = useSelector((s: RootState) => s.appointmentReports);
  const { list: emergencyList, metaData: emergencyMeta, loading: emergencyLoading, error: emergencyError, filters: emergencyFilters } = useSelector((s: RootState) => s.emergencyReports);

  // Tab query param sync
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') ?? 'signup';
  const validTabs = ['signup','appointment','emergency'];
  const [activeTab, setActiveTab] = useState(validTabs.includes(initialTab) ? initialTab : 'signup');
  
  // Nested signup tab (patient/doctor)
  const initialSignupTab = searchParams.get('signupTab') ?? 'patient';
  const validSignupTabs = ['patient', 'doctor'];
  const [signupTab, setSignupTab] = useState(validSignupTabs.includes(initialSignupTab) ? initialSignupTab : 'patient');

  // Fetch patients, doctors & appointments when their pagination changes
  useEffect(() => { 
    if (activeTab === 'signup' && signupTab === 'patient') {
      dispatch(fetchPatientReports({ Page: userFilters.Page || 1, PageSize: userFilters.PageSize || 10 })); 
    }
  }, [dispatch, userFilters.Page, userFilters.PageSize, activeTab, signupTab]);
  
  useEffect(() => { 
    if (activeTab === 'signup' && signupTab === 'doctor') {
      dispatch(fetchDoctorReports({ Page: userFilters.Page || 1, PageSize: userFilters.PageSize || 10 })); 
    }
  }, [dispatch, userFilters.Page, userFilters.PageSize, activeTab, signupTab]);
  
  useEffect(() => { dispatch(fetchAppointmentReports({ ...apptFilters })); }, [dispatch, apptFilters]);

  // Users table
  const userColumns: ColumnDef<UserReportRow>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string>(); return raw?.includes('T') ? raw.split('T')[0] : raw; } },
    { accessorKey: 'userCount', header: 'Number of Users' },
  ];
  const userTable = useReactTable({ data: userList as UserReportRow[], columns: userColumns, getCoreRowModel: getCoreRowModel() });
  const userEmpty = !userLoading && userList.length === 0;

  // Appointment table
  const apptColumns: ColumnDef<AppointmentRow>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string | null>(); return raw && raw.includes('T') ? raw.split('T')[0] : raw || '-'; } },
    // { accessorKey: 'doctorName', header: 'Doctor in charge', cell: ({ getValue }) => getValue<string | null>() || '-' },
    { accessorKey: 'patientName', header: 'Patient Name', cell: ({ getValue }) => getValue<string | null>() || '-' },
    { accessorKey: 'duration', header: 'Session Duration', cell: ({ getValue }) => getValue<string | null>() || '-' },
  ];
  const apptTable = useReactTable({ data: apptList as AppointmentRow[], columns: apptColumns, getCoreRowModel: getCoreRowModel() });
  const apptEmpty = !apptLoading && apptList.length === 0;

  // Emergency table (all doctors appointments)
  useEffect(() => { dispatch(fetchEmergencyReports({ ...emergencyFilters })); }, [dispatch, emergencyFilters]);
  const emergencyColumns: ColumnDef<EmergencyRow>[] = [
    { accessorKey: 'patientName', header: 'Patient Name' },
    // { accessorKey: 'doctorName', header: 'Doctor Assigned' },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string>(); return raw?.includes('T') ? raw.split('T')[0] : raw; } },
    { accessorKey: 'duration', header: 'Duration' },
    { accessorKey: 'responseTime', header: 'Response Time' },
    { accessorKey: 'status', header: 'Status' },
  ];
  const emergencyTable = useReactTable({ data: emergencyList as EmergencyRow[], columns: emergencyColumns, getCoreRowModel: getCoreRowModel() });
  const emergencyEmpty = !emergencyLoading && emergencyList.length === 0;

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    // Preserve other params if later added
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('tab', val);
    // Reset signup tab when switching away from signup
    if (val !== 'signup') {
      sp.delete('signupTab');
    }
    navigate({ pathname: '/reports', search: sp.toString() }, { replace: true });
  };

  const handleSignupTabChange = (val: string) => {
    setSignupTab(val);
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('tab', 'signup');
    sp.set('signupTab', val);
    navigate({ pathname: '/reports', search: sp.toString() }, { replace: true });
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 h-screen pb-20 overflow-auto">
        <div className="mx-4 md:mx-8 mt-10 bg-white rounded-md px-2 py-6 lg:p-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Reports</h1>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="hidden lg:flex justify-start flex-wrap gap-2 mb-6">
              <TabsTrigger value="signup">Signup Report</TabsTrigger>
              <TabsTrigger value="appointment">Appointment Report</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Call Report</TabsTrigger>
            </TabsList>
            <TabsList className="flex lg:hidden flex-wrap gap-2 mb-6">
              <TabsTrigger value="signup">Signup</TabsTrigger>
              <TabsTrigger value="appointment">Appointment</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Call</TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="focus:outline-none" hidden={activeTab !== 'signup'}>
              {/* Nested tabs for Patient and Doctor */}
              <Tabs value={signupTab} onValueChange={handleSignupTabChange} className="w-full">
                <TabsList className="flex gap-2 mb-4">
                  <TabsTrigger value="patient">Patient Signup</TabsTrigger>
                  <TabsTrigger value="doctor">Doctor Signup</TabsTrigger>
                </TabsList>

                <TabsContent value="patient" className="focus:outline-none" hidden={signupTab !== 'patient'}>
              <div className="flex-1 h-full overflow-y-scroll">
                {userLoading ? (
                  <div className="flex items-center justify-center h-64 text-sm text-gray-500">Loading patient signup reports...</div>
                ) : userEmpty ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <p className="font-medium">No patient signup report data yet</p>
                    <p className="text-sm">Reports will appear once patients register.</p>
                  </div>
                ) : (
                  <div className="h-full overflow-auto">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        {userTable.getHeaderGroups().map(hg => (
                          <TableRow key={hg.id}>
                            {hg.headers.map(h => (
                              <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {userTable.getRowModel().rows.map(r => (
                          <TableRow
                            key={r.id}
                            onClick={() => {
                              const dateVal = (r.original as UserReportRow).date;
                              if (dateVal) {
                                navigate(`/reports/users/user-details/${encodeURIComponent(dateVal)}?type=patient`);
                              }
                            }}
                            className="cursor-pointer hover:bg-gray-50"
                            title="View patient details for this date"
                          >
                            {r.getVisibleCells().map(c => (
                              <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4 flex items-center justify-end">
                      <Pagination
                        totalEntriesSize={userMeta?.totalCount || userList.length}
                        currentPage={userFilters.Page || 1}
                        totalPages={userMeta?.totalPages || 1}
                        onPageChange={p => dispatch(setReportPage(p))}
                        pageSize={userFilters.PageSize || 20}
                        onPageSizeChange={s => dispatch(setReportPageSize(s))}
                      />
                    </div>
                  </div>
                )}
                {userError && <div className="p-4 text-sm text-red-600">{userError}</div>}
              </div>
            </TabsContent>

                <TabsContent value="doctor" className="focus:outline-none" hidden={signupTab !== 'doctor'}>
              <div className="flex-1 h-full overflow-y-scroll">
                {userLoading ? (
                  <div className="flex items-center justify-center h-64 text-sm text-gray-500">Loading doctor signup reports...</div>
                ) : userEmpty ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <p className="font-medium">No doctor signup report data yet</p>
                    <p className="text-sm">Reports will appear once doctors register.</p>
                  </div>
                ) : (
                  <div className="h-full overflow-auto">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        {userTable.getHeaderGroups().map(hg => (
                          <TableRow key={hg.id}>
                            {hg.headers.map(h => (
                              <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {userTable.getRowModel().rows.map(r => (
                          <TableRow
                            key={r.id}
                            onClick={() => {
                              const dateVal = (r.original as UserReportRow).date;
                              if (dateVal) {
                                navigate(`/reports/users/user-details/${encodeURIComponent(dateVal)}?type=doctor`);
                              }
                            }}
                            className="cursor-pointer hover:bg-gray-50"
                            title="View doctor details for this date"
                          >
                            {r.getVisibleCells().map(c => (
                              <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4 flex items-center justify-end">
                      <Pagination
                        totalEntriesSize={userMeta?.totalCount || userList.length}
                        currentPage={userFilters.Page || 1}
                        totalPages={userMeta?.totalPages || 1}
                        onPageChange={p => dispatch(setReportPage(p))}
                        pageSize={userFilters.PageSize || 20}
                        onPageSizeChange={s => dispatch(setReportPageSize(s))}
                      />
                    </div>
                  </div>
                )}
                {userError && <div className="p-4 text-sm text-red-600">{userError}</div>}
              </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="appointment" className="focus:outline-none" hidden={activeTab !== 'appointment'}>
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
            </TabsContent>

            <TabsContent value="emergency" className="focus:outline-none" hidden={activeTab !== 'emergency'}>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UnifiedReports;
