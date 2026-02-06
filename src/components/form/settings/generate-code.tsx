import { X, Check, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Success from "../../../features/modules/dashboard/success";
import { useDispatch, useSelector } from "react-redux";
import { generateReferralCodes, fetchReferralCodes, fetchReferralSummary, fetchAdminUsers } from "@/services/thunks";
import type { AppDispatch, RootState } from "@/services/store";

export default function GenerateCode() {
  const dispatch = useDispatch<AppDispatch>();
  const { generating, generateError } = useSelector((s: RootState) => s.referrals);
  const { users, loading: loadingUsers } = useSelector((s: RootState) => s.adminUsers);

  const [open, setOpen] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const resetForm = () => {
    setEmails([]);
    setFilter("");
    setDropdownOpen(false);
  };

  useEffect(() => {
    if (open) {
      // fetch users if list empty
      if (users.length === 0) dispatch(fetchAdminUsers(undefined));
    } else {
      resetForm();
    }
  }, [open, users.length, dispatch]);

  const toggleEmail = (email: string) => {
    setEmails(prev => prev.includes(email) ? prev.filter(x => x !== email) : [...prev, email]);
  };

  const removeEmail = (e: string) => {
    setEmails(prev => prev.filter(x => x !== e));
  };

  const selectAll = () => {
    if (emails.length === filteredUsers.length) {
      setEmails([]);
    } else {
      setEmails(filteredUsers.map(u => u.email).filter(Boolean));
    }
  };

  const handleSubmit = () => {
    if (emails.length === 0 || generating) return;
    dispatch(generateReferralCodes({ UserEmails: emails }))
      .unwrap()
      .then(() => {
        setOpenSuccess(true);
        dispatch(fetchReferralSummary());
        dispatch(fetchReferralCodes({ Page: 1, PageSize: 20 }));
        resetForm();
      })
      .catch(() => {});
  };

  const filteredUsers = users.filter(u => (
    u.email?.toLowerCase().includes(filter.toLowerCase()) ||
    u.name?.toLowerCase().includes(filter.toLowerCase())
  ));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="py-3 w-40 rounded-md">Generate New Code</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b py-2">
            <div>
              <span className="text-gray-800 text-2xl font-normal">Generate Code</span>
              <p className="text-gray-500 text-sm font-normal">Send referral codes to one or multiple staff emails</p>
            </div>
            <button onClick={() => setOpen(false)} type="button" className="p-1 border border-gray-300 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-primary" />
            </button>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-5">
          <div className="flex flex-col gap-2 relative">
            <label className="text-gray-800 text-sm font-medium">Select Teammates</label>
            <div
              className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white"
              onClick={() => setDropdownOpen(o => !o)}
            >
              <span className="text-sm text-gray-600">
                {emails.length === 0 ? 'Choose teammates' : `${emails.length} selected`}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {dropdownOpen && (
              <div className="absolute z-50 top-full mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md max-h-64 overflow-auto">
                <div className="p-2 border-b bg-gray-50 sticky top-0">
                  <input
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Search users..."
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button type="button" onClick={selectAll} className="text-xs text-primary font-medium">
                      {emails.length === filteredUsers.length && filteredUsers.length > 0 ? 'Clear all' : 'Select all'}
                    </button>
                    <span className="text-[10px] text-gray-500">{filteredUsers.length} users</span>
                  </div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {loadingUsers && (
                    <li className="py-4 text-center text-xs text-gray-500">Loading users...</li>
                  )}
                  {!loadingUsers && filteredUsers.length === 0 && (
                    <li className="py-4 text-center text-xs text-gray-500">No users found</li>
                  )}
                  {!loadingUsers && filteredUsers.map(u => {
                    const selected = emails.includes(u.email);
                    return (
                      <li
                        key={u.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                        onClick={() => toggleEmail(u.email)}
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">{u.name || '-'}</span>
                          <span className="text-gray-500 text-xs">{u.email}</span>
                        </div>
                        {selected && <Check className="w-4 h-4 text-primary" />}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500">Open and pick teammates; you can select multiple or all.</p>
          </div>
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map(e => (
                <span key={e} className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 border border-blue-200">
                  {e}
                  <button type="button" onClick={() => removeEmail(e)} className="text-blue-500 hover:text-blue-800">&times;</button>
                </span>
              ))}
            </div>
          )}
          {generateError && <p className="text-xs text-red-600">{generateError}</p>}
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { resetForm(); setOpen(false); }}>Cancel</Button>
            <Button type="button" onClick={handleSubmit} disabled={emails.length === 0 || generating} className="min-w-32">
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </DialogContent>
      <Success open={openSuccess} setOpen={setOpenSuccess} text="Referral codes generated successfully." />
    </Dialog>
  );
}
