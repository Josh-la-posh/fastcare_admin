import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';

import {useState} from 'react';

export const ReportingFilter = ({onApply, onReset}: any) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [doctor, setDoctor] = useState<string>('');
  const [hospital, setHospital] = useState<string>('');
  const [clinic, setClinic] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [appointment, setAppointment] = useState<string>('');

  const handleApply = () => {
    onApply({
      startDate,
      endDate,
      doctor,
      hospital,
      clinic,
      duration,
      appointment,
    });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setAppointment('');
    setDuration('');
    setClinic('');
    setDoctor('');
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
        <div className="col-span-2">
          <Label>Date</Label>
          <div className="flex justify-between items-center gap-2">
            <input
              type="date"
              className="border border-gray-300 rounded-md py-2 px-3 w-full outline-none"
              value={startDate ?? ''}
              onChange={e => setStartDate(e.target.value || null)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-md font-semibold">To</p>
            <input
              type="date"
              className="border border-gray-300 rounded-md py-2 px-3 w-full outline-none"
              value={endDate ?? ''}
              onChange={e => setEndDate(e.target.value || null)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Patient */}
        <div className="flex flex-col gap-2">
          <Label>Doctor</Label>
          <input
            type="text"
            placeholder="Enter name"
            className="border border-gray-300 rounded-md py-2 px-3 outline-none"
            value={doctor}
            onChange={e => setDoctor(e.target.value)}
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

        <div className="flex flex-col gap-2">
          <Label>Clinic</Label>
          <input
            type="text"
            placeholder="Enter name"
            className="border border-gray-300 rounded-md py-2 px-3 outline-none"
            value={clinic}
            onChange={e => setClinic(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Session duration</Label>
          <input
            type="text"
            placeholder="Enter duration"
            className="border border-gray-300 rounded-md py-2 px-3 outline-none"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Appointment list</Label>
          <input
            type="text"
            placeholder="Enter list"
            className="border border-gray-300 rounded-md py-2 px-3 outline-none"
            value={appointment}
            onChange={e => setAppointment(e.target.value)}
          />
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
