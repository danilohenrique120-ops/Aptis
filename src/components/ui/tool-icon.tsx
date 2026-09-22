import React from 'react';
import {
  CheckSquare,
  Grid,
  GraduationCap,
  TrendingUp,
  ClipboardCheck,
  Activity,
  Users,
  MessageSquareText,
  Target,
  Compass,
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
    case 'Users':
      return <Users {...props} />;
    case 'MessageSquareText':
      return <MessageSquareText {...props} />;
    case 'Target':
      return <Target {...props} />;
    case 'Compass':
      return <Compass {...props} />;
    default:
      return <Layers {...props} />;
  }
}
