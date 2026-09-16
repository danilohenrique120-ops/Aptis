import React from 'react';
import {
  CheckSquare,
  Grid,
  GraduationCap,
  TrendingUp,
  ClipboardCheck,
  Activity,
  Layers,
  LucideProps
} from 'lucide-react';

interface ToolIconProps extends LucideProps {
  name: string;
}

export function ToolIcon({ name, ...props }: ToolIconProps) {
  switch (name) {
    case 'CheckSquare':
      return <CheckSquare {...props} />;
    case 'Grid':
      return <Grid {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'ClipboardCheck':
      return <ClipboardCheck {...props} />;
    case 'Activity':
      return <Activity {...props} />;
    default:
      return <Layers {...props} />;
  }
}
