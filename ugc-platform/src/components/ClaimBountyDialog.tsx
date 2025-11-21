"use client";

import { Button } from "@/components/ui/Button";

type Bounty = {
  id: string;
  title: string;
  brand: string;
  payout: string;
  deadline: string;
  // add whatever else you need
};

type ClaimBountyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bounty: Bounty;
  isCompleted: boolean;
};

export default function ClaimBountyDialog({
  open,
  onOpenChange,
  bounty,
  isCompleted,
}: ClaimBountyDialogProps) {
  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  const handleSubmit = () => {
    if (isCompleted) return;
    // TODO: call your claim API / submit form here
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">
          Claim “{bounty.title}”
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Brand: {bounty.brand} · Payout: ${bounty.payout}
        </p>

        {isCompleted && (
          <p className="mt-3 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
            This bounty has been marked as completed. New submissions are disabled.
          </p>
        )}

        {/* Replace this with your actual claim form/fields */}
        <div className="mt-4 space-y-2 text-sm text-zinc-600">
          <p>Drop your submission link or details here (TODO).</p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isCompleted}
          >
            {isCompleted ? "Completed" : "Submit Claim"}
          </Button>
        </div>
      </div>
    </div>
  );
}
