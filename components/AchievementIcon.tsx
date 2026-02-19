import React from 'react';
import { Car, Eye, Rocket, SlidersHorizontal, Target, Trophy } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  rocket: Rocket,
  drive: Car,
  control: SlidersHorizontal,
  vision: Eye,
  sorter: Target,
};

const AchievementIcon: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 20, className }) => {
  const Icon = ICONS[name] ?? Trophy;
  return <Icon size={size} className={className} />;
};

export default AchievementIcon;
