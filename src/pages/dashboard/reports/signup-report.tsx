import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { fetchPatientReports, fetchDoctorReports } from '@/services/thunks';
import { setPatientPage, setPatientPageSize, setDoctorPage, setDoctorPageSize } from '@/services/slice/userReportsSlice';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface UserReportRow { date: string; userCount: number; }

const SignupReport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
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
  const [patientDateFilter, setPatientDateFilter] = useState('');
  const [doctorDateFilter, setDoctorDateFilter] = useState('');

  // Fetch patient reports only once (when list is empty)
  useEffect(() => { 
    if (patientList.length === 0 && !loadingPatient) {
      dispatch(fetchPatientReports({ Page: patientFilters.Page || 1, PageSize: patientFilters.PageSize || 10 })); 
    }
  }, [dispatch, patientList.length, loadingPatient]);
  
  // Fetch doctor reports only once (when list is empty)
  useEffect(() => { 
    if (doctorList.length === 0 && !loadingDoctor) {
      dispatch(fetchDoctorReports({ Page: doctorFilters.Page || 1, PageSize: doctorFilters.PageSize || 10 })); 
    }
  }, [dispatch, doctorList.length, loadingDoctor]);

  // Frontend filtered lists
  const filteredPatientList = useMemo(() => {
    if (!patientDateFilter) return patientList;
    return patientList.filter(item => {
      const itemDate = item.date?.includes('T') ? item.date.split('T')[0] : item.date;
      return itemDate === patientDateFilter;
    });
  }, [patientList, patientDateFilter]);

  const filteredDoctorList = useMemo(() => {
    if (!doctorDateFilter) return doctorList;
    return doctorList.filter(item => {
      const itemDate = item.date?.includes('T') ? item.date.split('T')[0] : item.date;
      return itemDate === doctorDateFilter;
    });
  }, [doctorList, doctorDateFilter]);

  // Users table - Patient
  const patientColumns: ColumnDef<UserReportRow>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string>(); return raw?.includes('T') ? raw.split('T')[0] : raw; } },
    { id: 'type', header: 'Type', cell: () => 'Patient' },
    { accessorKey: 'userCount', header: 'Number of Users' },
    { id: 'action', header: 'Action', cell: ({ row }) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const dateVal = (row.original as UserReportRow).date;
          if (dateVal) navigate(`/reports/users/user-details/${encodeURIComponent(dateVal)}?type=patient`);
        }}
        className="text-primary hover:underline font-medium"
      >
        View details
      </button>
    )},
  ];
  const patientTable = useReactTable({ data: filteredPatientList as UserReportRow[], columns: patientColumns, getCoreRowModel: getCoreRowModel() });
  const patientEmpty = !loadingPatient && filteredPatientList.length === 0;

  // Users table - Doctor
  const doctorColumns: ColumnDef<UserReportRow>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => { const raw = getValue<string>(); return raw?.includes('T') ? raw.split('T')[0] : raw; } },
    { id: 'type', header: 'Type', cell: () => 'Doctor' },
    { accessorKey: 'userCount', header: 'Number of Users' },
    { id: 'action', header: 'Action', cell: ({ row }) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const dateVal = (row.original as UserReportRow).date;
          if (dateVal) navigate(`/reports/users/user-details/${encodeURIComponent(dateVal)}?type=doctor`);
        }}
        className="text-primary hover:underline font-medium"
      >
        View details
      </button>
    )},
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
              <div className="flex items-center gap-3 mb-4">
                <Input
                  type="date"
                  value={patientDateFilter}
                  onChange={(e) => setPatientDateFilter(e.target.value)}
                  className="w-48"
                  max={new Date().toISOString().split('T')[0]}
                />
                {patientDateFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPatientDateFilter('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex-1 h-full overflow-y-scroll">
                {loadingPatient ? (
                  <div className="flex items-center justify-center h-64 text-sm text-gray-500">Loading patient signup reports...</div>
                ) : patientEmpty ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <p className="font-medium">No patient signup report data {patientDateFilter ? 'for this date' : 'yet'}</p>
                    <p className="text-sm">{patientDateFilter ? 'Try selecting a different date.' : 'Reports will appear once patients register.'}</p>
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
                    {!patientDateFilter && (
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
              <div className="flex items-center gap-3 mb-4">
                <Input
                  type="date"
                  value={doctorDateFilter}
                  onChange={(e) => setDoctorDateFilter(e.target.value)}
                  className="w-48"
                  max={new Date().toISOString().split('T')[0]}
                />
                {doctorDateFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDoctorDateFilter('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex-1 h-full overflow-y-scroll">
                {loadingDoctor ? (
                  <div className="flex items-center justify-center h-64 text-sm text-gray-500">Loading doctor signup reports...</div>
                ) : doctorEmpty ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <p className="font-medium">No doctor signup report data {doctorDateFilter ? 'for this date' : 'yet'}</p>
                    <p className="text-sm">{doctorDateFilter ? 'Try selecting a different date.' : 'Reports will appear once doctors register.'}</p>
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
                    {!doctorDateFilter && (
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
