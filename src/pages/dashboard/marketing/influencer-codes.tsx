import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Loader } from '@/components/ui/loading';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { RootState, AppDispatch } from '@/services/store';
import { fetchMarketingCampaigns, activateMarketingCampaign, deactivateMarketingCampaign } from '@/services/thunks';
import toast from 'react-hot-toast';

const InfluencerCodesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, metaData, loading, error, activating, deactivating } = useSelector((s: RootState) => s.marketingCampaigns);

  // Filters / pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [nameFilter, setNameFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch campaigns when filters/page change
  useEffect(() => {
    dispatch(fetchMarketingCampaigns({
      Page: page,
      PageSize: pageSize,
      Name: nameFilter || undefined,
      CouponCode: codeFilter || undefined,
      Status: statusFilter ? Number(statusFilter) : undefined,
    }));
  }, [dispatch, page, pageSize, nameFilter, codeFilter, statusFilter]);

  // Get status label
  const getStatusLabel = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') {
      return { label: 'Active', className: 'text-green-700 bg-green-100' };
    } else if (s === 'inactive') {
      return { label: 'Inactive', className: 'text-red-700 bg-red-100' };
    } else {
      return { label: status || 'Unknown', className: 'text-gray-700 bg-gray-100' };
    }
  };

  // Activate an influencer code
  const handleActivate = async (id: string) => {
    try {
      await dispatch(activateMarketingCampaign(id)).unwrap();
      toast.success('Influencer code activated successfully');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to activate influencer code');
    }
  };

  // Deactivate an influencer code
  const handleDeactivate = async (id: string) => {
    try {
      await dispatch(deactivateMarketingCampaign(id)).unwrap();
      toast.success('Influencer code deactivated successfully');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to deactivate influencer code');
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen overflow-auto">
        {/* Header */}
        <div className="my-6 mx-8 flex justify-between items-center">
          <div className="text-xl font-semibold">Influencer Codes</div>
        </div>

        {/* Table Section */}
        <div className="lg:mx-8 mt-6 bg-white mb-32 rounded-md flex flex-col">
          {/* Search and Filter Row */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-4 border-b">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Input
                  className="w-48 pl-10"
                  placeholder="Search by name"
                  value={nameFilter}
                  onChange={e => { setPage(1); setNameFilter(e.target.value); }}
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="relative">
                <Input
                  className="w-48 pl-10"
                  placeholder="Search by coupon code"
                  value={codeFilter}
                  onChange={e => { setPage(1); setCodeFilter(e.target.value); }}
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Select value={statusFilter} onValueChange={(val) => { setPage(1); setStatusFilter(val); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {(nameFilter || codeFilter || statusFilter) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setNameFilter(''); setCodeFilter(''); setStatusFilter(''); setPage(1); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="whitespace-nowrap">Coupon Code</TableHead>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead className="whitespace-nowrap">Date Created</TableHead>
                  <TableHead className="whitespace-nowrap">Users Registered</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader height="h-12" />
                    </TableCell>
                  </TableRow>
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-sm text-gray-500">
                      No promotional codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map(item => {
                    const statusInfo = getStatusLabel(item.status);
                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium whitespace-nowrap">{item.couponCode}</TableCell>
                        <TableCell className="whitespace-nowrap">{item.name || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{item.email || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.dateCreated ? new Date(item.dateCreated).toLocaleDateString('en-GB') : '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{item.totalUsersRegistered}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}>
                            ● {statusInfo.label}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-gray-100"
                                disabled={activating || deactivating}
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {item.status?.toLowerCase() === 'inactive' ? (
                                <DropdownMenuItem 
                                  onClick={() => handleActivate(item.id)}
                                  className="text-green-600"
                                >
                                  Activate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleDeactivate(item.id)}
                                  className="text-red-600"
                                >
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {metaData && (
            <div className="p-4 flex justify-end">
              <Pagination
                totalEntriesSize={metaData.totalCount}
                currentPage={metaData.currentPage || page}
                totalPages={metaData.totalPages || 1}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }}
              />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="px-5 pb-4 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InfluencerCodesPage;
