'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video, ImagePlus, MessageSquare, Upload, ThumbsUp,
  Play, Pause, Send, ChevronDown, ChevronUp, Camera, FileVideo,
  CheckCircle2, Clock, Loader2, X, Eye, MessageCircle, MapPin,
  Shield, AlertTriangle, Maximize2, Minimize2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CitizenProof } from '@/data/types';

// ─── Types ────────────────────────────────────────────────────────

interface CitizenProofPanelProps {
  projectId: string;
  projectName: string;
  countyCode: string;
}

interface ProofStats {
  total: number;
  videos: number;
  images: number;
  comments: number;
}

// ─── Avatar color helper ──────────────────────────────────────────

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

// ─── Video Proof Card ─────────────────────────────────────────────

function VideoProofCard({ proof, onUpvote, onReply }: {
  proof: CitizenProof;
  onUpvote: (proofId: string) => void;
  onReply: (proofId: string, authorName: string, content: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Sync fullscreen state with browser events
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div ref={containerRef}>
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
        <CardContent className="p-0">
          {/* Media area — video, image, or placeholder */}
          {(proof.type === 'video' && proof.content) ? (
            <div className="relative bg-stone-900 aspect-video max-h-48 flex items-center justify-center group/video">
              <video
                ref={videoRef}
                src={proof.content}
                className="w-full h-full object-contain"
                playsInline
                controls={isFullscreen}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              {/* Play overlay (only when NOT in native fullscreen) */}
              {!isFullscreen && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/video:opacity-100 transition-opacity"
                >
                  <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-stone-800" />
                    ) : (
                      <Play className="h-5 w-5 text-stone-800 ml-0.5" />
                    )}
                  </div>
                </button>
              )}
              {/* Controls row */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover/video:opacity-100 transition-opacity">
                <button
                  onClick={toggleFullscreen}
                  className="h-7 w-7 rounded-md bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                  title="Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {proof.verified && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 h-4">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>
          ) : (proof.type === 'image' && proof.content) ? (
            <div className="relative bg-stone-100 dark:bg-stone-800 aspect-video max-h-48 flex items-center justify-center group/video overflow-hidden">
              <img
                src={proof.content}
                alt={proof.caption || 'Citizen photo proof'}
                className="w-full h-full object-cover"
              />
              {/* Fullscreen button for images */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover/video:opacity-100 transition-opacity">
                <button
                  onClick={toggleFullscreen}
                  className="h-7 w-7 rounded-md bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                  title="Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {proof.verified && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 h-4">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video max-h-48 bg-stone-100 dark:bg-stone-800 flex flex-col items-center justify-center gap-2">
              {proof.type === 'video' ? (
                <>
                  <FileVideo className="h-10 w-10 text-stone-400" />
                  <span className="text-xs text-stone-500 dark:text-stone-400">Video proof uploaded</span>
                </>
              ) : (
                <>
                  <Camera className="h-10 w-10 text-stone-400" />
                  <span className="text-xs text-stone-500 dark:text-stone-400">Photo proof uploaded</span>
                </>
              )}
            </div>
          )}

        {/* Caption & Author */}
        <div className="p-3 space-y-2">
          {proof.caption && (
            <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">{proof.caption}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className={`text-[9px] text-white font-bold ${getAvatarColor(proof.authorName)}`}>
                  {getInitials(proof.authorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-xs font-medium text-stone-700 dark:text-stone-200">{proof.authorName}</span>
                {proof.authorLocation && (
                  <span className="text-[10px] text-stone-400 ml-1 flex items-center gap-0.5">
                    <MapPin className="h-2 w-2" />
                    {proof.authorLocation}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400">{timeAgo(proof.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Upvote */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-stone-500 dark:text-stone-400 hover:text-emerald-600"
                onClick={() => onUpvote(proof.id)}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                <span className="text-[10px] font-medium">{proof.upvotes}</span>
              </Button>

              {/* Reply toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-stone-500 dark:text-stone-400"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageCircle className="h-3 w-3" />
              </Button>

              {/* Replies expand */}
              {proof.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-stone-400"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  <span className="text-[10px]">{proof.replies.length}</span>
                  {showReplies ? (
                    <ChevronUp className="h-3 w-3 ml-0.5" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-stone-800">
              <Input
                placeholder="Your name"
                value={replyAuthor}
                onChange={e => setReplyAuthor(e.target.value)}
                className="h-7 text-xs bg-stone-50 dark:bg-stone-800"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="h-7 text-xs flex-1 bg-stone-50 dark:bg-stone-800"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && replyText.trim() && replyAuthor.trim()) {
                      onReply(proof.id, replyAuthor, replyText);
                      setReplyText('');
                      setShowReplyForm(false);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!replyText.trim() || !replyAuthor.trim()}
                  onClick={() => {
                    onReply(proof.id, replyAuthor, replyText);
                    setReplyText('');
                    setShowReplyForm(false);
                  }}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {showReplies && proof.replies.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-stone-800">
              {proof.replies.map(reply => (
                <div key={reply.id} className="flex gap-2 pt-1">
                  <Avatar className="h-5 w-5 flex-shrink-0 mt-0.5">
                    <AvatarFallback className={`text-[8px] text-white font-bold ${getAvatarColor(reply.authorName)}`}>
                      {getInitials(reply.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-stone-700 dark:text-stone-200">
                        {reply.authorName}
                      </span>
                      <span className="text-[10px] text-stone-400">{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

// ─── Comment Proof Card ───────────────────────────────────────────

function CommentProofCard({ proof, onUpvote, onReply }: {
  proof: CitizenProof;
  onUpvote: (proofId: string) => void;
  onReply: (proofId: string, authorName: string, content: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
      <CardContent className="p-3 space-y-2">
        <div className="flex gap-2.5">
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarFallback className={`text-[10px] text-white font-bold ${getAvatarColor(proof.authorName)}`}>
              {getInitials(proof.authorName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">{proof.authorName}</span>
              {proof.authorLocation && (
                <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                  <MapPin className="h-2 w-2" />
                  {proof.authorLocation}
                </span>
              )}
              <span className="text-[10px] text-stone-400">{timeAgo(proof.createdAt)}</span>
              {proof.verified && (
                <Badge className="bg-emerald-100 text-emerald-700 text-[8px] px-1 py-0 h-3.5">
                  <CheckCircle2 className="h-2 w-2 mr-0.5" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-1">
              {proof.content}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-stone-400 hover:text-emerald-600"
                onClick={() => onUpvote(proof.id)}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                <span className="text-[10px]">{proof.upvotes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-stone-400"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                <span className="text-[10px]">Reply</span>
              </Button>
              {proof.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-stone-400"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  <span className="text-[10px]">{proof.replies.length} replies</span>
                  {showReplies ? <ChevronUp className="h-2.5 w-2.5 ml-0.5" /> : <ChevronDown className="h-2.5 w-2.5 ml-0.5" />}
                </Button>
              )}
            </div>

            {/* Reply form */}
            {showReplyForm && (
              <div className="space-y-1.5 pt-2 mt-2 border-t border-stone-100 dark:border-stone-800">
                <Input
                  placeholder="Your name"
                  value={replyAuthor}
                  onChange={e => setReplyAuthor(e.target.value)}
                  className="h-7 text-xs bg-stone-50 dark:bg-stone-800"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="h-7 text-xs flex-1 bg-stone-50 dark:bg-stone-800"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && replyText.trim() && replyAuthor.trim()) {
                        onReply(proof.id, replyAuthor, replyText);
                        setReplyText('');
                        setShowReplyForm(false);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700"
                    disabled={!replyText.trim() || !replyAuthor.trim()}
                    onClick={() => {
                      onReply(proof.id, replyAuthor, replyText);
                      setReplyText('');
                      setShowReplyForm(false);
                    }}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {showReplies && proof.replies.length > 0 && (
              <div className="space-y-2 pt-2 mt-2 border-t border-stone-100 dark:border-stone-800">
                {proof.replies.map(reply => (
                  <div key={reply.id} className="flex gap-2">
                    <Avatar className="h-5 w-5 flex-shrink-0 mt-0.5">
                      <AvatarFallback className={`text-[8px] text-white font-bold ${getAvatarColor(reply.authorName)}`}>
                        {getInitials(reply.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-stone-700 dark:text-stone-200">
                          {reply.authorName}
                        </span>
                        <span className="text-[9px] text-stone-400">{timeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Upload Form ──────────────────────────────────────────────────

function UploadForm({ projectId, onProofAdded, activeType }: {
  projectId: string;
  onProofAdded: () => void;
  activeType: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorLocation, setAuthorLocation] = useState('');
  const [commentText, setCommentText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setCaption('');
    setCommentText('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!authorName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (activeType === 'comment') {
      if (!commentText.trim()) {
        toast.error('Please write a comment');
        return;
      }
      // Submit text comment
      try {
        setUploading(true);
        const res = await fetch(`/api/projects/${projectId}/proofs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'comment',
            content: commentText.trim(),
            authorName: authorName.trim(),
            authorLocation: authorLocation.trim(),
          }),
        });
        if (!res.ok) throw new Error('Failed to submit');
        toast.success('Comment posted successfully!');
        setCommentText('');
        onProofAdded();
      } catch {
        toast.error('Failed to post comment. Please try again.');
      } finally {
        setUploading(false);
      }
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);

      // Upload the file first
      const formData = new FormData();
      formData.append('video', selectedFile);

      const uploadRes = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload failed');
      }

      const uploadData = await uploadRes.json();

      // Now create the proof record
      const proofRes = await fetch(`/api/projects/${projectId}/proofs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: uploadData.isVideo ? 'video' : 'image',
          content: uploadData.url,
          caption: caption.trim(),
          authorName: authorName.trim(),
          authorLocation: authorLocation.trim(),
        }),
      });

      if (!proofRes.ok) throw new Error('Failed to create proof record');

      toast.success(uploadData.isVideo ? 'Video proof uploaded!' : 'Photo proof uploaded!');
      resetForm();
      onProofAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Comment form (simpler)
  if (activeType === 'comment') {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-stone-900">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Share Your Observation</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Your name"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              className="h-8 text-xs w-32 bg-white dark:bg-stone-800"
            />
            <Input
              placeholder="Your area (optional)"
              value={authorLocation}
              onChange={e => setAuthorLocation(e.target.value)}
              className="h-8 text-xs w-36 bg-white dark:bg-stone-800"
            />
          </div>
          <Textarea
            placeholder="Describe what you've observed about this project — progress, issues, or concerns..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="text-xs min-h-[60px] bg-white dark:bg-stone-800 resize-none"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={uploading || !commentText.trim() || !authorName.trim()}
              onClick={handleUpload}
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Video/Image upload form
  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-stone-900">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          {activeType === 'video' ? (
            <Video className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Camera className="h-3.5 w-3.5 text-emerald-600" />
          )}
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {activeType === 'video' ? 'Upload Video Proof' : 'Upload Photo Proof'}
          </span>
        </div>

        {/* File drop zone */}
        <div
          className="border-2 border-dashed border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-center cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="space-y-1.5">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto rounded-md" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FileVideo className="h-8 w-8 text-emerald-600" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-stone-700 dark:text-stone-200">{selectedFile.name}</p>
                    <p className="text-[10px] text-stone-400">{(selectedFile.size / 1024 / 1024).toFixed(1)}MB</p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] text-red-500 hover:text-red-700 h-6"
                onClick={e => { e.stopPropagation(); resetForm(); }}
              >
                <X className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <Upload className="h-6 w-6 text-emerald-500 mx-auto" />
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Click to select {activeType === 'video' ? 'video' : 'photo'}
              </p>
              <p className="text-[10px] text-stone-400">
                MP4, WebM, MOV, AVI, MKV up to 50MB
                {activeType === 'image' ? ' · JPG, PNG, WebP, GIF' : ''}
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={activeType === 'video'
            ? 'video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska'
            : 'image/jpeg,image/png,image/webp,image/gif'
          }
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Caption */}
        <Textarea
          placeholder="Describe what this proof shows..."
          value={caption}
          onChange={e => setCaption(e.target.value)}
          className="text-xs min-h-[40px] bg-white dark:bg-stone-800 resize-none"
        />

        {/* Author info */}
        <div className="flex gap-2">
          <Input
            placeholder="Your name *"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            className="h-8 text-xs flex-1 bg-white dark:bg-stone-800"
          />
          <Input
            placeholder="Your area (optional)"
            value={authorLocation}
            onChange={e => setAuthorLocation(e.target.value)}
            className="h-8 text-xs w-36 bg-white dark:bg-stone-800"
          />
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={uploading || !selectedFile || !authorName.trim()}
            onClick={handleUpload}
          >
            {uploading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3" />
                Upload Proof
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export default function CitizenProofPanel({ projectId, projectName, countyCode }: CitizenProofPanelProps) {
  const [proofs, setProofs] = useState<CitizenProof[]>([]);
  const [stats, setStats] = useState<ProofStats>({ total: 0, videos: 0, images: 0, comments: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  // Fetch proofs
  const fetchProofs = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/proofs`);
      if (res.ok) {
        const data = await res.json();
        setProofs(data.proofs || []);
        setStats({
          total: data.total || 0,
          videos: data.videos || 0,
          images: data.images || 0,
          comments: data.comments || 0,
        });
      }
    } catch {
      // Silently fail — proofs are optional
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  // Upvote handler
  const handleUpvote = async (proofId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/proofs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId, action: 'upvote' }),
      });
      if (res.ok) {
        setProofs(prev =>
          prev.map(p => p.id === proofId ? { ...p, upvotes: p.upvotes + 1 } : p)
        );
      }
    } catch {
      toast.error('Failed to upvote');
    }
  };

  // Reply handler
  const handleReply = async (proofId: string, authorName: string, content: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/proofs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId, action: 'reply', replyAuthorName: authorName, replyContent: content }),
      });
      if (res.ok) {
        fetchProofs(); // refresh to get the updated proof with reply
      }
    } catch {
      toast.error('Failed to post reply');
    }
  };

  // Filter proofs by tab
  const filteredProofs = proofs.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'videos') return p.type === 'video';
    if (activeTab === 'photos') return p.type === 'image';
    if (activeTab === 'comments') return p.type === 'comment';
    return true;
  });

  const getUploadType = () => {
    if (activeTab === 'videos') return 'video';
    if (activeTab === 'photos') return 'image';
    if (activeTab === 'comments') return 'comment';
    return 'video'; // default for "all"
  };

  return (
    <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-600" />
              Citizen Proof Hub
            </CardTitle>
            <CardDescription className="text-[10px] mt-0.5">
              Community-submitted videos, photos & observations as evidence
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="h-7 text-[11px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? (
              <>
                <X className="h-3 w-3" />
                Cancel
              </>
            ) : (
              <>
                <Upload className="h-3 w-3" />
                Add Proof
              </>
            )}
          </Button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 mt-2">
          {[
            { count: stats.videos, icon: Video, label: 'Videos' },
            { count: stats.images, icon: Camera, label: 'Photos' },
            { count: stats.comments, icon: MessageSquare, label: 'Comments' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-stone-400">
              <item.icon className="h-3 w-3" />
              <span className="font-semibold text-stone-700 dark:text-stone-200">{item.count}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Upload form (toggle) */}
        {showUpload && (
          <UploadForm
            projectId={projectId}
            onProofAdded={fetchProofs}
            activeType={activeTab === 'all' ? 'comment' : getUploadType()}
          />
        )}

        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8 bg-stone-100 dark:bg-stone-800">
            <TabsTrigger value="all" className="text-[11px] h-6 px-2.5">
              All ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-[11px] h-6 px-2.5">
              <Video className="h-3 w-3 mr-1" />
              Videos ({stats.videos})
            </TabsTrigger>
            <TabsTrigger value="photos" className="text-[11px] h-6 px-2.5">
              <Camera className="h-3 w-3 mr-1" />
              Photos ({stats.images})
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-[11px] h-6 px-2.5">
              <MessageSquare className="h-3 w-3 mr-1" />
              Comments ({stats.comments})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Proof list */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
            <span className="text-xs text-stone-500 ml-2">Loading citizen proofs...</span>
          </div>
        ) : filteredProofs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-stone-400">
            <AlertTriangle className="h-8 w-8 mb-2 text-stone-300" />
            <p className="text-xs font-medium">No proofs yet for this project</p>
            <p className="text-[10px] mt-1">
              Be the first to share a video, photo, or observation
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-7 text-[10px] border-emerald-300 text-emerald-700"
              onClick={() => setShowUpload(true)}
            >
              <Upload className="h-3 w-3 mr-1" />
              Add First Proof
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProofs.map(proof => (
              proof.type === 'comment' ? (
                <CommentProofCard
                  key={proof.id}
                  proof={proof}
                  onUpvote={handleUpvote}
                  onReply={handleReply}
                />
              ) : (
                <VideoProofCard
                  key={proof.id}
                  proof={proof}
                  onUpvote={handleUpvote}
                  onReply={handleReply}
                />
              )
            ))}
          </div>
        )}

        {/* Info banner */}
        <div className="p-2.5 rounded-md bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed space-y-0.5">
              <p>
                <span className="font-semibold text-stone-600 dark:text-stone-300">Community Evidence Policy:</span>{' '}
                All submissions are community-reported. Verified proofs carry a green badge. 
                False reports may be flagged and removed.
              </p>
              <p>
                Videos and photos are stored locally. In production, they would be 
                reviewed by county oversight committees before verification.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
