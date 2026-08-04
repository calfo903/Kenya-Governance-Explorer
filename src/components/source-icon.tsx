'use client';

import React from 'react';
import {
  Scale, BarChart3, FileText, Shield, Landmark, Globe,
  Building2, Users, Database, CheckCircle2, Search, Library,
} from 'lucide-react';

export function SourceIcon({ name, className }: { name: string; className?: string }) {
  const props = { className: className || 'h-5 w-5' };
  switch (name) {
    case 'Scale': return <Scale {...props} />;
    case 'BarChart3': return <BarChart3 {...props} />;
    case 'FileText': return <FileText {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'Landmark': return <Landmark {...props} />;
    case 'Globe': return <Globe {...props} />;
    case 'Building2': return <Building2 {...props} />;
    case 'Users': return <Users {...props} />;
    case 'Database': return <Database {...props} />;
    case 'CheckCircle2': return <CheckCircle2 {...props} />;
    case 'Search': return <Search {...props} />;
    default: return <Library {...props} />;
  }
}
