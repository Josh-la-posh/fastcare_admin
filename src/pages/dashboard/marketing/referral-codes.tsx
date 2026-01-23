import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { RootState, AppDispatch } from '@/services/store';
import {
  fetchReferralSummary,
  fetchReferralCodes,
  fetchReferralCodeById,
  exportReferralCodes,
  exportReferralCodeUsers,
  generateReferralCodes,
} from '@/services/thunks';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, X, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ReferralRow {
  id: string;
  code: string;
  staffName: string;
  email: string;
  totalUsersRegistered: number;
  isActive: boolean;
  date: string;
}

const ReferralCodesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    summary,
    codes,
    metaData,
    selected,
    loadingSummary,
    loadingList,
    loadingDetail,
    exportingList,
    exportingUsers,
    errorSummary,
    errorList,
    errorDetail,
  } = useSelector((s: RootState) => s.referrals);

  // Filters / pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [codeFilter, setCodeFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'influencer' | 'promo'>('influencer');

  // Generate Code Dialog State
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [codeType, setCodeType] = useState<'promo' | 'influencer' | ''>('');
  const [codeTitle, setCodeTitle] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [influencerName, setInfluencerName] = useState('');
  const [influencerEmail, setInfluencerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch summary once
  useEffect(() => {
    dispatch(fetchReferralSummary());
  }, [dispatch]);

  // Fetch list whenever filters/page change
  useEffect(() => {
    dispatch(fetchReferralCodes({ Page: page, PageSize: pageSize, Code: codeFilter || undefined, StaffName: staffFilter || undefined }));
  }, [dispatch, page, pageSize, codeFilter, staffFilter]);

  // Fetch detail when modal opened and id set
  useEffect(() => {
    if (detailOpen && selectedId) {
      dispatch(fetchReferralCodeById(selectedId));
    }
  }, [detailOpen, selectedId, dispatch]);

  const rows: ReferralRow[] = useMemo(() => codes.map(c => ({
    id: c.id,
    code: c.code,
    staffName: c.staffName?.trim() || '-',
    email: c.email || '-',
    totalUsersRegistered: c.totalUsersRegistered,
    isActive: c.isActive ?? true,
    date: c.dateCreated ? new Date(c.dateCreated).toLocaleDateString('en-GB') : '-',
  })), [codes]);

  const handleExportList = (format: number) => {
    dispatch(exportReferralCodes({ format, Code: codeFilter || undefined, StaffName: staffFilter || undefined }))
      .unwrap()
      .then(payload => {
        const blob = payload.blob as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `referral-codes.${format === 1 ? 'xlsx' : 'csv'}`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {/* swallow - errors reflected in slice state */});
  };

  const handleExportUsers = (format: number) => {
    if (!selectedId) return;
    dispatch(exportReferralCodeUsers({ id: selectedId, format }))
      .unwrap()
      .then(payload => {
        const blob = payload.blob as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `referral-code-${selectedId}-users.${format === 1 ? 'xlsx' : 'csv'}`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {/* error handled in slice */});
  };

  // Generate a random alphanumeric code
  const handleGenerateNewCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(code);
  };

  // Reset generate dialog state
  const resetGenerateDialog = () => {
    setCodeType('');
    setCodeTitle('');
    setGeneratedCode('');
    setInfluencerName('');
    setInfluencerEmail('');
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

  // Handle publish/generate code
  const handlePublishCode = async () => {
    if (!generatedCode) return;
    
    setIsSubmitting(true);
    try {
      // For influencer code, use the email; for promo code, we might use a placeholder or title
      const email = codeType === 'influencer' ? influencerEmail : `${codeTitle.replace(/\s+/g, '').toLowerCase()}@promo.fastcare.com`;
      
      await dispatch(generateReferralCodes({ UserEmails: [email] })).unwrap();
      setShowSuccess(true);
      
      // Refresh the list after a short delay
      setTimeout(() => {
        dispatch(fetchReferralCodes({ Page: page, PageSize: pageSize }));
        dispatch(fetchReferralSummary());
      }, 1500);
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!codeType || !generatedCode) return false;
    if (codeType === 'promo' && !codeTitle.trim()) return false;
    if (codeType === 'influencer' && (!influencerName.trim() || !influencerEmail.trim())) return false;
    return true;
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 overflow-scroll h-full">
        {/* Page Title */}
        <div className="pt-6 px-8">
          <h1 className="text-2xl font-semibold text-gray-800">Promotion Codes</h1>
        </div>

        {/* Header with "All Promotion code" label and Generate button */}
        <div className="my-6 mx-8 flex justify-between items-center">
          <div className="border-2 border-dashed border-primary rounded-md px-6 py-3">
            <span className="text-primary font-medium">All Promotion code</span>
          </div>
          <Button className="px-6" onClick={openGenerateDialog}>Generate promo code</Button>
        </div>

        {/* Summary Cards - matching the design */}
        <div className="my-6 mx-8 flex flex-col lg:flex-row justify-between gap-6">
          {/* Card 1: Total Referrals Used */}
          <div className="flex items-center rounded-lg bg-white border border-gray-200 w-full overflow-hidden">
            <div className="bg-[#E3F2FD] p-6 flex items-center justify-center">
              <div className="w-10 h-10 bg-[#2196F3] rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="p-4 flex-1">
              <h4 className="text-2xl font-bold text-gray-800">
                {loadingSummary ? '...' : errorSummary ? <span className="text-red-600 text-sm">Err</span> : (summary?.totalReferralCodeUsed ?? 0)}
              </h4>
              <p className="text-sm text-gray-500">Total Referrals Used</p>
            </div>
          </div>

          {/* Card 2: Most Used Code */}
          <div className="flex items-center rounded-lg bg-white border border-gray-200 w-full overflow-hidden">
            <div className="bg-[#E8F5E9] p-6 flex items-center justify-center">
              <div className="w-10 h-10 bg-[#4CAF50] rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="p-4 flex-1">
              <h4 className="text-2xl font-bold text-gray-800">
                {loadingSummary ? '...' : errorSummary ? <span className="text-red-600 text-sm">Err</span> : (summary?.code ?? '-')}
              </h4>
              <p className="text-sm text-gray-500">Most Used Code</p>
            </div>
          </div>

          {/* Card 3: Top Performing Staff */}
          <div className="flex items-center rounded-lg bg-white border border-gray-200 w-full overflow-hidden">
            <div className="bg-[#FFF8E1] p-6 flex items-center justify-center">
              <div className="w-10 h-10 bg-[#FFC107] rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="p-4 flex-1">
              <h4 className="text-2xl font-bold text-gray-800">
                {loadingSummary ? '...' : errorSummary ? <span className="text-red-600 text-sm">Err</span> : (summary?.staffName?.trim() || '-')}
              </h4>
              <p className="text-sm text-gray-500">Top Performing Staff</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="lg:mx-8 mt-6 bg-white mb-32 rounded-md flex flex-col">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'influencer' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('influencer')}
              >
                Influencer code
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'promo' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('promo')}
              >
                Promo code
              </button>
            </div>
          </div>

          {/* Search and Filter Row */}
          <div className="flex flex-wrap gap-4 justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  className="w-64 pl-10"
                  placeholder="Search user's name"
                  value={staffFilter}
                  onChange={e => { setPage(1); setStaffFilter(e.target.value); }}
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Button variant="outline" className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </Button>
            </div>
            <Button variant="outline" disabled={exportingList} className="gap-2">
              {exportingList ? 'Exporting...' : 'Export'}
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Reg. Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingList ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader height="h-12" />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-sm text-gray-500">No promotion codes found</TableCell>
                  </TableRow>
                ) : (
                  rows.map(r => (
                    <TableRow key={r.id} className="hover:bg-gray-50">
                      <TableCell>{r.date || '-'}</TableCell>
                      <TableCell className="font-medium">{r.code}</TableCell>
                      <TableCell>{r.staffName}</TableCell>
                      <TableCell>{r.email || '-'}</TableCell>
                      <TableCell>{r.totalUsersRegistered}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${r.isActive ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                          {r.isActive ? '● Active' : '● Deactivated'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => { setSelectedId(r.id); setDetailOpen(true); }}
                          className="text-primary font-medium hover:underline"
                        >
                          View Details
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
          {errorList && !loadingList && (
            <div className="px-5 pb-4 text-sm text-red-600">{errorList}</div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={(o) => { if (!o) { setDetailOpen(false); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Referral Code Detail</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="py-10 flex justify-center"><Loader height="h-20" /></div>
          ) : errorDetail ? (
            <div className="text-sm text-red-600">{errorDetail}</div>
          ) : selected ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Code:</span> <span className="font-medium ml-1">{selected.code}</span></div>
                <div><span className="text-gray-500">Date Created:</span> <span className="font-medium ml-1">{selected.dateCreated}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Total Users:</span> <span className="font-medium ml-1">{selected.referralCodeUsers.length}</span></div>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Users Referred</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" disabled={exportingUsers} onClick={() => handleExportUsers(0)} className="flex items-center gap-1"><Download size={14}/> CSV</Button>
                  <Button size="sm" variant="ghost" disabled={exportingUsers} onClick={() => handleExportUsers(1)} className="flex items-center gap-1"><Download size={14}/> Excel</Button>
                </div>
              </div>
              <div className="border rounded-md max-h-64 overflow-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Date Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.referralCodeUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-xs text-gray-500">No users yet</TableCell>
                      </TableRow>
                    )}
                    {selected.referralCodeUsers.map(u => (
                      <TableRow key={u.email}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.phoneNumber}</TableCell>
                        <TableCell>{u.registrationDate}</TableCell>
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
                <p className="text-gray-500 text-sm">
                  Your code was generated successfully and<br />it is now active
                </p>
                <Button className="mt-6 px-8" onClick={closeGenerateDialog}>
                  Done
                </Button>
              </div>
            ) : (
              // Form State
              <div className="space-y-5">
                {/* Code Type */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Code type</Label>
                  <Select value={codeType} onValueChange={(val: 'promo' | 'influencer') => { setCodeType(val); setGeneratedCode(''); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promo">Promo code</SelectItem>
                      <SelectItem value="influencer">Influencer code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Promo Code Fields */}
                {codeType === 'promo' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Code title</Label>
                      <Input
                        placeholder="Enter text..."
                        value={codeTitle}
                        onChange={(e) => setCodeTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Promo code</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Code shows here"
                          value={generatedCode}
                          readOnly
                          className="bg-gray-100 flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="text-primary border-primary hover:bg-primary/5 whitespace-nowrap"
                          onClick={handleGenerateNewCode}
                        >
                          Generate New Code
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Influencer Code Fields */}
                {codeType === 'influencer' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Name</Label>
                      <Input
                        placeholder="Enter"
                        value={influencerName}
                        onChange={(e) => setInfluencerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Email</Label>
                      <Input
                        type="email"
                        placeholder="Enter"
                        value={influencerEmail}
                        onChange={(e) => setInfluencerEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Promo code</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Code shows here"
                          value={generatedCode}
                          readOnly
                          className="bg-gray-100 flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="text-primary border-primary hover:bg-primary/5 whitespace-nowrap"
                          onClick={handleGenerateNewCode}
                        >
                          Generate New Code
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Initial state - only show Code Type dropdown */}
                {!codeType && (
                  <div className="py-4" />
                )}

                {/* Action Button - show when code type is selected */}
                {codeType && !generatedCode && (
                  <Button
                    className="w-full mt-4"
                    onClick={handleGenerateNewCode}
                  >
                    Generate Code
                  </Button>
                )}

                {/* Publish Button - show when code is generated */}
                {codeType && generatedCode && (
                  <Button
                    className="w-full mt-4"
                    disabled={!isFormValid() || isSubmitting}
                    onClick={handlePublishCode}
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ReferralCodesPage;
