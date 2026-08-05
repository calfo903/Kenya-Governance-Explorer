use client;

import React from react;
import { Send } from lucide-react;
import { Card, CardHeader, CardTitle, CardContent } from @/components/ui/card;
import { Button } from @/components/ui/button;
import { Input } from @/components/ui/input;
import { Textarea } from @/components/ui/textarea;
import { Label } from @/components/ui/label;

export default function AnonymousTipPage() {
  return <div className="p-6"><Card><CardHeader><CardTitle>Anonymous Tip</CardTitle></CardHeader><CardContent><form className="space-y-4"><div><Label>County</Label><Input placeholder="Select county" required /></div><div><Label>Details</Label><Textarea placeholder="Your tip..." rows={6} required /></div><Button type="submit" className="bg-blue-600 text-white">Submit Anonymously</Button></form></CardContent></Card></div>;
}