import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardLayout } from '@/layout/dashboard-layout';
import { AppDispatch, RootState } from '@/services/store';
import { fetchAdCampaigns, createAdCampaign } from '@/services/thunks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { Loader2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const AdCampaigns = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, metaData, loading, creating } = useSelector((state: RootState) => state.adCampaigns);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdCampaigns({ Page: page, PageSize: pageSize }));
  }, [dispatch, page, pageSize]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      await dispatch(
        createAdCampaign({
          Title: title,
          Description: description,
          StartDate: startDate || undefined,
          EndDate: endDate || undefined,
          ImageContent: imageFile || undefined,
        })
      ).unwrap();

      toast.success('Ad campaign created successfully');
      setDialogOpen(false);
      resetForm();
      setPage(1);
      dispatch(fetchAdCampaigns({ Page: 1, PageSize: pageSize }));
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to create ad campaign');
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen overflow-auto">
        <section className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">All Promotional Ads</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              New ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Ad Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter ad title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter ad description"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No ad campaigns found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {list.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg border overflow-hidden">
              {/* Card Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-800">{campaign.title || 'Ad Campaign'}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Card Image */}
              <div className="aspect-video bg-gray-100">
                {campaign.image ? (
                  <img
                    src={campaign.image.startsWith('data:') ? campaign.image : `data:image/jpeg;base64,${campaign.image}`}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-1">{campaign.title || 'This is how ad fliers will show'}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {campaign.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {metaData && (
        <div className="mt-6 flex justify-end">
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
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AdCampaigns;
