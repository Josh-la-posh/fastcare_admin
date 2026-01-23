import {DashboardLayout} from '@/layout/dashboard-layout';
import {useEffect, useState} from 'react';
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
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/services/store';
import {fetchDoctors} from '@/services/thunks';
import { Button } from '@/components/ui/button';
import {Doctor} from '@/types';
import {Loader} from '@/components/ui/loading';

const AllDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // activeSearch is the term sent to backend; lets user type freely without triggering fetch each keystroke
  const [activeSearch, setActiveSearch] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);  

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {doctors, totalCount, totalPages, currentPage, loading, error} =
    useSelector((state: RootState) => state.doctors);

  useEffect(() => {
    dispatch(fetchDoctors({ page, pageSize, status: 2, search: activeSearch }));
  }, [dispatch, page, pageSize, activeSearch]);

  // Removed client-side filteredDoctors; using backend search instead

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: 'id',
      header: 'S/N',
      cell: ({row}) => row.index + 1 + (page - 1) * pageSize,
    },
    {
      accessorKey: 'name',
      header: 'Doctor Name',
      cell: ({row}) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      accessorKey: 'specialization',
      header: 'Speciality',
    },
    {
      accessorKey: 'licenseNumber',
      header: 'License Number',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({row}) => {
        const statusText = row.original.isActive === false ? 'Inactive' 
          : row.original.status.toLowerCase() === 'available' ? 'Online' 
          : row.original.status.toLowerCase() === 'offline' ? 'Offline'
          : row.original.status.toLowerCase() === 'inconsultation' ? 'Active'
          : 'Inactive';
        const status = statusText.toLowerCase();

        let statusClasses = 'p-2 text-md font-semibold w-fit ';
        if (status === 'inactive') statusClasses += 'text-white bg-red-500 ';
        if (status === 'online') statusClasses += 'bg-green-100 text-green-500';
        if (status === 'offline') statusClasses += 'bg-red-100 text-red-500';
        if (status === 'in consultation') statusClasses += 'bg-blue-100 text-blue-500';
        else statusClasses += 'text-red-800';

        return <span className={statusClasses}>{statusText}</span>;
      },
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({row}) => (
        <div
          onClick={() =>
            navigate(`/doctors/doctor-details/${row.original.userId}`)
          }
          className="flex text-center justify-center whitespace-nowrap cursor-pointer font-semibold items-center gap-2 bg-[#E4F1FC] p-2 rounded-md text-[#135E9B]"
        >
          View Profile
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: doctors,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="lg:mx-8 mt-10 bg-white rounded-md flex flex-col mb-36">
          {/* Header */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center flex-wrap gap-4 lg:gap-8">
              <h1 className="text-xl text-gray-800 whitespace-nowrap">All Doctors</h1>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    setActiveSearch(searchTerm.trim() || undefined);
                  }
                }}
                className="border rounded-lg px-4 py-2 lg:w-72 xl:w-96 focus:outline-none"
              />
              <Button
                onClick={() => {
                  setPage(1);
                  setActiveSearch(searchTerm.trim() || undefined);
                }}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 lg:px-0 lg:mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <Loader />
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <>
                <Table className="min-w-[600px]">
                  <TableHeader className="border-y border-[#CDE5F9]">
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableHead key={header.id}>
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
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map(row => (
                        <TableRow
                          key={row.id}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {row.getVisibleCells().map(cell => (
                            <TableCell
                              key={cell.id}
                              className={
                                cell.column.id === 'action' ? 'text-right' : ''
                              }
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
                          <span className="font-medium">No doctors found</span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-end">
                  <Pagination
                    totalEntriesSize={totalCount}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    pageSize={pageSize}
                    onPageSizeChange={size => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AllDoctors;
