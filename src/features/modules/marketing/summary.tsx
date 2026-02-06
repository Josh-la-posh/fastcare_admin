import { X, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { exportReferralCodeUsers } from '@/services/thunks';
import type { AppDispatch, RootState } from '@/services/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loading';
import type { ReferralCodeUser, ReferralCodeDetail } from '@/types';

interface SummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  base?: { id: string; referral_code: string; status?: string; date?: string } | null;
  selected?: ReferralCodeDetail | null;
  loadingDetail: boolean;
}

export default function Summary({ open, onOpenChange, base, selected, loadingDetail }: SummaryProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { exportingUsers, exportUsersError } = useSelector((s: RootState) => s.referrals);
  const [exportError, setExportError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const users: ReferralCodeUser[] = useMemo(() => (selected?.referralCodeUsers || []), [selected?.referralCodeUsers]);

  const sanitize = (v?: string) => (v || '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9-_.\s]/g, '')
    .trim()
    .replace(/\s+/g, '_') || 'referral';

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportUsers = useCallback(async (format: number) => {
    if (!base?.id || exportingUsers) return;
    setExportError(null);
    try {
      const payload = await dispatch(exportReferralCodeUsers({ id: base.id, format })).unwrap();
      const blob = payload.blob as Blob;
      if (!blob) {
        setExportError('No file received');
        return;
      }
      const filename = `referral-code-${sanitize(base.id)}-users.${format === 1 ? 'xlsx' : 'csv'}`;
      downloadBlob(blob, filename);
      setMenuOpen(false);
    } catch {
      setExportError('Export failed');
    }
  }, [base?.id, dispatch, exportingUsers]);

  const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-500 bg-gray-100';
    const s = status.toLowerCase();
    if (['successful','approved','active'].includes(s)) return 'text-green-700 bg-green-100';
    if (s === 'pending') return 'text-yellow-700 bg-yellow-100';
    if (['failed','disputed'].includes(s)) return 'text-red-700 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100] max-h-[80vh] max-w-5xl overflow-y-auto">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b">
            <span className="py-3 text-2xl font-semibold text-gray-800">Summary</span>
            <button onClick={() => onOpenChange(false)} aria-label="Close" type="button" className="rounded-full border border-gray-300 p-1 hover:bg-gray-100">
              <X className="h-5 w-5 text-primary" />
            </button>
          </DialogTitle>
        </DialogHeader>
        {!base ? (
          <p className="mt-4 text-gray-500">No details available.</p>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h1 className="text-lg text-primary">Code <span className="text-gray-600 ml-4">{selected?.code || base.referral_code}</span></h1>
                <span className={`rounded-md px-2 py-1 font-medium ${getStatusColor(base.status)}`}>{base.status || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      disabled={!base?.id || exportingUsers}
                      className="flex w-32 items-center gap-2 rounded-md py-2.5"
                    >
                      <Download size={14}/> {exportingUsers ? 'Exporting...' : 'Export'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 z-[1200]">
                    <DropdownMenuItem
                      disabled={exportingUsers}
                      className="cursor-pointer"
                      onClick={() => handleExportUsers(0)}
                    >CSV</DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={exportingUsers}
                      className="cursor-pointer"
                      onClick={() => handleExportUsers(1)}
                    >Excel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mt-6">
              <h1 className="border-b text-base md:text-lg text-primary">Referral Code Details</h1>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-md md:grid-cols-4">
              <div className="flex flex-col gap-2"><span className="text-gray-600">Code</span><span className="text-gray-900">{selected?.code || base.referral_code}</span></div>
              <div className="flex flex-col gap-2"><span className="text-gray-600">Date Created</span><span className="text-gray-900">{selected?.dateCreated || base.date || '-'}</span></div>
              <div className="flex flex-col gap-2"><span className="text-gray-600">Users</span><span className="text-gray-900">{users.length}</span></div>
              <div className="flex flex-col gap-2"><span className="text-gray-600">Status</span><span className="text-gray-900">{base.status || '-'}</span></div>
            </div>
            <div className="mt-6">
              <h1 className="mb-2 text-base md:text-lg text-primary">Users Who Used This Code</h1>
              {loadingDetail ? (
                <div className="py-6"><Loader height="h-10" /></div>
              ) : (
                <div className="max-h-72 overflow-auto rounded-md border">
                  <Table className="min-w-[600px]">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date Registered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-6 text-center text-sm text-gray-500">No users yet</TableCell>
                        </TableRow>
                      ) : (
                        users.map(u => (
                          <TableRow key={u.email || u.phoneNumber || u.name}>
                            <TableCell className="font-medium">{u.name || '-'}</TableCell>
                            <TableCell>{u.email || '-'}</TableCell>
                            <TableCell>{u.phoneNumber || '-'}</TableCell>
                            <TableCell>{u.registrationDate || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              {(exportUsersError || exportError) && (
                <p className="mt-2 text-xs text-red-600" role="alert">{exportUsersError || exportError}</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
