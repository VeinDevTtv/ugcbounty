"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { useScrollLock } from "@/hooks/use-scroll-lock";

type Bounty = {
  id: string;
  title: string;
  brand: string;
  payout: string;
  deadline: string;
  description?: string;
  instructions?: string | null; // Exact requirements for video validation (takes priority over description)
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

  // Lock scroll when dialog is open
  useScrollLock(open);

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
          requirements: bounty.instructions || bounty.description || bounty.title, // Use instructions first, then description, then title
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
      <div className="w-full max-w-md rounded-2xl p-6 shadow-lg border max-h-[90vh] overflow-y-auto dark:bg-[#141B23] dark:border-[#1A2332] bg-white border-[#C8D1E0]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold dark:text-[#F5F8FC] text-[#2E3A47]">
              Claim &quot;{bounty.title}&quot;
            </h2>
            <p className="mt-1 text-sm dark:text-[#B8C5D6] text-[#52677C]">
              Brand: {bounty.brand} · Payout: ${bounty.payout}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="dark:text-[#B8C5D6] dark:hover:text-[#F5F8FC] text-[#52677C] hover:text-[#2E3A47] transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {isCompleted && (
          <div className="mt-3 rounded-md dark:bg-[#0A0F17] dark:text-[#B8C5D6] bg-[#DDE5F2] px-3 py-2 text-xs text-[#52677C]">
            This bounty has been marked as completed. New submissions are disabled.
          </div>
        )}

        {submitSuccess && (
          <div className="mt-3 rounded-md dark:bg-[rgba(96,165,250,0.12)] dark:text-[#F5F8FC] dark:border-[#60A5FA] bg-green-50 px-3 py-2 text-xs text-green-700 flex items-center gap-2 border border-green-200">
            <CheckCircle className="h-4 w-4" />
            Submission successful! Redirecting...
          </div>
        )}

        {submitError && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-200">
            {submitError}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-[#F5F8FC] text-[#2E3A47] mb-2">
              Content URL (YouTube, Instagram, or TikTok)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://tiktok.com/@user/video/..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:cursor-not-allowed dark:border-[#1A2332] dark:bg-[#141B23] dark:text-[#F5F8FC] dark:focus:ring-[#60A5FA]/20 dark:focus:border-[#60A5FA] dark:disabled:bg-[#0A0F17] dark:placeholder:text-[#B8C5D6] border-[#C8D1E0] bg-white text-[#2E3A47] focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3] disabled:bg-[#D9E1EF] placeholder:text-[#6B7A8F]"
              disabled={isCompleted || isSubmitting}
            />
            {urlError && (
              <p className="mt-1 text-xs text-red-600">{urlError}</p>
            )}
            {platform && platform !== 'other' && !urlError && (
              <p className="mt-1 text-xs dark:text-[#60A5FA] text-[#4F6FA8] flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {platform.charAt(0).toUpperCase() + platform.slice(1)} URL detected
              </p>
            )}
          </div>

          {/* Preview Loading */}
          {isLoadingPreview && (
            <div className="flex items-center gap-2 text-sm dark:text-[#B8C5D6] text-[#52677C]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preview...
            </div>
          )}

          {/* Preview Error */}
          {previewError && (
            <div className="rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-700 border border-yellow-200">
              {previewError}
            </div>
          )}

          {/* Preview Card */}
          {previewData && !previewError && (
            <div className="border rounded-lg p-4 dark:border-[#1A2332] dark:bg-[#141B23] border-[#C8D1E0] bg-[#F7FAFC]">
              {previewData.image && (
                <img
                  src={previewData.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <h4 className="font-semibold text-sm dark:text-[#F5F8FC] text-[#2E3A47] mb-1 line-clamp-2">
                {previewData.title}
              </h4>
              {previewData.description && (
                <p className="text-xs dark:text-[#B8C5D6] text-[#52677C] line-clamp-2 mb-2">
                  {previewData.description}
                </p>
              )}
              <a
                href={previewData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs dark:text-[#60A5FA] dark:hover:text-[#3B82F6] text-[#4F6FA8] hover:text-[#1B3C73] inline-flex items-center gap-1"
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
                ? 'dark:bg-[rgba(96,165,250,0.12)] dark:text-[#F5F8FC] dark:border-[#60A5FA] bg-green-50 text-green-700 border border-green-200'
                : 'dark:bg-red-900/30 dark:text-red-400 bg-red-50 text-red-600 border border-red-200'
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
