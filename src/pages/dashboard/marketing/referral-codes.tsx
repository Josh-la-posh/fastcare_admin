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
} from '@/services/thunks';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Loader } from '@/components/ui/loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Download, Info } from 'lucide-react';

interface ReferralRow {
  id: string;
  code: string;
  staffName: string;
  totalUsersRegistered: number;
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
    totalUsersRegistered: c.totalUsersRegistered,
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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-md shadow-sm p-5 border">
            <div className="text-sm text-gray-500 mb-1">Referral Code</div>
            {loadingSummary ? <Loader height="h-12" /> : errorSummary ? (
              <div className="text-red-600 text-sm">{errorSummary}</div>
            ) : summary ? (
              <div className="flex flex-col">
                <span className="text-2xl font-semibold tracking-wide">{summary.code}</span>
                <span className="text-sm text-gray-600 mt-2">Owner: {summary.staffName || '-'}</span>
                <span className="text-sm text-gray-600">Times Used: {summary.totalReferralCodeUsed}</span>
              </div>
            ) : (
              <div className="text-sm text-gray-400">No summary</div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-md p-5 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col w-full md:w-1/3">
            <label className="text-sm font-medium mb-1">Code</label>
            <Input id="referral-code-filter" label="Code" value={codeFilter} onChange={e => { setPage(1); setCodeFilter(e.target.value); }} placeholder="Search by code" />
          </div>
          <div className="flex flex-col w-full md:w-1/3">
            <label className="text-sm font-medium mb-1">Staff Name</label>
            <Input id="referral-staff-filter" label="Staff Name" value={staffFilter} onChange={e => { setPage(1); setStaffFilter(e.target.value); }} placeholder="Search by staff name" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setCodeFilter(''); setStaffFilter(''); setPage(1); }}>Reset</Button>
            <Button onClick={() => { /* triggers useEffect */ }}>Apply</Button>
          </div>
          <div className="ml-auto flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={exportingList} variant="ghost" className="flex items-center gap-2 w-36">
                  <Download size={16}/> {exportingList ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportList(0)}>CSV</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportList(1)}>Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-md p-0 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Referral Codes</h2>
            {loadingList && <span className="text-xs text-gray-500">Loading...</span>}
          </div>
          <div className="overflow-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Code</TableHead>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Users Registered</TableHead>
                  <TableHead className="w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loadingList && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-sm text-gray-500">No referral codes found</TableCell>
                  </TableRow>
                )}
                {rows.map(r => (
                  <TableRow key={r.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{r.code}</TableCell>
                    <TableCell>{r.staffName}</TableCell>
                    <TableCell>{r.totalUsersRegistered}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedId(r.id); setDetailOpen(true); }} className="flex items-center gap-1">
                        <Info size={14} /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
    </DashboardLayout>
  );
};

export default ReferralCodesPage;
