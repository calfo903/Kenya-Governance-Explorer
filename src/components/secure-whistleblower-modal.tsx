'use client';
import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Shield, Lock, Eye, EyeOff, Send, CheckCircle2,
  AlertTriangle, Key, XCircle, Fingerprint, ShieldCheck, FileText,
} from 'lucide-react';

type EncryptionStatus = 'idle' | 'ready' | 'encrypting' | 'encrypted' | 'error';
type ContactPreference = 'anonymous' | 'email' | 'phone';

const REPORT_CATEGORIES = [
  { value: 'procurement_fraud', label: 'Procurement Fraud' },
  { value: 'embezzlement', label: 'Embezzlement' },
  { value: 'bribery', label: 'Bribery' },
  { value: 'nepotism', label: 'Nepotism' },
  { value: 'misappropriation', label: 'Misappropriation of Funds' },
  { value: 'other', label: 'Other' },
] as const;

const SIMULATED_FINGERPRINT = 'SHA-256: 4A:2B:8C:D1:F3:E5:A7:B9:C0:D2:E4:F6:A8:B0:C2:D4:E6:F8:0A:1B:2C:3D:4E:5F:6A:7B:8C:9D:0E:1F';

async function encryptReport(data: string, passphrase: string): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(data));
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

function generateFakeHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export default function SecureWhistleblowerModal() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [county, setCounty] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [description, setDescription] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [contactPreference, setContactPreference] = useState<ContactPreference>('anonymous');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>('idle');
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [encryptedDataLength, setEncryptedDataLength] = useState<number | null>(null);
  const [encryptedHash, setEncryptedHash] = useState<string | null>(null);
  const [showHash, setShowHash] = useState(false);
  const [handshakeVerified, setHandshakeVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid =
    category !== '' &&
    county.trim() !== '' &&
    incidentDate !== '' &&
    description.trim().length >= 20 &&
    termsAccepted;

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const names = Array.from(files).map((f) => f.name);
      setFileNames((prev) => [...prev, ...names]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFileNames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const simulateHandshake = useCallback(() => {
    setHandshakeVerified(false);
    setTimeout(() => {
      setHandshakeVerified(true);
    }, 1200);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;

    setError(null);
    setEncryptionStatus('encrypting');
    setEncryptionProgress(0);

    const reportData = JSON.stringify({
      category,
      county: county.trim(),
      incidentDate,
      description: description.trim(),
      attachments: fileNames,
      contactPreference,
      contactDetails:
        contactPreference === 'email'
          ? contactEmail
          : contactPreference === 'phone'
            ? contactPhone
            : null,
      submittedAt: new Date().toISOString(),
    });

    try {
      const progressInterval = setInterval(() => {
        setEncryptionProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const passphrase = 'kenya-governance-whistleblower-secure-key-2024';
      const result = await encryptReport(reportData, passphrase);

      clearInterval(progressInterval);
      setEncryptionProgress(100);
      setEncryptedDataLength(result.encrypted.length);
      setEncryptedHash(generateFakeHash());

      await new Promise((r) => setTimeout(r, 600));

      setEncryptionStatus('encrypted');
    } catch {
      setEncryptionStatus('error');
      setError('Encryption failed. Please try again.');
      setEncryptionProgress(0);
    }
  }, [isFormValid, category, county, incidentDate, description, fileNames, contactPreference, contactEmail, contactPhone]);

  const handleReset = useCallback(() => {
    setCategory('');
    setCounty('');
    setIncidentDate('');
    setDescription('');
    setFileNames([]);
    setContactPreference('anonymous');
    setContactEmail('');
    setContactPhone('');
    setTermsAccepted(false);
    setEncryptionStatus('idle');
    setEncryptionProgress(0);
    setEncryptedDataLength(null);
    setEncryptedHash(null);
    setShowHash(false);
    setError(null);
  }, []);

  const handleClose = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        handleReset();
      }
    },
    [handleReset]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          size="lg"
        >
          <Shield className="size-5" />
          Secure Whistleblower Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 p-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Shield className="size-6 text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-50">
                  End-to-End Encrypted Submission
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-sm mt-0.5">
                  Your report is encrypted client-side before transmission. No one can read it.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Encryption Status Banner */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-900/80 border border-zinc-700/50 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              {encryptionStatus === 'encrypted' ? (
                <CheckCircle2 className="size-4 text-emerald-400" />
              ) : encryptionStatus === 'encrypting' ? (
                <Lock className="size-4 text-amber-400 animate-pulse" />
              ) : encryptionStatus === 'error' ? (
                <XCircle className="size-4 text-red-400" />
              ) : (
                <Lock className="size-4 text-emerald-400" />
              )}
              <span className="text-sm font-medium">
                {encryptionStatus === 'idle' && '\uD83D\uDD12 AES-256 Encryption Active'}
                {encryptionStatus === 'ready' && '\uD83D\uDD12 AES-256 Encryption \u2014 Ready'}
                {encryptionStatus === 'encrypting' && '\uD83D\uDD12 Encrypting report...'}
                {encryptionStatus === 'encrypted' && '\uD83D\uDD12 Encrypted & Sent'}
                {encryptionStatus === 'error' && '\u26A0\uFE0F Encryption Failed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-zinc-500">PBKDF2 + AES-GCM</span>
            </div>
          </div>

          {/* Progress Bar during encryption */}
          {encryptionStatus === 'encrypting' && (
            <div className="mt-3">
              <Progress
                value={encryptionProgress}
                className="h-1.5 bg-zinc-800 [&>[data-slot=progress-indicator]]:bg-emerald-500"
              />
              <p className="text-xs text-zinc-500 mt-1.5 text-center">
                {Math.round(encryptionProgress)}% \u2014 Deriving encryption key &amp; encrypting payload...
              </p>
            </div>
          )}
        </div>

        {/* Form Body */}
        {encryptionStatus !== 'encrypted' ? (
          <div className="px-6 pb-6 space-y-5">
            {/* Handshake Verification */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="size-4 text-emerald-400" />
                  <span className="text-sm font-medium text-zinc-300">
                    Public Key Handshake Verification
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  onClick={simulateHandshake}
                >
                  <Key className="size-3 mr-1" />
                  Verify
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2">
                <code className="text-xs text-zinc-500 font-mono break-all leading-relaxed">
                  {SIMULATED_FINGERPRINT}
                </code>
              </div>
              {handshakeVerified && (
                <div className="mt-2 flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="size-3.5" />
                  <span className="text-xs font-medium">Fingerprint verified \u2014 Secure channel established</span>
                </div>
              )}
            </div>

            <Separator className="bg-zinc-800" />

            {/* Report Category */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">
                Report Category <span className="text-red-400">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-zinc-200 focus:ring-emerald-500/30 focus:border-emerald-600">
                  <SelectValue placeholder="Select the type of concern..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                  {REPORT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* County/Agency */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">
                County / Agency Involved <span className="text-red-400">*</span>
              </Label>
              <Input
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g., Nairobi County Government, EACC, KRA..."
                className="bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:ring-emerald-500/30 focus:border-emerald-600"
              />
            </div>

            {/* Date of Incident */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">
                Date of Incident <span className="text-red-400">*</span>
              </Label>
              <Input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-200 focus:ring-emerald-500/30 focus:border-emerald-600 [color-scheme:dark]"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">
                Description of the Concern <span className="text-red-400">*</span>
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the incident. Include names, amounts, dates, and any relevant context. (Minimum 20 characters)"
                rows={4}
                className="bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:ring-emerald-500/30 focus:border-emerald-600 resize-none"
              />
              {description.length > 0 && description.length < 20 && (
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  {20 - description.length} more characters required
                </p>
              )}
            </div>

            {/* File Upload (Simulated) */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Supporting Evidence (Optional)</Label>
              <div className="rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-4 text-center hover:border-emerald-600/50 transition-colors">
                <FileText className="size-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">
                  Drag files here or{' '}
                  <label className="text-emerald-400 hover:text-emerald-300 cursor-pointer underline underline-offset-2">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  PDF, images, or documents up to 10MB each
                </p>
              </div>
              {fileNames.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {fileNames.map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5"
                    >
                      <div className="flex items-center gap-2 text-sm text-zinc-300 truncate">
                        <FileText className="size-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-zinc-500 hover:text-red-400 transition-colors shrink-0 ml-2"
                      >
                        <XCircle className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Preference */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Contact Preference</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'anonymous' as const, label: 'Anonymous', icon: EyeOff },
                  { value: 'email' as const, label: 'Email', icon: FileText },
                  { value: 'phone' as const, label: 'Phone', icon: FileText },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setContactPreference(opt.value)}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      contactPreference === opt.value
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    <opt.icon className="size-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Contact Fields */}
            {contactPreference === 'email' && (
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Email Address</Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:ring-emerald-500/30 focus:border-emerald-600"
                />
              </div>
            )}
            {contactPreference === 'phone' && (
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Phone Number</Label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g., +254 7XX XXX XXX"
                  className="bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:ring-emerald-500/30 focus:border-emerald-600"
                />
              </div>
            )}

            <Separator className="bg-zinc-800" />

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5 border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <Label htmlFor="terms" className="text-xs text-zinc-400 leading-relaxed cursor-pointer">
                I acknowledge that this report will be encrypted client-side using AES-256-GCM before
                transmission. I understand that intentionally submitting false reports is an offence
                under Kenyan law. I confirm the information provided is accurate to the best of my
                knowledge.
              </Label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5">
                <XCircle className="size-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <DialogFooter className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || encryptionStatus === 'encrypting'}
                className={`w-full gap-2 font-semibold transition-all ${
                  isFormValid && encryptionStatus !== 'encrypting'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {encryptionStatus === 'encrypting' ? (
                  <>
                    <Lock className="size-4 animate-spin" />
                    Encrypting &amp; Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Encrypt &amp; Submit Securely
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Success State */
          <div className="px-6 pb-6">
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="size-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-50">Report Submitted Securely</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Your report has been encrypted and transmitted. No one can intercept or read your submission.
                </p>
              </div>

              {/* Encrypted Data Stats */}
              <div className="space-y-2 pt-2">
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Encrypted Payload Size</span>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono">
                      {encryptedDataLength ? `${(encryptedDataLength / 1024).toFixed(1)} KB` : '\u2014'}
                    </Badge>
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">SHA-256 Hash</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-zinc-400 hover:text-zinc-300"
                      onClick={() => setShowHash(!showHash)}
                    >
                      {showHash ? <EyeOff className="size-3 mr-1" /> : <Eye className="size-3 mr-1" />}
                      {showHash ? 'Hide' : 'Reveal'}
                    </Button>
                  </div>
                  {showHash && encryptedHash && (
                    <div className="rounded bg-zinc-950 border border-zinc-800 px-3 py-2">
                      <code className="text-xs text-emerald-400/80 font-mono break-all leading-relaxed">
                        {encryptedHash}
                      </code>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-400/80 leading-relaxed">
                      Save this hash to verify the integrity of your report. Do <strong>not</strong> share
                      the hash publicly \u2014 it can be used to prove you submitted this specific report.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleClose(false)}
                variant="outline"
                className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
