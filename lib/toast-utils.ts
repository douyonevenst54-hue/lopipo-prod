import { useToast } from "@/hooks/use-toast"

export type ToastVariant = "default" | "success" | "error" | "info" | "warning"

interface ToastOptions {
  title: string
  description?: string
  duration?: number
}

/**
 * Centralized toast notification utility
 * Provides consistent feedback for all user actions
 */
export function useAppToast() {
  const { toast } = useToast()

  return {
    success: (options: ToastOptions) => {
      toast({
        title: options.title,
        description: options.description,
        duration: options.duration ?? 3000,
        className: "bg-gradient-to-r from-green-500/20 to-emerald-500/10 border-green-500/50",
      })
    },

    error: (options: ToastOptions) => {
      toast({
        title: options.title,
        description: options.description,
        duration: options.duration ?? 5000,
        className: "bg-gradient-to-r from-red-500/20 to-orange-500/10 border-red-500/50",
      })
    },

    info: (options: ToastOptions) => {
      toast({
        title: options.title,
        description: options.description,
        duration: options.duration ?? 3000,
        className: "bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border-blue-500/50",
      })
    },

    warning: (options: ToastOptions) => {
      toast({
        title: options.title,
        description: options.description,
        duration: options.duration ?? 4000,
        className: "bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50",
      })
    },

    loading: (options: ToastOptions) => {
      return toast({
        title: options.title,
        description: options.description,
        duration: Infinity,
        className: "bg-gradient-to-r from-purple-500/20 to-pink-500/10 border-purple-500/50",
      })
    },
  }
}

/**
 * Toast messages for common LoPiPo actions
 */
export const toastMessages = {
  // Lottery
  ticketPurchased: "Ticket purchased successfully!",
  lotteryWon: "Congratulations! You won!",
  lotteryDrawing: "Draw starting...",
  
  // Polls
  voteSubmitted: "Your vote has been recorded",
  pollVoteError: "Failed to vote. Please try again.",
  pollCreated: "Poll created successfully!",
  pollFeatured: "Poll featured for 24 hours!",
  
  // User actions
  spinClaimed: "Daily spin claimed! 0.001π earned.",
  spinAlreadyClaimed: "You already claimed today's spin.",
  referralCopied: "Referral link copied to clipboard!",
  referralShared: "Referral link shared!",
  
  // Subscription
  subscriptionCreated: "Pro subscription activated!",
  subscriptionError: "Failed to activate subscription. Please try again.",
  
  // General
  actionSuccess: "Action completed successfully",
  actionError: "Something went wrong. Please try again.",
  networkError: "Network error. Please check your connection.",
  loadingData: "Loading...",
  savingData: "Saving changes...",
}
