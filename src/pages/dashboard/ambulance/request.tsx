import {DashboardLayout} from '@/layout/dashboard-layout';
import {useState, useMemo, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {ArrowDownLeft} from 'lucide-react';
import claim from '/svg/totalamb.svg';
import approved from '/svg/avbamb.svg';
import disputed from '/svg/unamb.svg';
import en from '/svg/enroute.svg';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { RequestFilter } from '@/features/modules/ambulance/filter';
import RequestDetails from '@/features/modules/ambulance/request-details';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store';
import { createAmbulanceRequest, fetchAmbulanceRequests, fetchAmbulances, fetchAmbulanceSummary } from '@/services/thunks';
import { Loader } from '@/components/ui/loading';
import toast from 'react-hot-toast';
const GOOGLE_GEOCODE_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return dateString.replace(';', ',');
};

// Helper function to get pickup address
const getPickupAddress = (request: any) => {
  return request.pickupAddress || 
         `${request.pickupLocation?.latitude?.toFixed(4)}, ${request.pickupLocation?.longitude?.toFixed(4)}` || 
         'Location not specified';
};

// Helper function to get ambulance display number
const getAmbulanceDisplay = (request: any) => {
  return request.ambulanceNumber || request.ambulanceId?.slice(-8) || 'N/A';
};

const claimStats = [
  {
    id: 1,
    title: 'Total Ambulance',
    value: 0,
    borderColor: 'gray',
    bgColor: 'white',
    icon: claim,
  },
  {
    id: 2,
    title: 'Available Ambulance',
    value: 0,
    borderColor: '#0e9f2e',
    bgColor: 'rgba(14, 159, 46, 0.05)',
    icon: approved,
  },
  {
    id: 3,
    title: 'En Route',
    value: 0,
    borderColor: '#CFC923',
    bgColor: 'rgba(207, 201, 35, 0.05)',
    icon: en,
  },
  {
    id: 4,
    title: 'Unavailable',
    value: 0,
    borderColor: '#cf2323',
    bgColor: 'rgba(207, 35, 35, 0.05)',
    icon: disputed,
  },
];

const Request = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading, error, metaData } = useSelector((state: RootState) => state.ambulanceRequests);
  const { ambulances } = useSelector((state: RootState) => state.allAmbulances);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [summary, setSummary] = useState({
    totalAmbulances: 0,
    availableAmbulances: 0,
    busyAmbulances: 0,
    unAvailableAmbulances: 0,
  });
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [resolvingLocations, setResolvingLocations] = useState(false);
  const [ambulanceQuery, setAmbulanceQuery] = useState('');
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLatitude, setPickupLatitude] = useState('');
  const [pickupLongitude, setPickupLongitude] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationLatitude, setDestinationLatitude] = useState('');
  const [destinationLongitude, setDestinationLongitude] = useState('');
  const [emergencyType, setEmergencyType] = useState('Standby');
  const [numberOfDays, setNumberOfDays] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  //  useEffect(() => {
  //   console.log('Redux requests state:', requests);
  //   console.log('Loading:', loading);
  //   console.log('Error:', error);
  // }, [requests, loading, error]);
  useEffect(() => {
    dispatch(
      fetchAmbulanceRequests({
        Page: page,
        PageSize: 10,
      }),
    );
  }, [dispatch, page]);

  useEffect(() => {
    const loadSummary = async () => {
      const result = await dispatch(fetchAmbulanceSummary());
      if (fetchAmbulanceSummary.fulfilled.match(result)) {
        setSummary({
          totalAmbulances: result.payload?.totalAmbulances ?? 0,
          availableAmbulances: result.payload?.availableAmbulances ?? 0,
          busyAmbulances: result.payload?.busyAmbulances ?? 0,
          unAvailableAmbulances: result.payload?.unAvailableAmbulances ?? 0,
        });
      }
    };
    void loadSummary();
  }, [dispatch]);

  useEffect(() => {
    if (!openRequestDialog) return;
    if (!ambulances.length) {
      dispatch(fetchAmbulances({paginated: false}));
    }
  }, [dispatch, openRequestDialog, ambulances.length]);

  const selectedAmbulance = useMemo(
    () => ambulances.find(item => item.id === selectedAmbulanceId) || null,
    [ambulances, selectedAmbulanceId],
  );

  const filteredAmbulances = useMemo(() => {
    const q = ambulanceQuery.trim().toLowerCase();
    if (!q) return ambulances;
    return ambulances.filter(item =>
      item.plateNumber?.toLowerCase().includes(q) ||
      item.id?.toLowerCase().includes(q),
    );
  }, [ambulances, ambulanceQuery]);

  const resetRequestForm = () => {
    setAmbulanceQuery('');
    setSelectedAmbulanceId('');
    setPickupAddress('');
    setPickupLatitude('');
    setPickupLongitude('');
    setDestinationAddress('');
    setDestinationLatitude('');
    setDestinationLongitude('');
    setEmergencyType('Standby');
    setNumberOfDays('0');
    setStartDate('');
    setEndDate('');
  };

  const handleCreateRequest = async () => {
    if (!selectedAmbulance) {
      toast.error('Please select an ambulance');
      return;
    }
    if (!pickupAddress.trim() || !destinationAddress.trim()) {
      toast.error('Pickup and destination addresses are required');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Start and end dates are required');
      return;
    }
    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      toast.error('Start date cannot be after end date');
      return;
    }

    const geocodeAddress = async (addressValue: string) => {
      if (!googleMapsApiKey) {
        toast.error('Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY');
        return null;
      }
      const params = new URLSearchParams({
        address: addressValue,
        key: googleMapsApiKey,
      });
      try {
        const response = await fetch(`${GOOGLE_GEOCODE_BASE_URL}?${params.toString()}`);
        const payload = (await response.json()) as {
          status?: string;
          results?: Array<{geometry?: {location?: {lat?: number; lng?: number}}}>;
        };
        const location = payload.results?.[0]?.geometry?.location;
        const latitude = location?.lat;
        const longitude = location?.lng;
        if (payload.status !== 'OK' || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }
        return {latitude: Number(latitude), longitude: Number(longitude)};
      } catch {
        return null;
      }
    };

    const pickupLat = Number(pickupLatitude);
    const pickupLng = Number(pickupLongitude);
    const destinationLat = Number(destinationLatitude);
    const destinationLng = Number(destinationLongitude);

    let pickupCoords =
      Number.isFinite(pickupLat) && Number.isFinite(pickupLng)
        ? {latitude: pickupLat, longitude: pickupLng}
        : null;
    let destinationCoords =
      Number.isFinite(destinationLat) && Number.isFinite(destinationLng)
        ? {latitude: destinationLat, longitude: destinationLng}
        : null;

    if (!pickupCoords || !destinationCoords) {
      setResolvingLocations(true);
      if (!pickupCoords) {
        pickupCoords = await geocodeAddress(pickupAddress.trim());
      }
      if (!destinationCoords) {
        destinationCoords = await geocodeAddress(destinationAddress.trim());
      }
      setResolvingLocations(false);
    }

    if (!pickupCoords || !destinationCoords) {
      toast.error('Could not resolve pickup/destination location. Enter valid coordinates or addresses.');
      return;
    }

    setPickupLatitude(String(pickupCoords.latitude));
    setPickupLongitude(String(pickupCoords.longitude));
    setDestinationLatitude(String(destinationCoords.latitude));
    setDestinationLongitude(String(destinationCoords.longitude));

    const payload = {
      ambulanceProviderId: selectedAmbulance.ambulanceProviderId,
      ambulanceId: selectedAmbulance.id,
      pickupLocation: pickupCoords,
      pickupAddress: pickupAddress.trim(),
      destinationLocation: destinationCoords,
      destinationAddress: destinationAddress.trim(),
      emergencyType,
      numberOfDays: Number(numberOfDays) || 0,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    };

    setSubmittingRequest(true);
    const result = await dispatch(createAmbulanceRequest(payload));
    setSubmittingRequest(false);

    if (createAmbulanceRequest.fulfilled.match(result)) {
      toast.success('Ambulance request created');
      setOpenRequestDialog(false);
      resetRequestForm();
      dispatch(fetchAmbulanceRequests({Page: page, PageSize: 10}));
      const summaryResult = await dispatch(fetchAmbulanceSummary());
      if (fetchAmbulanceSummary.fulfilled.match(summaryResult)) {
        setSummary({
          totalAmbulances: summaryResult.payload?.totalAmbulances ?? 0,
          availableAmbulances: summaryResult.payload?.availableAmbulances ?? 0,
          busyAmbulances: summaryResult.payload?.busyAmbulances ?? 0,
          unAvailableAmbulances: summaryResult.payload?.unAvailableAmbulances ?? 0,
        });
      }
      return;
    }

    toast.error((result.payload as string) || 'Failed to create ambulance request');
  };

  // useEffect(() => {
  //   dispatch(fetchAmbulanceRequests());
  // }, [dispatch]);

  // Transform API data to match table structure
  const transformedRequests = useMemo(() => {
    return requests.map(request => ({
      id: request.id,
      location: getPickupAddress(request),
      request_id: request.id.slice(-8).toUpperCase(), 
      type: request.emergencyType || 'General',
      no: getAmbulanceDisplay(request),
      time: formatDate(request.creationDate ?? null),
      action: 'View details',
      isNew: false, 
      rawData: request, // Keep original data for details
    }));
  }, [requests]);

  const filteredClaims = transformedRequests.filter(
    item =>
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.request_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = metaData?.totalPages || 1;
  const paginatedRequests = filteredClaims;

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'location',
      header: 'Pickup Location',
      cell: ({row}) => (
        <div
          className={
            row.original.isNew
              ? 'font-semibold text-gray-900 flex flex-col'
              : 'flex flex-col'
          }
        >
          {row.original.isNew && (
            <span className="text-sm text-red-500">New</span>
          )}
          <span className={row.original.isNew ? 'font-semibold' : ''}>
            {row.original.location}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'time',
      header: 'Request Time',
      cell: ({row}) => (
        <span className={row.original.isNew ? 'font-semibold text-gray-900' : ''}>
          {row.original.time}
        </span>
      ),
    },
    {
      accessorKey: 'request_id',
      header: 'Request ID',
      cell: ({row}) => (
        <span className={row.original.isNew ? 'font-semibold text-gray-900' : ''}>
          #{row.original.request_id}
        </span>
      ),
    },
    {
      accessorKey: 'no',
      header: 'Ambulance Number',
      cell: ({row}) => (
        <span className={row.original.isNew ? 'font-semibold text-gray-900' : ''}>
          {row.original.no}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Emergency Type',
      cell: ({row}) => (
        <span className={row.original.isNew ? 'font-semibold text-gray-900' : ''}>
          {row.original.type}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({row}) => (
        <RequestDetails data={row.original.rawData} />
      ),
    },
  ];

  const table = useReactTable({
    data: paginatedRequests,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Function to apply filters from FilterDialog
  const handleApplyFilter = (filters: any) => {
    const newFilters: any[] = [];

    if (filters.status) {
      newFilters.push({id: 'status', value: filters.status});
    }
    if (filters.time) {
      newFilters.push({id: 'time', value: filters.time});
    }
    if (filters.type) {
      newFilters.push({id: 'type', value: filters.type});
    }

    setColumnFilters(newFilters);
  };

  // Function to reset filters
  const handleResetFilter = () => {
    setColumnFilters([]);
  };

  // Update stats from /ambulances/summary
  const updatedClaimStats = useMemo(() => {
    return claimStats.map(stat => {
      switch (stat.id) {
        case 1:
          return {...stat, value: summary.totalAmbulances};
        case 2:
          return {...stat, value: summary.availableAmbulances};
        case 3:
          return {...stat, value: summary.busyAmbulances};
        case 4:
          return {...stat, value: summary.unAvailableAmbulances};
        default:
          return stat;
      }
    });
  }, [summary]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader/>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full">
        <div className="my-10 mx-8 flex flex-col lg:flex-row justify-between gap-6 items-center">
          {updatedClaimStats.map(stat => (
            <div
              key={stat.id}
              className="flex justify-between items-center rounded-md bg-white p-6 w-full"
              style={{
                border: `2px solid ${stat.borderColor}`,
                backgroundColor: stat.bgColor,
              }}
            >
              <div>
                <h4 className="text-2xl leading-tight mb-2">{stat.value}</h4>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
              <div>
                <img src={stat.icon} alt={stat.title} className='w-8 h-8' />
              </div>
            </div>
          ))}
        </div>

        <div className="lg:mx-8 mt-10 bg-white mb-32 rounded-md flex flex-col">
          <div className="flex flex-wrap gap-4 justify-between items-center p-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg text-gray-800">All Ambulance Requests</h1>
              <input
                type="text"
                placeholder="Search location, ambulance number, or type"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border rounded-lg hidden lg:block px-4 py-2 lg:w-96 lg:max-w-2xl focus:outline-none"
              />
            </div>
            <div className="flex gap-4 items-center">
              <Button className="py-2.5 w-44" onClick={() => setOpenRequestDialog(true)}>
                Request Ambulance
              </Button>
              <Dialog open={openRequestDialog} onOpenChange={setOpenRequestDialog}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Request Ambulance</DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-700">Ambulance</label>
                      <input
                        value={ambulanceQuery}
                        onChange={e => setAmbulanceQuery(e.target.value)}
                        placeholder="Search by plate number or id"
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                      <select
                        value={selectedAmbulanceId}
                        onChange={e => setSelectedAmbulanceId(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mt-2 outline-none bg-white"
                      >
                        <option value="">Select ambulance</option>
                        {filteredAmbulances.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.plateNumber} ({item.id.slice(-8).toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">Pickup Address</label>
                      <input
                        value={pickupAddress}
                        onChange={e => setPickupAddress(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Destination Address</label>
                      <input
                        value={destinationAddress}
                        onChange={e => setDestinationAddress(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">Pickup Latitude</label>
                      <input
                        value={pickupLatitude}
                        onChange={e => setPickupLatitude(e.target.value)}
                        placeholder="Auto from address if left empty"
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Pickup Longitude</label>
                      <input
                        value={pickupLongitude}
                        onChange={e => setPickupLongitude(e.target.value)}
                        placeholder="Auto from address if left empty"
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">Destination Latitude</label>
                      <input
                        value={destinationLatitude}
                        onChange={e => setDestinationLatitude(e.target.value)}
                        placeholder="Auto from address if left empty"
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Destination Longitude</label>
                      <input
                        value={destinationLongitude}
                        onChange={e => setDestinationLongitude(e.target.value)}
                        placeholder="Auto from address if left empty"
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">Emergency Type</label>
                      <Select value={emergencyType} onValueChange={setEmergencyType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select emergency type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standby">Standby</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">Number of Days</label>
                      <input
                        type="number"
                        min="0"
                        value={numberOfDays}
                        onChange={e => setNumberOfDays(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">Start Date</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">End Date</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button onClick={handleCreateRequest} disabled={submittingRequest || resolvingLocations}>
                      {resolvingLocations ? 'Resolving locations...' : submittingRequest ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <RequestFilter
                onApply={handleApplyFilter}
                onReset={handleResetFilter}
              />
              <Button variant="ghost" className="py-2.5 w-44">
                <ArrowDownLeft size={30} />
                Export
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 lg:px-0 mt-4">
            <Table className="min-w-[600px]">
              <TableHeader>
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map(cell => (
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
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-medium">No ambulance requests found</span>
                        {searchTerm && (
                          <span className="text-sm text-gray-500 mt-1">
                            Try adjusting your search terms
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-end">
            <Pagination
              totalEntriesSize={metaData?.totalCount || filteredClaims.length}
             
              currentPage={metaData?.currentPage || page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={() => {
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Request;
