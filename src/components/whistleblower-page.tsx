use client;

import React from react;
import { ShieldCheck } from lucide-react;
import { Card, CardHeader, CardTitle, CardContent } from @/components/ui/card;
import { Button } from @/components/ui/button;
import { Input } from @/components/ui/input;
import { Textarea } from @/components/ui/textarea;
import { Label } from @/components/ui/label;

export default function WhistleblowerPage() {
  return <div className="p-6"><Card><CardHeader><CardTitle>Whistleblower Report</CardTitle></CardHeader><CardContent><form className="space-y-4"><div><Label>County</Label><Input placeholder="e.g., Nairobi" required /></div><div><Label>Description</Label><Textarea placeholder="Describe the issue..." rows={6} required /></div><Button type="submit" className="bg-red-600 text-white">Submit Report</Button></form></CardContent></Card></div>;
}