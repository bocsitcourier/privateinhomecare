import { useState } from 'react';
import AdminModal from '../AdminModal';
import { Button } from '@/components/ui/button';

export default function AdminModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Admin Modal</Button>
      <AdminModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
