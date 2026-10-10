import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface TransactionFilterProps {
  onApply: (filters: { startDate: string | null; endDate: string | null; status: string | null; type: string | null; patient: string; hospital: string }) => void;
  onReset: () => void;
}

export const TransactionFilter = ({ onApply, onReset }: TransactionFilterProps) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [patient, setPatient] = useState<string>('');
  const [hospital, setHospital] = useState<string>('');

  const handleApply = () => {
    onApply({ startDate, endDate, status, type, patient, hospital });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setStatus(null);
    setType(null);
    setPatient('');
    setHospital('');
    onReset();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 py-3">
        <Label className="text-lg">Filter By</Label>
        <span
          onClick={handleReset}
          className="text-primary cursor-pointer hover:underline"
        >
          Reset filter
        </span>
      </div>

      {/* Grid Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date range */}
        <div className="flex flex-col gap-2">
          <Label>Start Date</Label>
          <input
            type="date"
            className="border border-gray-300 rounded-md py-2 px-3 outline-none"
            value={startDate ?? ''}
            onChange={e => setStartDate(e.target.value || null)}
            max={endDate || new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>End Date</Label>
          <input
            type="date"
            className="border border-gray-300 rounded-md py-2 px-3 outline-none"
            value={endDate ?? ''}
            onChange={e => setEndDate(e.target.value || null)}
            min={startDate || undefined}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Patient */}
        <div className="flex flex-col gap-2">
          <Label>Patient</Label>
          <input
            type="text"
            placeholder="Enter name"
            className="border border-gray-300 rounded-md py-2 px-3 outline-none"
            value={patient}
            onChange={e => setPatient(e.target.value)}
          />
        </div>

        {/* Hospital */}
        <div className="flex flex-col gap-2">
          <Label>Hospital</Label>
          <input
            type="text"
            placeholder="Enter name"
            className="border border-gray-300 rounded-md py-2 px-3 outline-none"
            value={hospital}
            onChange={e => setHospital(e.target.value)}
          />
        </div>

        {/* Transaction type */}
        <div className="flex flex-col gap-2">
          <Label>Transaction Type</Label>
          <Select value={type ?? undefined} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status ?? undefined} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          <Button className="py-2.5 rounded-md w-44" onClick={handleApply}>
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );
};
