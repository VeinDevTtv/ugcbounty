"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Search, DollarSign, Building2 } from "lucide-react"
import useDebounce from "@/hooks/use-debounce"
import { useRouter } from "next/navigation"

interface Bounty {
  id: string
  name: string
  description: string
  companyName?: string | null
  ratePer1kViews: number
  totalBounty: number
}

interface BountySearchBarProps {
  bounties: Bounty[]
  compact?: boolean
}

function BountySearchBar({ bounties, compact = false }: BountySearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [filteredBounties, setFilteredBounties] = useState<Bounty[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    if (!isFocused) {
      setFilteredBounties([])
      return
    }

    if (!debouncedQuery.trim()) {
      setFilteredBounties(bounties.slice(0, 5)) // Show first 5 bounties when no query
      return
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim()
    const filtered = bounties.filter((bounty) => {
      const searchableText = `${bounty.name} ${bounty.description} ${bounty.companyName || ""}`.toLowerCase()
      return searchableText.includes(normalizedQuery)
    })

    setFilteredBounties(filtered.slice(0, 8)) // Limit to 8 results
  }, [debouncedQuery, isFocused, bounties])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleBountyClick = (bountyId: string) => {
    router.push(`/bounty/${bountyId}`)
    setIsFocused(false)
    setQuery("")
  }

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: {
          duration: 0.3,
        },
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: {
          duration: 0.2,
        },
        opacity: {
          duration: 0.15,
        },
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: {
        duration: 0.15,
      },
    },
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  return (
    <div className={`relative ${compact ? "w-64" : "w-full max-w-xl"}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search bounties..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className={`${compact ? "h-9 text-sm" : "h-9 text-sm"} pl-3 pr-9 rounded-lg focus-visible:ring-offset-0`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="absolute top-full left-0 right-0 mt-1 z-50">
        <AnimatePresence>
          {isFocused && filteredBounties.length > 0 && (
            <motion.div
              className="border rounded-md shadow-lg overflow-hidden border-border bg-card max-h-[400px] overflow-y-auto"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.ul>
                {filteredBounties.map((bounty) => (
                  <motion.li
                    key={bounty.id}
                    className="px-3 py-2.5 flex items-start gap-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    variants={item}
                    layout
                    onClick={() => handleBountyClick(bounty.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{bounty.name}</p>
                          {bounty.companyName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3" />
                              {bounty.companyName}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                            {bounty.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs font-semibold text-primary">
                            ${bounty.ratePer1kViews.toFixed(2)}/1k
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
              {filteredBounties.length === 8 && debouncedQuery.trim() && (
                <div className="px-3 py-2 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground text-center">
                    Showing top results. Refine your search for more.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default BountySearchBar
