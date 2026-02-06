import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Loader } from '@/components/ui/loading';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RootState, AppDispatch } from '@/services/store';
import { 
  fetchMarketingCampaigns, 
  fetchMarketingCampaignSummary,
  fetchMarketingCampaignById,
  exportMarketingCampaigns,
  createMarketingCampaignEntry,
  activateMarketingCampaign, 
  deactivateMarketingCampaign,
  fetchPromoCodes
} from '@/services/thunks';
import { StatsCards } from '@/components/ui/stats-card';
import { Download, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import claim from '/svg/claim.svg';
import approved from '/svg/approved.svg';
import disputed from '/svg/top.svg';

type TabType = 'influencer' | 'promo';

const PromotionalCodesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Marketing Campaign (Influencer) state
  const { 
    summary, 
    list: influencerList, 
    selected: selectedInfluencer,
    metaData: influencerMetaData, 
    loading: influencerLoading, 
    loadingSummary,
    loadingDetail: influencerLoadingDetail,
    exporting: influencerExporting,
    activating: influencerActivating, 
    deactivating: influencerDeactivating 
  } = useSelector((s: RootState) => s.marketingCampaigns);

  // Promo Code state
  const {
    list: promoList,
    metaData: promoMetaData,
    loading: promoLoading
  } = useSelector((s: RootState) => s.promoCodes);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('influencer');

  // Influencer filters / pagination
  const [influencerPage, setInfluencerPage] = useState(1);
  const [influencerPageSize, setInfluencerPageSize] = useState(10);
  const [nameFilter, setNameFilter] = useState('');
  const [codeFilter] = useState('');
  const [statusFilter] = useState<string>('');

  // Detail modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Promo filters / pagination
  const [promoPage, setPromoPage] = useState(1);
  const [promoPageSize, setPromoPageSize] = useState(10);
  const [promoCodeFilter, setPromoCodeFilter] = useState('');
  const [promoStatusFilter] = useState<string>('');

  // Generate Code Dialog State
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [codeType, setCodeType] = useState<'promo' | 'influencer' | ''>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch summary once
  useEffect(() => {
    dispatch(fetchMarketingCampaignSummary());
  }, [dispatch]);

  // Fetch detail when modal opened and id set
  useEffect(() => {
    if (detailOpen && selectedId) {
      dispatch(fetchMarketingCampaignById(selectedId));
    }
  }, [detailOpen, selectedId, dispatch]);

  // Fetch influencer codes when filters/page change
  useEffect(() => {
    if (activeTab === 'influencer') {
      dispatch(fetchMarketingCampaigns({
        Page: influencerPage,
        PageSize: influencerPageSize,
        Name: nameFilter || undefined,
        CouponCode: codeFilter || undefined,
        Status: statusFilter ? Number(statusFilter) : undefined,
      }));
    }
  }, [dispatch, activeTab, influencerPage, influencerPageSize, nameFilter, codeFilter, statusFilter]);

  // Fetch promo codes when tab is promo
  useEffect(() => {
    if (activeTab === 'promo') {
      dispatch(fetchPromoCodes({
        Page: promoPage,
        PageSize: promoPageSize,
        Code: promoCodeFilter || undefined,
        Status: promoStatusFilter ? Number(promoStatusFilter) : undefined,
      }));
    }
  }, [dispatch, activeTab, promoPage, promoPageSize, promoCodeFilter, promoStatusFilter]);

  // Stats cards
  const stats = [
    {
      id: 1,
      title: 'Total Referrals Used',
      value: loadingSummary ? '...' : (summary?.totalMarketingCampaignEntryUsed ?? 0),
      borderColor: '#2f80ed',
      bgColor: 'rgba(80, 159, 239, 0.2)',
      icon: claim,
    },
    {
      id: 2,
      title: 'Most Used Code',
      value: loadingSummary ? '...' : (summary?.couponCode || '-'),
      borderColor: '#0e9f2e',
      bgColor: 'rgba(14, 159, 46, 0.05)',
      icon: approved,
    },
    {
      id: 3,
      title: 'Top Performing Staff',
      value: loadingSummary ? '...' : (summary?.name?.trim() || '-'),
      borderColor: '#CFC923',
      bgColor: 'rgba(207, 201, 35, 0.05)',
      icon: disputed,
    },
  ];

  // Get status label for influencer (string status)
  const getInfluencerStatusLabel = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') {
      return { label: 'Active', className: 'text-green-700 border-2 border-green-100' };
    } else if (s === 'inactive' || s === 'deactivated') {
      return { label: 'Inactive', className: 'text-red-600 border-2 border-red-100' };
    } else {
      return { label: status || 'Unknown', className: 'text-gray-700 border-2 border-gray-100' };
    }
  };

  // Get status label for promo (number status)
  const getPromoStatusLabel = (status: number) => {
    if (status === 1) {
      return { label: 'Active', className: 'text-green-700 bg-green-100' };
    } else {
      return { label: 'Deactivated', className: 'text-gray-600 bg-gray-100' };
    }
  };

  // Influencer handlers
  const handleActivateInfluencer = async (id: string) => {
    try {
      await dispatch(activateMarketingCampaign(id)).unwrap();
      toast.success('Influencer code activated successfully');
      // Refresh the detail to show updated status
      await dispatch(fetchMarketingCampaignById(id));
      // Refresh the list as well
      dispatch(fetchMarketingCampaigns({
        Page: influencerPage,
        PageSize: influencerPageSize,
        Name: nameFilter || undefined,
        CouponCode: codeFilter || undefined,
        Status: statusFilter ? Number(statusFilter) : undefined,
      }));
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to activate influencer code');
    }
  };

  const handleDeactivateInfluencer = async (id: string) => {
    try {
      await dispatch(deactivateMarketingCampaign(id)).unwrap();
      toast.success('Influencer code deactivated successfully');
      // Refresh the detail to show updated status
      await dispatch(fetchMarketingCampaignById(id));
      // Refresh the list as well
      dispatch(fetchMarketingCampaigns({
        Page: influencerPage,
        PageSize: influencerPageSize,
        Name: nameFilter || undefined,
        CouponCode: codeFilter || undefined,
        Status: statusFilter ? Number(statusFilter) : undefined,
      }));
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to deactivate influencer code');
    }
  };

  // Promo handlers
//   const handleActivatePromo = async (id: string) => {
//     try {
//       await dispatch(activatePromoCode(id)).unwrap();
//       toast.success('Promo code activated successfully');
//     } catch (error) {
//       toast.error(typeof error === 'string' ? error : 'Failed to activate promo code');
//     }
//   };

//   const handleDeactivatePromo = async (id: string) => {
//     try {
//       await dispatch(deactivatePromoCode(id)).unwrap();
//       toast.success('Promo code deactivated successfully');
//     } catch (error) {
//       toast.error(typeof error === 'string' ? error : 'Failed to deactivate promo code');
//     }
//   };

  // Open detail modal
  const handleViewDetails = (id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  // Export influencer codes
  const handleExportInfluencer = (format: number) => {
    dispatch(exportMarketingCampaigns({
      format,
      CouponCode: codeFilter || undefined,
      Name: nameFilter || undefined,
      Status: statusFilter ? Number(statusFilter) : undefined,
    }))
      .unwrap()
      .then(payload => {
        const blob = payload.blob as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `influencer-codes.${format === 1 ? 'xlsx' : 'csv'}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Export successful');
      })
      .catch(() => {
        toast.error('Failed to export influencer codes');
      });
  };

  // Reset generate dialog state
  const resetGenerateDialog = () => {
    setCodeType('');
    setFirstName('');
    setLastName('');
    setUserName('');
    setEmail('');
    setGeneratedCode('');
    setShowSuccess(false);
  };

  // Open generate dialog
  const openGenerateDialog = () => {
    resetGenerateDialog();
    setGenerateDialogOpen(true);
  };

  // Close generate dialog
  const closeGenerateDialog = () => {
    setGenerateDialogOpen(false);
    resetGenerateDialog();
  };

  // Handle create influencer code
  const handleCreateInfluencerCode = async () => {
    if (!firstName.trim() || !lastName.trim() || !userName.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await dispatch(createMarketingCampaignEntry({
        FirstName: firstName.trim(),
        LastName: lastName.trim(),
        UserName: userName.trim(),
        Email: email.trim(),
      })).unwrap();
      
      // Set the generated code from the response
      setGeneratedCode(result?.couponCode || result?.code || result);
      setShowSuccess(true);
      
      // Refresh the list after showing success
      setTimeout(() => {
        dispatch(fetchMarketingCampaigns({ Page: influencerPage, PageSize: influencerPageSize }));
        dispatch(fetchMarketingCampaignSummary());
      }, 1500);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to create influencer code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle create promo code (placeholder for future implementation)
  const handleCreatePromoCode = async () => {
    // TODO: Implement promo code creation when API is available
    toast.error('Promo code creation is not yet available');
  };

  // Check if influencer form is valid for submission
  const isInfluencerFormValid = () => {
    return firstName.trim() && lastName.trim() && userName.trim() && email.trim();
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen overflow-auto">
        {/* Header */}
        <div className="my-6 mx-8 flex justify-between items-center">
          <div className="text-xl font-semibold">All Promotion Codes</div>
          <Button className="bg-primary" onClick={openGenerateDialog}>Generate new code</Button>
        </div>

        {/* Stats Section */}
        <StatsCards stats={stats} error={false} />

        {/* Table Section with Tabs */}
        <div className="lg:mx-8 mt-6 bg-white mb-32 rounded-md flex flex-col">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('influencer')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'influencer' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Influencer code
              </button>
              <button
                onClick={() => setActiveTab('promo')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'promo' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Promo code
              </button>
            </div>
          </div>

          {/* Search and Filter Row */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-4 border-b">
            <div className="flex items-center gap-3 flex-wrap">
              {activeTab === 'influencer' ? (
                <>
                  <div className="relative">
                    <Input
                      className="w-48 pl-10"
                      placeholder="Search user's name"
                      value={nameFilter}
                      onChange={e => { setInfluencerPage(1); setNameFilter(e.target.value); }}
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Button variant="outline" size="sm">Filter</Button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Input
                      className="w-48 pl-10"
                      placeholder="Search by code"
                      value={promoCodeFilter}
                      onChange={e => { setPromoPage(1); setPromoCodeFilter(e.target.value); }}
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Button variant="outline" size="sm">Filter</Button>
                </>
              )}
            </div>
            {activeTab === 'influencer' && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={influencerExporting}
                  onClick={() => handleExportInfluencer(0)}
                  className="text-primary border-primary hover:bg-primary/5 gap-1"
                >
                  <Download size={14} /> CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={influencerExporting}
                  onClick={() => handleExportInfluencer(1)}
                  className="text-primary border-primary hover:bg-primary/5 gap-1"
                >
                  <Download size={14} /> Excel
                </Button>
              </div>
            )}
          </div>

          {/* Influencer Table */}
          {activeTab === 'influencer' && (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Referral Code</TableHead>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Reg. Users</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {influencerLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <Loader height="h-12" />
                        </TableCell>
                      </TableRow>
                    ) : influencerList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-sm text-gray-500">
                          No influencer codes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      influencerList.map(item => {
                        const statusInfo = getInfluencerStatusLabel(item.status);
                        return (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell className="whitespace-nowrap">
                              {item.dateCreated ? new Date(item.dateCreated).toLocaleDateString('en-GB') : '-'}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">{item.couponCode}</TableCell>
                            <TableCell className="whitespace-nowrap">{item.name || '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">{item.email || '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">{item.totalUsersRegistered}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium ${statusInfo.className}`}>
                                ● {statusInfo.label}
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <button
                                onClick={() => handleViewDetails(item.id)}
                                className="text-primary text-sm hover:underline"
                              >
                                View Details
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {influencerMetaData && (
                <div className="p-4 flex justify-end">
                  <Pagination
                    totalEntriesSize={influencerMetaData.totalCount}
                    currentPage={influencerMetaData.currentPage || influencerPage}
                    totalPages={influencerMetaData.totalPages || 1}
                    onPageChange={setInfluencerPage}
                    pageSize={influencerPageSize}
                    onPageSizeChange={(s: number) => { setInfluencerPageSize(s); setInfluencerPage(1); }}
                  />
                </div>
              )}
            </>
          )}

          {/* Promo Table */}
          {activeTab === 'promo' && (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Referral Code</TableHead>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Reg. Users</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <Loader height="h-12" />
                        </TableCell>
                      </TableRow>
                    ) : promoList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-sm text-gray-500">
                          No promo codes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      promoList.map(item => {
                        const statusInfo = getPromoStatusLabel(item.status);
                        return (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell className="whitespace-nowrap">
                              {item.dateCreated ? new Date(item.dateCreated).toLocaleDateString('en-GB') : '-'}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">{item.code}</TableCell>
                            <TableCell className="whitespace-nowrap">{item.description || '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">-</TableCell>
                            <TableCell className="whitespace-nowrap">{item.usageCount}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                                ● {statusInfo.label}
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <button
                                onClick={() => {}}
                                className="text-primary text-sm hover:underline"
                              >
                                View Details
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {promoMetaData && (
                <div className="p-4 flex justify-end">
                  <Pagination
                    totalEntriesSize={promoMetaData.totalCount}
                    currentPage={promoMetaData.currentPage || promoPage}
                    totalPages={promoMetaData.totalPages || 1}
                    onPageChange={setPromoPage}
                    pageSize={promoPageSize}
                    onPageSizeChange={(s: number) => { setPromoPageSize(s); setPromoPage(1); }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={(o) => { if (!o) { setDetailOpen(false); } }}>
        <DialogContent className="z-[100] max-h-[80vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Influencer Code Detail</DialogTitle>
          </DialogHeader>
          {influencerLoadingDetail ? (
            <div className="py-10 flex justify-center"><Loader height="h-20" /></div>
          ) : selectedInfluencer ? (
            <div className="space-y-6">
              {/* Status and Actions Row */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium ${
                    (selectedInfluencer.status || '').toLowerCase() === 'active' 
                      ? 'text-green-700 bg-green-100' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    ● {selectedInfluencer.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {(selectedInfluencer.status || '').toLowerCase() === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      disabled={influencerDeactivating}
                      onClick={() => handleDeactivateInfluencer(selectedInfluencer.id)}
                    >
                      {influencerDeactivating ? 'Deactivating...' : 'Deactivate'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      disabled={influencerActivating}
                      onClick={() => handleActivateInfluencer(selectedInfluencer.id)}
                    >
                      {influencerActivating ? 'Activating...' : 'Activate'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Code:</span> <span className="font-medium ml-1">{selectedInfluencer.couponCode}</span></div>
                <div><span className="text-gray-500">Date Created:</span> <span className="font-medium ml-1">{selectedInfluencer.dateCreated ? new Date(selectedInfluencer.dateCreated).toLocaleDateString('en-GB') : '-'}</span></div>
                <div><span className="text-gray-500">Name:</span> <span className="font-medium ml-1">{selectedInfluencer.name || '-'}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-medium ml-1">{selectedInfluencer.email || '-'}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Total Users:</span> <span className="font-medium ml-1">{selectedInfluencer.marketingCampaignEntryUsers?.length || 0}</span></div>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Users Referred</h3>
              </div>
              <div className="border rounded-md max-h-64 overflow-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Phone</TableHead>
                      <TableHead className="whitespace-nowrap">Date Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!selectedInfluencer.marketingCampaignEntryUsers || selectedInfluencer.marketingCampaignEntryUsers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-xs text-gray-500">No users yet</TableCell>
                      </TableRow>
                    )}
                    {selectedInfluencer.marketingCampaignEntryUsers?.map((u, idx) => (
                      <TableRow key={u.email || idx}>
                        <TableCell className="font-medium whitespace-nowrap">{u.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{u.email}</TableCell>
                        <TableCell className="whitespace-nowrap">{u.phoneNumber}</TableCell>
                        <TableCell className="whitespace-nowrap">{u.registrationDate ? new Date(u.registrationDate).toLocaleDateString('en-GB') : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No data</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Code Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={(o) => { if (!o) closeGenerateDialog(); }}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <DialogTitle className="text-lg font-semibold">Generate Code</DialogTitle>
            <button
              type="button"
              onClick={closeGenerateDialog}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {showSuccess ? (
              // Success State
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">Successful!</h3>
                {/* <p className="text-gray-500 text-sm">
                  Your code was generated successfully and<br />it is now active
                </p> */}
                {generatedCode && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-md">
                    <span className="text-sm text-gray-500">Generated Code:</span>
                    <p className="text-lg font-bold text-primary">{generatedCode}</p>
                  </div>
                )}
                <Button className="mt-6 px-8" onClick={closeGenerateDialog}>
                  Done
                </Button>
              </div>
            ) : (
              // Form State
              <div className="space-y-5">
                {/* Code Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Code type</Label>
                  <Select value={codeType} onValueChange={(val: 'promo' | 'influencer') => setCodeType(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select code type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promo">Promo code</SelectItem>
                      <SelectItem value="influencer">Influencer code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Influencer Code Form */}
                {codeType === 'influencer' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">First Name</Label>
                      <Input
                        placeholder="Enter first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Last Name</Label>
                      <Input
                        placeholder="Enter last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Username</Label>
                      <Input
                        placeholder="Enter username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Email</Label>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <Button
                      className="w-full mt-4"
                      disabled={!isInfluencerFormValid() || isSubmitting}
                      onClick={handleCreateInfluencerCode}
                    >
                      {isSubmitting ? 'Generating...' : 'Generate Code'}
                    </Button>
                  </>
                )}

                {/* Promo Code Form (placeholder) */}
                {codeType === 'promo' && (
                  <>
                    <div className="py-4 text-center text-gray-500 text-sm">
                      Promo code creation coming soon
                    </div>
                    <Button
                      className="w-full mt-4"
                      disabled
                      onClick={handleCreatePromoCode}
                    >
                      Generate Code
                    </Button>
                  </>
                )}

                {/* Empty state when no code type selected */}
                {!codeType && (
                  <div className="py-4" />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PromotionalCodesPage;
