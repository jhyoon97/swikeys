'use client';

import SwitchCard from './SwitchCard';
import type { KeyboardSwitch } from '@/types/switch';

const SwitchCardGrid = ({ switches }: { switches: KeyboardSwitch[] }) => {
  if (switches.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>No switches found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {switches.map((sw) => (
        <SwitchCard key={sw.id} sw={sw} />
      ))}
    </div>
  );
};

export default SwitchCardGrid;
