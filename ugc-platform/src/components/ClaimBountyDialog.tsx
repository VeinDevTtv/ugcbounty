"use client";

import { useState, useEffect, useCallback } from "react";
import { Bounty } from "@/app/data/bounties";
import Image from "next/image";

interface ClaimBountyDialogProps {
  bounty: Bounty;
  isOpen: boolean;
  onClose: () => void;
  isCompleted?: boolean;
}

interface PreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
}

export default function ClaimBountyDialog({
  bounty,
  isOpen,
  onClose,
  isCompleted = false,
}: ClaimBountyDialogProps) {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    explanation: string;
  } | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const isValidSupportedUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      return (
        hostname.includes("youtube.com") ||
        hostname.includes("youtu.be") ||
        hostname.includes("instagram.com") ||
        hostname.includes("tiktok.com")
      );
    } catch {
      return false;
    }
  };

  const getPlatformFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be"))
        return "youtube";
      if (hostname.includes("instagram.com")) return "instagram";
      if (hostname.includes("tiktok.com")) return "tiktok";
      return "unknown";
    } catch {
      return "unknown";
    }
  };

  const fetchPreviewData = useCallback(async (url: string) => {
    if (!url || !isValidSupportedUrl(url)) {
      setPreviewData(null);
      setPreviewError(null);
      return;
    }

    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      const response = await fetch("/api/link-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch preview");
      }

      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      setPreviewError(
        error instanceof Error ? error.message : "Failed to load preview"
      );
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (url && isValidSupportedUrl(url)) {
        fetchPreviewData(url);
      } else {
        setPreviewData(null);
        setPreviewError(null);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [url, fetchPreviewData]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setUrlError(null);

    if (newUrl && !isValidSupportedUrl(newUrl)) {
      setUrlError("URL must be from YouTube, Instagram, or TikTok");
    }
  };

  const submitBountyItem = async () => {
    try {
      const response = await fetch("/api/submit-bounty-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          bountyId: bounty.id,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to submit bounty item");
      }

      return result;
    } catch (error) {
      console.error("Error submitting bounty item:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (url && isValidSupportedUrl(url)) {
      const platform = getPlatformFromUrl(url);

      if (platform === "youtube") {
        setIsValidating(true);
        setValidationResult(null);

        try {
          // First validate the video
          const validationResponse = await fetch("/api/validate-bounty", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: url,
              requirements: bounty.description,
            }),
          });

          const result = await validationResponse.json();
          setValidationResult(result);

          // If validation is successful, submit the bounty item
          if (result.valid) {
            await submitBountyItem();
          }
        } catch {
          setValidationResult({
            valid: false,
            explanation: "Failed to validate video. Please try again.",
          });
        } finally {
          setIsValidating(false);
        }
      } else {
        // For non-YouTube platforms, submit directly without validation
        try {
          setIsValidating(true);
          await submitBountyItem();
          setValidationResult({
            valid: true,
            explanation: `Successfully submitted your ${platform} content to the bounty!`,
          });
        } catch (error) {
          setValidationResult({
            valid: false,
            explanation:
              error instanceof Error
                ? error.message
                : "Failed to submit. Please try again.",
          });
        } finally {
          setIsValidating(false);
        }
      }
    }
  };

  const handleClose = () => {
    setUrl("");
    setValidationResult(null);
    setIsValidating(false);
    setUrlError(null);
    setPreviewData(null);
    setPreviewError(null);
    setIsLoadingPreview(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Claim "{bounty.name}"
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Brand: {bounty.companyName || "Unknown"} · Payout: ${bounty.ratePer1kViews}/1k views
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-500 hover:text-zinc-700 transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isCompleted && (
          <p className="mt-3 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
            This bounty has been marked as completed. New submissions are disabled.
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Content URL (YouTube, Instagram, or TikTok)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={
                isCompleted
                  ? "Submissions are closed for this bounty"
                  : "https://youtube.com/watch?v=... or https://instagram.com/... or https://tiktok.com/..."
              }
              disabled={isCompleted}
              className={`w-full px-4 py-2 border ${
                urlError
                  ? "border-red-300 focus:ring-2 focus:ring-red-500"
                  : "border-zinc-300 focus:ring-2 focus:ring-emerald-500"
              } focus:border-transparent rounded-lg text-zinc-900 placeholder-zinc-400 ${
                isCompleted ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            {urlError && (
              <p className="mt-2 text-sm text-red-600">
                {urlError}
              </p>
            )}
            {url && !urlError && isValidSupportedUrl(url) && (
              <p className="mt-2 text-sm text-emerald-600">
                ✓{" "}
                {getPlatformFromUrl(url).charAt(0).toUpperCase() +
                  getPlatformFromUrl(url).slice(1)}{" "}
                URL detected
              </p>
            )}
          </div>

          {url && isValidSupportedUrl(url) && (
            <div className="mt-4">
              {isLoadingPreview && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                    <p className="text-zinc-600 font-medium">
                      Loading preview...
                    </p>
                  </div>
                </div>
              )}

              {previewError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">
                    ⚠️ Could not load preview: {previewError}
                  </p>
                </div>
              )}

              {previewData && !isLoadingPreview && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                  <div className="flex gap-4">
                    {previewData.image && (
                      <div className="flex-shrink-0 relative w-20 h-20">
                        <Image
                          src={previewData.image}
                          alt={previewData.title || "Preview"}
                          fill
                          className="object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-zinc-900 text-sm line-clamp-2">
                        {previewData.title || "No title available"}
                      </h4>
                      {previewData.description && (
                        <p className="text-zinc-600 text-xs mt-1 line-clamp-2">
                          {previewData.description}
                        </p>
                      )}
                      <p className="text-zinc-500 text-xs mt-2 truncate">
                        {previewData.url}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isValidating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="text-blue-800 font-medium">
                  Validating your video meets the bounty requirements...
                </p>
              </div>
            </div>
          )}

          {validationResult && (
            <div
              className={`border rounded-lg p-4 ${
                validationResult.valid
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    validationResult.valid
                      ? "bg-emerald-100"
                      : "bg-red-100"
                  }`}
                >
                  {validationResult.valid ? (
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      validationResult.valid
                        ? "text-emerald-800"
                        : "text-red-800"
                    }`}
                  >
                    {validationResult.valid
                      ? "🎉 Your video is now part of the bounty!"
                      : "❌ Video does not meet requirements"}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      validationResult.valid
                        ? "text-emerald-700"
                        : "text-red-700"
                    }`}
                  >
                    {validationResult.explanation}
                  </p>
                  {validationResult.valid && (
                    <button
                      onClick={handleClose}
                      className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!validationResult && (
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-900 rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCompleted || !url || isValidating || !isValidSupportedUrl(url)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isValidating ? "Validating..." : isCompleted ? "Completed" : "Submit Claim"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
