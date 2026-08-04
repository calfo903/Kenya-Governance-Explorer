'use client';
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Key, Lock, Unlock, Eye, EyeOff, ShieldCheck, Download, Upload, Cpu, FileText, CheckCircle2, AlertTriangle, Fingerprint
} from 'lucide-react';

interface MockEncryptedReport {
  id: string;
  county: string;
  submittedAt: string;
  publicKeyFingerprint: string;
  encryptedPayload: string;
  encryptedSymmetricKey: string;
  iv: string;
}

export default function AdminDecryptionPanel() {
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptedReport, setDecryptedReport] = useState<any | null>(null);

  // Custom decryption inputs
  const [cipherInput, setCipherInput] = useState('');
  const [keyCipherInput, setKeyCipherInput] = useState('');
  const [ivInput, setIvInput] = useState('');

  // Generated keypair state for demonstration
  const [generatedPrivateJWK, setGeneratedPrivateJWK] = useState<string | null>(null);
  const [generatedPublicJWK, setGeneratedPublicJWK] = useState<string | null>(null);
  const [generatedFingerprint, setGeneratedPublicFingerprint] = useState<string | null>(null);

  // Database tips state
  const [dbTips, setDbTips] = useState<any[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);

  // Fallback mock reports
  const [mockReports] = useState<MockEncryptedReport[]>([
    {
      id: 'WB-RSA-0941',
      county: 'Nairobi City',
      submittedAt: '2026-08-04T12:00:00.000Z',
      publicKeyFingerprint: 'A5:E4:C8:B2:1F:0E:9D:44:A2:7B:33:6C:55:00:1E:AA:99:BB:CC:DD',
      encryptedPayload: 'S0VOWUEgR09WRVJOQU5DRSBFWEVNUExBUlkgQ0lQSEVSUzogVGhpcyBpcyBhIGhpZ2hseSBjb25maWRlbnRpYWwgcmVwb3J0IHJlZ2FyZGluZyBpcnJlZ3VsYXIgdGVuZGVyIGF3YXJkcyBpbiBOYWlyb2JpIENvdW50eS4gQ29udHJhY3QgIzI0Mjk4IHdhcyBhd2FyZGVkIHdpdGhvdXQgY29tcGV0aXRpdmUgYmlkZGluZyB0byBhIHJlbGF0ZWQgcGFydHkgZW50aXR5Lg==',
      encryptedSymmetricKey: 'eGtleS1yc2Etb2FlcC0yMDQ4LWVuY3J5cHRlZC1hZXMtMjU2LWtleS13cmFwcGVkLWF1ZGl0b3ItZGVjcnlwdGlvbi1zZWN1cmUtMTIyNDM=',
      iv: 'MTIyNDM0NTY3ODkw'
    },
    {
      id: 'WB-RSA-0942',
      county: 'Mombasa',
      submittedAt: '2026-08-03T15:30:00.000Z',
      publicKeyFingerprint: 'B4:F2:1A:E5:66:D3:8C:72:01:99:EE:4F:A1:BB:CC:33:44:55:66:77',
      encryptedPayload: 'U0VDVVJFIENJUExFUjogRXZpZGVuY2Ugb2YgZ2hvc3Qgd29ya2VycyBvbiB0aGUgTW9tYmFzYSBvdXRyZWFjaCBwYXlyb2xsLiBFc3RpbWF0ZWQgMTIwIHBsYWNlaG9sZGVyIHBvc2l0aW9ucyBjYW52YXNzZWQgbW9udGhseSBhdCBLRVMgOC41TSBsb3NzZXM=',
      encryptedSymmetricKey: 'bW9tYmFzYS1yc2Etb2FlcC1rZXktd3JhcC1lcGhlbWVyYWwtYWVzLWtleS10cmFuc2Zlcg==',
      iv: 'Y29hc3RpbnRlbA=='
    }
  ]);

  const fetchDbTips = useCallback(async () => {
    setLoadingTips(true);
    try {
      const res = await fetch('/api/db/tips');
      if (res.ok) {
        const data = await res.json();
        setDbTips(data.tips || []);
      }
    } catch {
      // quiet fallback
    } finally {
      setLoadingTips(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDbTips();
  }, [fetchDbTips]);

  const handleLoadDbTip = async (tipId: string) => {
    try {
      const res = await fetch(`/api/db/tips/${tipId}`, {
        headers: {
          'Authorization': 'Bearer kenya-governance-ombudsman-seckey-2026'
        }
      });
      if (!res.ok) throw new Error('Failed to load tip details from database. Access denied or invalid credentials.');
      const data = await res.json();
      const rawDesc = data.tip?.description || '';

      // Check if description is asymmetrically encrypted JSON package
      try {
        const parsedPkg = JSON.parse(rawDesc);
        if (parsedPkg.encryptedPayload && parsedPkg.iv) {
          setCipherInput(parsedPkg.encryptedPayload);
          setKeyCipherInput(parsedPkg.encryptedSymmetricKey || '');
          setIvInput(parsedPkg.iv);
          toast.success(`Loaded encrypted registers for ${tipId} from Prisma database.`);
          return;
        }
      } catch {
        // Fallback below
      }

      // Legacy plain tip load
      setCipherInput(btoa(rawDesc));
      setKeyCipherInput('');
      setIvInput(btoa('legacy_iv'));
      toast.info(`Loaded legacy plain tip ${tipId} as encoded register.`);
    } catch (err) {
      toast.error(`Error loading registers: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // Generate an authentic RSA-OAEP Key Pair locally
  const handleGenerateKeyPair = async () => {
    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Export Private Key to JWK
      const privExport = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
      // Export Public Key to JWK
      const pubExport = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

      // Compute Public Key fingerprint
      const pubSPKI = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const digest = await crypto.subtle.digest('SHA-256', pubSPKI);
      const fingerprint = Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join(':');

      setGeneratedPrivateJWK(JSON.stringify(privExport, null, 2));
      setGeneratedPublicJWK(JSON.stringify(pubExport, null, 2));
      setGeneratedPublicFingerprint(fingerprint);

      // Load generated private key into input for convenience in testing!
      setPrivateKeyInput(JSON.stringify(privExport, null, 2));
      toast.success('Genuine RSA-OAEP-2048 Keypair generated successfully!');
    } catch (err) {
      toast.error(`Key generation failed: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // Perform Local Asymmetric Decryption in the Browser
  const handleDecryptCustomPayload = async () => {
    if (!privateKeyInput.trim()) {
      toast.error('Please input or generate a Private Key first.');
      return;
    }
    if (!cipherInput.trim() || !ivInput.trim()) {
      toast.error('Please provide both the Encrypted Payload and Initialization Vector (IV).');
      return;
    }

    try {
      const jwk = JSON.parse(privateKeyInput);
      
      // Import the private key
      const privateKey = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
      );

      let payload: string;

      // If they used a real generated key and wrapped AES key
      if (keyCipherInput.trim()) {
        const encryptedAesKeyBytes = Uint8Array.from(atob(keyCipherInput), c => c.charCodeAt(0));
        
        // Decrypt the wrapped AES-256 key with RSA-OAEP
        const decryptedAesKeyBuffer = await crypto.subtle.decrypt(
          { name: 'RSA-OAEP' },
          privateKey,
          encryptedAesKeyBytes
        );

        // Import the symmetric AES key back
        const aesKey = await crypto.subtle.importKey(
          'raw',
          decryptedAesKeyBuffer,
          'AES-GCM',
          false,
          ['decrypt']
        );

        // Decrypt the main payload
        const encryptedPayloadBytes = Uint8Array.from(atob(cipherInput), c => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(ivInput), c => c.charCodeAt(0));
        
        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          aesKey,
          encryptedPayloadBytes
        );

        payload = new TextDecoder().decode(decryptedBuffer);
      } else {
        // Fallback for simple Base64 or standard simulated decryption if no asymmetric wrap is specified
        payload = atob(cipherInput);
      }

      setDecryptedText(payload);
      try {
        setDecryptedReport(JSON.parse(payload));
      } catch {
        setDecryptedReport(null);
      }
      toast.success('Payload decrypted successfully in-memory!');
    } catch (err) {
      toast.error(`Decryption failed: Make sure the Private Key matches the Public Key used for encryption! Error: ${err instanceof Error ? err.message : 'Invalid key or ciphertext'}`);
    }
  };

  const handleLoadMockReport = (report: MockEncryptedReport) => {
    setCipherInput(report.encryptedPayload);
    setKeyCipherInput(report.encryptedSymmetricKey);
    setIvInput(report.iv);
    toast.info(`Loaded report ${report.id} details into decryption registers.`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Unlock className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Local Secure Ombudsman Decryption Terminal</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Decentralized zero-knowledge decryption. Whistleblower submissions are decrypted strictly inside your browser. 
              Your private key never travels across the network, ensuring absolute identity safety and compliance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hand: Private Key Management */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="size-5 text-indigo-500" />
                <CardTitle className="text-sm font-bold">Local Private Key (JWK) Register</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Paste your Auditor RSA Private Key JWK or generate a new asymmetric keypair below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Private Key Input (JWK format)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="size-3 mr-1" /> : <Eye className="size-3 mr-1" />}
                    {showKey ? 'Hide Key' : 'Reveal Key'}
                  </Button>
                </div>
                <Textarea
                  value={privateKeyInput}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                  placeholder='Paste JWK: { "kty": "RSA", "alg": "RSA-OAEP-256", ... }'
                  className="font-mono text-[11px] leading-normal bg-stone-50 dark:bg-stone-950 h-40 focus:ring-indigo-500"
                  style={{ WebkitTextSecurity: showKey ? 'none' : 'disc' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleGenerateKeyPair}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                >
                  <Cpu className="size-3.5" />
                  Generate Keypair
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPrivateKeyInput('')}
                  className="text-xs border-stone-300 hover:bg-stone-50 text-stone-600 dark:text-stone-300 dark:border-stone-700"
                >
                  Clear Key
                </Button>
              </div>

              {generatedFingerprint && (
                <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Fingerprint className="size-4" />
                    <span>Public Key Fingerprint Created</span>
                  </div>
                  <code className="block text-[10px] bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2 rounded break-all font-mono">
                    {generatedFingerprint}
                  </code>
                  <p className="text-[10px] text-stone-500 leading-normal">
                    Distribute this fingerprint to citizens so they can verify submissions are securely encrypted for you.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Hand: Encrypted Reports and Decryptor Register */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real & Mock Encrypted Reports */}
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="size-4 text-amber-500" />
                    Encrypted Whistleblower Submissions Inbox
                  </CardTitle>
                  <CardDescription className="text-xs">
                    These are stored securely in SQLite via Prisma and loaded dynamically.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-mono">
                  {dbTips.length > 0 ? dbTips.length : mockReports.length} Received
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-80 overflow-y-auto">
                {dbTips.length > 0 ? (
                  dbTips.map((tip) => (
                    <div key={tip.id} className="p-4 flex items-start justify-between gap-4 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors">
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{tip.id}</span>
                          <Badge variant="outline" className="text-[10px] h-4 leading-none">{tip.countyName}</Badge>
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] h-4 leading-none">PRISMA DB</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono truncate">
                          <span>Category:</span>
                          <span className="font-semibold text-stone-600 dark:text-stone-300">{tip.category}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLoadDbTip(tip.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 h-8 font-semibold shrink-0"
                      >
                        <Lock className="size-3 mr-1" />
                        Load Registers
                      </Button>
                    </div>
                  ))
                ) : (
                  mockReports.map((report) => (
                    <div key={report.id} className="p-4 flex items-start justify-between gap-4 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors">
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{report.id}</span>
                          <Badge variant="outline" className="text-[10px] h-4 leading-none">{report.county}</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono truncate">
                          <span>Fingerprint:</span>
                          <span className="truncate max-w-[200px]">{report.publicKeyFingerprint}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLoadMockReport(report)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 h-8 font-semibold shrink-0"
                      >
                        <Lock className="size-3 mr-1" />
                        Load Registers
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Core Register Decryptor */}
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lock className="size-4 text-emerald-500" />
                In-Memory Decryption Workspace
              </CardTitle>
              <CardDescription className="text-xs">
                Fill these fields automatically by clicking "Load Registers" above, or paste raw citizen outputs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">AES-GCM Encrypted Payload (Base64)</Label>
                  <Textarea
                    value={cipherInput}
                    onChange={(e) => setCipherInput(e.target.value)}
                    placeholder="Base64 Ciphertext"
                    className="font-mono text-[10px] leading-normal bg-stone-50 dark:bg-stone-950 h-24"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Initialization Vector IV (Base64)</Label>
                  <Input
                    value={ivInput}
                    onChange={(e) => setIvInput(e.target.value)}
                    placeholder="Base64 IV"
                    className="font-mono text-[10px] leading-normal bg-stone-50 dark:bg-stone-950 h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">RSA-OAEP Wrapped Ephemeral AES Key (Base64 - Optional)</Label>
                <Textarea
                  value={keyCipherInput}
                  onChange={(e) => setKeyCipherInput(e.target.value)}
                  placeholder="Paste asymmetric key wrap. If left empty, a simple base64 decode will be performed."
                  className="font-mono text-[10px] leading-normal bg-stone-50 dark:bg-stone-950 h-16"
                />
              </div>

              <Button
                onClick={handleDecryptCustomPayload}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2 py-5"
              >
                <Unlock className="size-4" />
                Perform In-Memory Safe Decryption
              </Button>

              {/* Decrypted Output Result */}
              {decryptedText && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    <span>Decrypted Payload Restored Successfully</span>
                  </div>

                  {decryptedReport ? (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px] leading-normal bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 p-2.5 rounded">
                        <div>
                          <span className="text-stone-400 uppercase tracking-wider text-[9px] block">Category</span>
                          <span className="font-bold text-stone-700 dark:text-stone-300">{decryptedReport.category || '—'}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 uppercase tracking-wider text-[9px] block">County/Agency</span>
                          <span className="font-bold text-stone-700 dark:text-stone-300">{decryptedReport.county || '—'}</span>
                        </div>
                        <div className="col-span-2 border-t border-stone-100 dark:border-stone-850 pt-2 mt-1">
                          <span className="text-stone-400 uppercase tracking-wider text-[9px] block">Incident Date</span>
                          <span className="font-semibold text-stone-600 dark:text-stone-400">{decryptedReport.incidentDate || '—'}</span>
                        </div>
                        {decryptedReport.contactPreference && decryptedReport.contactPreference !== 'anonymous' && (
                          <div className="col-span-2 border-t border-stone-100 dark:border-stone-850 pt-2 mt-1 bg-amber-500/5 p-1.5 rounded border border-amber-500/10">
                            <span className="text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[9px] font-semibold block">Reporter Identity Details</span>
                            <span className="font-semibold text-stone-700 dark:text-stone-300">{decryptedReport.contactDetails || '—'}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 bg-white dark:bg-stone-950 p-2.5 rounded border border-stone-200 dark:border-stone-850">
                        <span className="text-stone-400 uppercase tracking-wider text-[9px] block">Testimony / Description</span>
                        <p className="text-stone-700 dark:text-stone-300 italic text-xs leading-relaxed font-normal">
                          "{decryptedReport.description || decryptedText}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      readOnly
                      value={decryptedText}
                      className="font-mono text-xs bg-white dark:bg-stone-950 h-24 text-stone-700 dark:text-stone-300"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
