import ServiceCard from '../ServiceCard';
import { Heart } from 'lucide-react';

export default function ServiceCardExample() {
  return (
    <div className="p-4 max-w-md">
      <ServiceCard
        title="Personal Care"
        short="Bathing, grooming, toileting, transfers."
        full="Personal care: bathing, grooming, dressing, toileting, transfers and mobility assistance; includes medication reminders and dignity-first support."
        icon={<Heart className="w-6 h-6 text-primary" />}
        onRequestService={(title) => console.log('Requested service:', title)}
      />
    </div>
  );
}
