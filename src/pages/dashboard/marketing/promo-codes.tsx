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
import { fetchPromoCodes, activatePromoCode, deactivatePromoCode } from '@/services/thunks';
import toast from 'react-hot-toast';

const PromoCodesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, metaData, loading, error, activating, deactivating } = useSelector((s: RootState) => s.promoCodes);

  // Filters / pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [codeFilter, setCodeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch promo codes when filters/page change
  useEffect(() => {
    dispatch(fetchPromoCodes({
      Page: page,
      PageSize: pageSize,
      Code: codeFilter || undefined,
      Status: statusFilter ? Number(statusFilter) : undefined,
    }));
  }, [dispatch, page, pageSize, codeFilter, statusFilter]);

  // Get status label
  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'Inactive', className: 'text-gray-500 bg-gray-100' };
      case 1:
        return { label: 'Active', className: 'text-green-600 bg-green-50' };
      default:
        return { label: 'Unknown', className: 'text-gray-500 bg-gray-100' };
    }
  };

  // Activate a promo code
  const handleActivate = async (id: string) => {
    try {
      await dispatch(activatePromoCode(id)).unwrap();
      toast.success('Promo code activated successfully');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to activate promo code');
    }
  };

  // Deactivate a promo code
  const handleDeactivate = async (id: string) => {
    try {
      await dispatch(deactivatePromoCode(id)).unwrap();
      toast.success('Promo code deactivated successfully');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to deactivate promo code');
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen overflow-auto">
        {/* Header */}
        <div className="my-6 mx-8 flex justify-between items-center">
          <div className="text-xl font-semibold">Promo Codes</div>
        </div>

        {/* Table Section */}
        <div className="lg:mx-8 mt-6 bg-white mb-32 rounded-md flex flex-col">
          {/* Search and Filter Row */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-4 border-b">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Input
                  className="w-48 pl-10"
                  placeholder="Search by code"
                  value={codeFilter}
                  onChange={e => { setPage(1); setCodeFilter(e.target.value); }}
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setPage(1); setStatusFilter(v); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {(codeFilter || statusFilter) && (
                <Button variant="ghost" size="sm" onClick={() => { setCodeFilter(''); setStatusFilter(''); setPage(1); }}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount %</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      No promo codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map(item => {
                    const statusInfo = getStatusLabel(item.status);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.description || '-'}</TableCell>
                        <TableCell>{item.discountPercentage}%</TableCell>
                        <TableCell>{item.usageCount} / {item.maxUsage}</TableCell>
                        <TableCell>{formatDate(item.startDate)}</TableCell>
                        <TableCell>{formatDate(item.endDate)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={activating || deactivating}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {item.status === 0 ? (
                                <DropdownMenuItem onClick={() => handleActivate(item.id)}>
                                  Activate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleDeactivate(item.id)}>
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
          )}

          {/* Pagination */}
          {metaData && metaData.totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination
                totalEntriesSize={metaData.totalCount}
                currentPage={page}
                totalPages={metaData.totalPages}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={() => {}}
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

export default PromoCodesPage;
