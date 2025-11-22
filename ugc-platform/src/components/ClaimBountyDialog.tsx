"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";

type Bounty = {
  id: string;
  title: string;
  brand: string;
  payout: string;
  deadline: string;
  description?: string; // For validation requirements (matching og/)
};

type ClaimBountyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bounty: Bounty;
  isCompleted: boolean;
};

interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface ValidationResult {
  valid: boolean;
  explanation: string;
}

export default function ClaimBountyDialog({
  open,
  onOpenChange,
  bounty,
  isCompleted,
}: ClaimBountyDialogProps) {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'youtube' | 'tiktok' | 'instagram' | 'other' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setUrl("");
      setUrlError(null);
      setPreviewData(null);
      setPreviewError(null);
      setValidationResult(null);
      setPlatform(null);
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [open]);

  // Debounced preview fetching
  useEffect(() => {
    if (!open || !url.trim()) {
      setPreviewData(null);
      setPreviewError(null);
      return;
    }

    // Validate URL format first
    if (!isValidUrl(url)) {
      setUrlError("Please enter a valid URL");
      setPreviewData(null);
      return;
    }

    // Check if supported platform
    const detectedPlatform = getPlatformFromUrl(url);
    if (detectedPlatform === 'other') {
      setUrlError("Please enter a URL from YouTube, TikTok, or Instagram");
      setPreviewData(null);
      return;
    }

    setUrlError(null);
    setPlatform(detectedPlatform);

    // Debounce preview fetch
    const timer = setTimeout(() => {
      fetchPreviewData(url);
    }, 1000);

    return () => clearTimeout(timer);
  }, [url, open]);

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const getPlatformFromUrl = (urlString: string): 'youtube' | 'tiktok' | 'instagram' | 'other' => {
    try {
      const hostname = new URL(urlString).hostname.toLowerCase();
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return 'youtube';
      }
      if (hostname.includes('tiktok.com')) {
        return 'tiktok';
      }
      if (hostname.includes('instagram.com')) {
        return 'instagram';
      }
      return 'other';
    } catch {
      return 'other';
    }
  };

  const isValidSupportedUrl = (urlString: string): boolean => {
    return getPlatformFromUrl(urlString) !== 'other';
  };

  const fetchPreviewData = async (urlString: string) => {
    if (!isValidSupportedUrl(urlString)) {
      return;
    }

    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      const response = await fetch('/api/link-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlString }),
      });

      if (response.ok) {
        const data: LinkPreviewData = await response.json();
        setPreviewData(data);
      } else {
        const error = await response.json();
        setPreviewError(error.error || 'Failed to load preview');
        setPreviewData(null);
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
      setPreviewError('Failed to load preview');
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setUrlError(null);
    setValidationResult(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const validateYouTubeVideo = async (urlString: string): Promise<ValidationResult | null> => {
    try {
      const response = await fetch('/api/validate-bounty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlString,
          requirements: bounty.description || bounty.title, // Use description if available, fallback to title
        }),
      });

      if (response.ok) {
        const result: ValidationResult = await response.json();
        return result;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Validation failed');
      }
    } catch (error) {
      console.error('Error validating YouTube video:', error);
      return null;
    }
  };

  const submitBountyItem = async (urlString: string) => {
    try {
      const response = await fetch('/api/submit-bounty-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlString,
          bountyId: bounty.id,
        }),
      });

      if (response.ok) {
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting bounty item:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (isCompleted || !url.trim() || !isValidSupportedUrl(url)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // For YouTube: validate first
      if (platform === 'youtube') {
        setIsValidating(true);
        const validation = await validateYouTubeVideo(url);
        setIsValidating(false);

        if (!validation) {
          setSubmitError('Failed to validate video. Please try again.');
          setIsSubmitting(false);
          return;
        }

        if (!validation.valid) {
          setValidationResult(validation);
          setIsSubmitting(false);
          return;
        }

        setValidationResult(validation);
      }

      // Submit the bounty item
      await submitBountyItem(url);
      setSubmitSuccess(true);

      // Close dialog after 2 seconds
      setTimeout(() => {
        onOpenChange(false);
        // Refresh page to show new submission
        window.location.reload();
      }, 2000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
    }
  };

  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  const canSubmit = url.trim() && isValidSupportedUrl(url) && !isCompleted && !isSubmitting && !isValidating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#020617] p-6 shadow-lg border border-[#010A12]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#FFFFFF]">
              Claim "{bounty.title}"
            </h2>
            <p className="mt-1 text-sm text-[#CFCFCF]">
              Brand: {bounty.brand} · Payout: ${bounty.payout}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#CFCFCF] hover:text-[#FFFFFF] transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {isCompleted && (
          <div className="mt-3 rounded-md bg-[#010A12] px-3 py-2 text-xs text-[#CFCFCF]">
            This bounty has been marked as completed. New submissions are disabled.
          </div>
        )}

        {submitSuccess && (
          <div className="mt-3 rounded-md bg-[rgba(16,185,129,0.12)] px-3 py-2 text-xs text-[#FFFFFF] flex items-center gap-2 border border-[#10B981]">
            <CheckCircle className="h-4 w-4" />
            Submission successful! Redirecting...
          </div>
        )}

        {submitError && (
          <div className="mt-3 rounded-md bg-red-900/30 px-3 py-2 text-xs text-red-400">
            {submitError}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
              Content URL (YouTube, Instagram, or TikTok)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://tiktok.com/@user/video/..."
              className="w-full px-4 py-2 border border-[#010A12] bg-[#020617] text-[#FFFFFF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] disabled:bg-[#010A12] disabled:cursor-not-allowed placeholder:text-[#CFCFCF]"
              disabled={isCompleted || isSubmitting}
            />
            {urlError && (
              <p className="mt-1 text-xs text-red-400">{urlError}</p>
            )}
            {platform && platform !== 'other' && !urlError && (
              <p className="mt-1 text-xs text-[#10B981] flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {platform.charAt(0).toUpperCase() + platform.slice(1)} URL detected
              </p>
            )}
          </div>

          {/* Preview Loading */}
          {isLoadingPreview && (
            <div className="flex items-center gap-2 text-sm text-[#CFCFCF]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preview...
            </div>
          )}

          {/* Preview Error */}
          {previewError && (
            <div className="rounded-md bg-yellow-900/30 px-3 py-2 text-xs text-yellow-400">
              {previewError}
            </div>
          )}

          {/* Preview Card */}
          {previewData && !previewError && (
            <div className="border border-[#010A12] rounded-lg p-4 bg-[#020617]">
              {previewData.image && (
                <img
                  src={previewData.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <h4 className="font-semibold text-sm text-[#FFFFFF] mb-1 line-clamp-2">
                {previewData.title}
              </h4>
              {previewData.description && (
                <p className="text-xs text-[#CFCFCF] line-clamp-2 mb-2">
                  {previewData.description}
                </p>
              )}
              <a
                href={previewData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#10B981] hover:text-[#059669] inline-flex items-center gap-1"
              >
                {previewData.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Validation Result */}
          {validationResult && (
            <div className={`rounded-md px-3 py-2 text-xs ${
              validationResult.valid
                ? 'bg-[rgba(16,185,129,0.12)] text-[#FFFFFF] border border-[#10B981]'
                : 'bg-red-900/30 text-red-400'
            }`}>
              <div className="font-semibold mb-1">
                {validationResult.valid ? '✓ Validation Passed' : '✗ Validation Failed'}
              </div>
              <p>{validationResult.explanation}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : isCompleted ? (
              "Completed"
            ) : (
              "Submit Claim"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
