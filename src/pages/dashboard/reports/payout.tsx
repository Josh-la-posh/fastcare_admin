import {useCallback, useEffect, useMemo, useState} from 'react';
import {DashboardLayout} from '@/layout/dashboard-layout';
import {Pagination} from '@/components/ui/pagination';
import apiClient from '@/services/axiosInstance';
import {Download, Search} from 'lucide-react';

type Summary = {totalPayoutValue: number; paidAmount: number; unpaidAmount: number; totalPayouts: number};
type Payout = {transferCode: string; transactionReference: string; transferReference: string; status: string; amount: number; settledAmount: number; reason: string; transferDate: string; paymentGateway: string; doctorName: string; hospitalName: string; recipient: string};
type MetaData = {totalCount: number; totalPages: number; pageSize: number; currentPage: number; hasNext: boolean; hasPrevious: boolean};
type Filters = {FromDate?: string; ToDate?: string; Status?: string; HospitalId?: string; PaymentGateway?: string; MinAmount?: number; MaxAmount?: number; DoctorId?: string; Search?: string; BatchCode?: string};

const emptySummary: Summary = {totalPayoutValue: 0, paidAmount: 0, unpaidAmount: 0, totalPayouts: 0};
const money = (value: number) => new Intl.NumberFormat('en-NG', {style: 'currency', currency: 'NGN', maximumFractionDigits: 0}).format(value || 0);
const formatDate = (value: string) => value ? new Date(value).toLocaleString('en-NG', {dateStyle: 'medium', timeStyle: 'short'}) : '-';
const getError = (error: unknown, fallback: string) => { const e = error as {response?: {data?: {message?: string}}; message?: string}; return e.response?.data?.message || e.message || fallback; };
const compact = (values: Filters) => Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== ''));
const csvCell = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const Card = ({value, title, subtitle, tone}: {value: string; title: string; subtitle: string; tone: string}) => <div className={`rounded-md border p-4 ${tone}`}><div className="text-2xl font-medium text-slate-900">{value}</div><div className="mt-2 text-xs font-medium">{title}</div><div className="mt-1 text-xs text-slate-600">{subtitle}</div></div>;
const Field = ({label, value, onChange, placeholder, type = 'text'}: {label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string}) => <label className="text-sm text-slate-500"><span className="mb-2 block">{label}</span><input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} type={type} className="h-10 w-full rounded border border-slate-300 px-3"/></label>;
const SelectField = ({label, value, onChange, values}: {label: string; value: string; onChange: (value: string) => void; values: Array<{label: string; value: string}>}) => <label className="text-sm text-slate-500"><span className="mb-2 block">{label}</span><select value={value} onChange={event => onChange(event.target.value)} className="h-10 w-full rounded border border-slate-300 bg-white px-3">{values.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>;

function download(rows: Payout[]) {
  const headers = ['Date', 'Recipient', 'Hospital', 'Doctor', 'Amount', 'Settled Amount', 'Status', 'Payment Gateway', 'Transfer Code', 'Transaction Reference', 'Transfer Reference', 'Reason'];
  const records = rows.map(row => [row.transferDate, row.recipient, row.hospitalName, row.doctorName, row.amount, row.settledAmount, row.status, row.paymentGateway, row.transferCode, row.transactionReference, row.transferReference, row.reason]);
  const csv = [headers, ...records].map(line => line.map(csvCell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'payouts.csv'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
}

export default function PayoutReport() {
  const [fromDate, setFromDate] = useState(''); const [toDate, setToDate] = useState(''); const [status, setStatus] = useState(''); const [hospitalId, setHospitalId] = useState('');
  const [gateway, setGateway] = useState(''); const [minAmount, setMinAmount] = useState(''); const [maxAmount, setMaxAmount] = useState(''); const [doctorId, setDoctorId] = useState('');
  const [search, setSearch] = useState(''); const [batchCode, setBatchCode] = useState(''); const [filters, setFilters] = useState<Filters>({});
  const [rows, setRows] = useState<Payout[]>([]); const [summary, setSummary] = useState<Summary>(emptySummary); const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(20); const [loading, setLoading] = useState(false); const [summaryLoading, setSummaryLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const requestFilters = useMemo(() => compact(filters), [filters]);

  const fetchRows = useCallback(async () => {
    setLoading(true); setError(null);
    try { const response = await apiClient.get('/Report/transfer-report', {params: {...requestFilters, PageSize: pageSize, Page: page}}); setRows(Array.isArray(response.data?.data) ? response.data.data : []); setMetaData(response.data?.metaData || null); }
    catch (e) { setRows([]); setMetaData(null); setError(getError(e, 'Failed to fetch payout reports')); } finally { setLoading(false); }
  }, [page, pageSize, requestFilters]);
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true); setError(null);
    try { const response = await apiClient.get('/Report/payout-summary', {params: {...requestFilters, PageSize: pageSize, Page: page}}); setSummary({...emptySummary, ...(response.data || {})}); }
    catch (e) { setSummary(emptySummary); setError(getError(e, 'Failed to fetch payout summary')); } finally { setSummaryLoading(false); }
  }, [page, pageSize, requestFilters]);
  useEffect(() => { void fetchRows(); }, [fetchRows]); useEffect(() => { void fetchSummary(); }, [fetchSummary]);

  const applyFilters = () => { setPage(1); setFilters({FromDate: fromDate || undefined, ToDate: toDate || undefined, Status: status || undefined, HospitalId: hospitalId.trim() || undefined, PaymentGateway: gateway || undefined, MinAmount: minAmount === '' ? undefined : Number(minAmount), MaxAmount: maxAmount === '' ? undefined : Number(maxAmount), DoctorId: doctorId.trim() || undefined, Search: search.trim() || undefined, BatchCode: batchCode.trim() || undefined}); };
  const reset = () => { setFromDate(''); setToDate(''); setStatus(''); setHospitalId(''); setGateway(''); setMinAmount(''); setMaxAmount(''); setDoctorId(''); setSearch(''); setBatchCode(''); setPage(1); setFilters({}); };
  const statusTone = (value: string) => ['success', 'paid'].includes(value.toLowerCase()) ? 'bg-green-100 text-green-700' : value.toLowerCase() === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';

  return <DashboardLayout><main className="h-full overflow-auto bg-[#f3f4f6] p-3 text-slate-700 sm:p-5"><div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card value={summaryLoading ? '...' : money(summary.totalPayoutValue)} title="Payouts" subtitle="Total Payout Value" tone="border-slate-300 bg-slate-100"/><Card value={summaryLoading ? '...' : money(summary.paidAmount)} title="Paid" subtitle="Successfully Settled" tone="border-green-400 bg-green-100"/><Card value={summaryLoading ? '...' : money(summary.unpaidAmount)} title="Unpaid" subtitle="Awaiting Payment" tone="border-amber-400 bg-amber-100"/><Card value={summaryLoading ? '...' : summary.totalPayouts.toLocaleString('en-NG')} title="Payout Records" subtitle="Total Payouts" tone="border-blue-500 bg-blue-100"/></div>
    <section className="rounded-md border border-blue-100 bg-white p-4 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Filter By</h2><div className="flex gap-3"><button onClick={reset} className="h-10 rounded border px-6">Reset</button><button onClick={applyFilters} className="h-10 rounded bg-blue-600 px-7 text-white">Apply filter</button></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <Field label="From date" value={fromDate} onChange={setFromDate} type="date"/><Field label="To date" value={toDate} onChange={setToDate} type="date"/>
      <SelectField label="Status" value={status} onChange={setStatus} values={[{label: 'All', value: ''}, {label: 'OTP', value: 'otp'}, {label: 'Pending', value: 'pending'}, {label: 'Success', value: 'success'}, {label: 'Failed', value: 'failed'}, {label: 'Reversed', value: 'reversed'}]}/><SelectField label="Payment Gateway" value={gateway} onChange={setGateway} values={[{label: 'All', value: ''}, {label: 'Bank3D', value: 'BANK3D'}, {label: 'ReadyCash', value: 'READYCASH'}, {label: 'Wallet', value: 'WALLET'}, {label: 'Paystack', value: 'PAYSTACK'}, {label: 'Flutterwave', value: 'FLUTTERWAVE'}, {label: 'Parkway', value: 'PARKWAY'}]}/>
      <Field label="Batch Code" value={batchCode} onChange={setBatchCode} placeholder="Enter batch code"/><Field label="Hospital ID" value={hospitalId} onChange={setHospitalId} placeholder="Enter hospital ID"/><Field label="Doctor ID" value={doctorId} onChange={setDoctorId} placeholder="Enter doctor ID"/><Field label="Minimum Amount" value={minAmount} onChange={setMinAmount} placeholder="0" type="number"/><Field label="Maximum Amount" value={maxAmount} onChange={setMaxAmount} placeholder="0" type="number"/>
      <label className="text-sm text-slate-500"><span className="mb-2 block">Search</span><div className="flex items-center rounded border border-slate-300 px-3"><input aria-label="Search payouts" value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => {if (event.key === 'Enter') applyFilters();}} placeholder="Recipient or reference" className="h-10 min-w-0 flex-1 outline-none"/><Search size={18}/></div></label>
    </div></section>
    <section className="min-h-[470px] rounded-md border border-blue-100 bg-white"><div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"><div><h2 className="text-lg font-semibold">Payout Report</h2><p className="mt-1 text-xs text-slate-500">{metaData?.totalCount ?? rows.length} record(s)</p></div><button disabled={!rows.length} onClick={() => download(rows)} className="flex gap-2 rounded border border-blue-500 px-8 py-2.5 text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"><Download size={18}/>Export current page</button></div>
      {error && <div className="mx-6 mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {loading ? <div className="flex h-64 items-center justify-center text-sm text-gray-500">Loading payout reports...</div> : rows.length === 0 ? <div className="flex h-64 flex-col items-center justify-center text-center"><strong className="block text-sm">You have no payout records yet</strong><span className="text-sm text-gray-400">No payout records found for the selected parameters.</span></div> : <><div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left text-sm"><thead className="border-y border-blue-100 bg-blue-50"><tr>{['Date', 'Recipient', 'Hospital', 'Doctor', 'Payout Amount', 'Settled Amount', 'Gateway', 'Transfer Code', 'Reason', 'Status'].map(title => <th className="px-5 py-4 font-medium" key={title}>{title}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.transferReference || row.transferCode}-${index}`} className="border-b"><td className="whitespace-nowrap px-5 py-4">{formatDate(row.transferDate)}</td><td className="px-5 py-4">{row.recipient || '-'}</td><td className="px-5 py-4">{row.hospitalName || '-'}</td><td className="px-5 py-4">{row.doctorName || '-'}</td><td className="whitespace-nowrap px-5 py-4 font-medium">{money(row.amount)}</td><td className="whitespace-nowrap px-5 py-4 font-medium">{money(row.settledAmount)}</td><td className="px-5 py-4">{row.paymentGateway || '-'}</td><td className="max-w-44 truncate px-5 py-4 text-blue-700" title={row.transferCode}>{row.transferCode || '-'}</td><td className="max-w-48 truncate px-5 py-4" title={row.reason}>{row.reason || '-'}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(row.status || '')}`}>{row.status || '-'}</span></td></tr>)}</tbody></table></div><div className="p-5"><Pagination totalEntriesSize={metaData?.totalCount || rows.length} currentPage={metaData?.currentPage || page} totalPages={metaData?.totalPages || 1} onPageChange={setPage} pageSize={metaData?.pageSize || pageSize} onPageSizeChange={size => {setPageSize(size); setPage(1);}}/></div></>}
    </section>
  </div></main></DashboardLayout>;
}
