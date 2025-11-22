"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
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

  // Helper functions
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

  const fetchPreviewData = useCallback(async (urlString: string) => {
    // Check if supported platform (inline check to avoid dependency)
    const platform = getPlatformFromUrl(urlString);
    if (platform === 'other') {
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
  }, []);

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
  }, [url, open, fetchPreviewData]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setUrlError(null);
    setValidationResult(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const validateYouTubeVideo = async (urlString: string): Promise<ValidationResult> => {
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
      // Return error result instead of null (matching og pattern)
      return {
        valid: false,
        explanation: error instanceof Error ? error.message : 'Failed to validate video. Please try again.',
      };
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

    const detectedPlatform = getPlatformFromUrl(url);

    if (detectedPlatform === 'youtube') {
      // For YouTube: validate first, then submit if valid (matching og pattern)
      setIsValidating(true);
      setValidationResult(null);
      setSubmitError(null);

      try {
        // First validate the video
        const validation = await validateYouTubeVideo(url);
        setValidationResult(validation);

        // If validation is successful, submit the bounty item immediately
        if (validation.valid) {
          await submitBountyItem(url);
          setSubmitSuccess(true);
          
          // Close dialog after 2 seconds
          setTimeout(() => {
            onOpenChange(false);
            // Refresh page to show new submission
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        setValidationResult({
          valid: false,
          explanation: error instanceof Error ? error.message : 'Failed to validate video. Please try again.',
        });
      } finally {
        setIsValidating(false);
      }
    } else {
      // For non-YouTube platforms, submit directly without validation (matching og pattern)
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        setIsValidating(true);
        await submitBountyItem(url);
        setValidationResult({
          valid: true,
          explanation: `Successfully submitted your ${detectedPlatform} content to the bounty!`,
        });
        setSubmitSuccess(true);

        // Close dialog after 2 seconds
        setTimeout(() => {
          onOpenChange(false);
          // Refresh page to show new submission
          window.location.reload();
        }, 2000);
      } catch (error) {
        setValidationResult({
          valid: false,
          explanation: error instanceof Error ? error.message : 'Failed to submit. Please try again.',
        });
        setSubmitError(error instanceof Error ? error.message : 'Failed to submit. Please try again.');
      } finally {
        setIsSubmitting(false);
        setIsValidating(false);
      }
    }
  };

  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  const canSubmit = url.trim() && isValidSupportedUrl(url) && !isCompleted && !isSubmitting && !isValidating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-[#25160F] p-6 shadow-lg border border-[#3A2518]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#F7F1E8]">
              Claim &quot;{bounty.title}&quot;
            </h2>
            <p className="mt-1 text-sm text-[#CBB8A4]">
              Brand: {bounty.brand} · Payout: ${bounty.payout}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#CBB8A4] hover:text-[#F7F1E8] transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {isCompleted && (
          <div className="mt-3 rounded-md bg-[#3A2518] px-3 py-2 text-xs text-[#CBB8A4]">
            This bounty has been marked as completed. New submissions are disabled.
          </div>
        )}

        {submitSuccess && (
          <div className="mt-3 rounded-md bg-[#341B11] px-3 py-2 text-xs text-[#F7F1E8] flex items-center gap-2 border border-[#C47A53]/30">
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
            <label className="block text-sm font-medium text-[#F7F1E8] mb-2">
              Content URL (YouTube, Instagram, or TikTok)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://tiktok.com/@user/video/..."
              className="w-full px-4 py-2 border border-[#3A2518] bg-[#140E0B] text-[#F7F1E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47A53]/20 focus:border-[#C47A53] disabled:bg-[#3A2518] disabled:cursor-not-allowed placeholder:text-[#A38E7A]"
              disabled={isCompleted || isSubmitting}
            />
            {urlError && (
              <p className="mt-1 text-xs text-red-400">{urlError}</p>
            )}
            {platform && platform !== 'other' && !urlError && (
              <p className="mt-1 text-xs text-[#C47A53] flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {platform.charAt(0).toUpperCase() + platform.slice(1)} URL detected
              </p>
            )}
          </div>

          {/* Preview Loading */}
          {isLoadingPreview && (
            <div className="flex items-center gap-2 text-sm text-[#CBB8A4]">
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
            <div className="border border-[#3A2518] rounded-lg p-4 bg-[#140E0B]">
              {previewData.image && (
                <img
                  src={previewData.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <h4 className="font-semibold text-sm text-[#F7F1E8] mb-1 line-clamp-2">
                {previewData.title}
              </h4>
              {previewData.description && (
                <p className="text-xs text-[#CBB8A4] line-clamp-2 mb-2">
                  {previewData.description}
                </p>
              )}
              <a
                href={previewData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#C47A53] hover:text-[#D4A574] inline-flex items-center gap-1"
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
                ? 'bg-[#341B11] text-[#F7F1E8] border border-[#C47A53]/30'
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
