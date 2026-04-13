"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, X, ChevronRight, ShieldCheck } from "lucide-react"
import { COLORS } from "@/lib/app-config"

export interface TopicMenuItem {
  label: string
  value: string
  emoji: string
  action?: "lottery" | "lotto"
}

export interface TopicMenuCategory {
  category: string
  icon: string
  isAdmin?: boolean
  items: TopicMenuItem[]
}

export const MENU_TOPICS: TopicMenuCategory[] = [
  {
    category: "Games",
    icon: "🎮",
    items: [
      { label: "Battle Royale Weapons", value: "battle royale weapons", emoji: "🔫" },
      { label: "Pokemon Starters", value: "Pokemon starter characters", emoji: "⚡" },
      { label: "RPG Classes", value: "RPG character classes", emoji: "⚔️" },
      { label: "Board Games", value: "classic board games", emoji: "♟️" },
      { label: "Minecraft Biomes", value: "Minecraft biomes", emoji: "🌲" },
      { label: "Retro Arcade Games", value: "retro arcade games", emoji: "👾" },
    ],
  },
  {
    category: "Movies & TV",
    icon: "🎬",
    items: [
      { label: "Marvel Superheroes", value: "Marvel superheroes", emoji: "🦸" },
      { label: "Disney Princesses", value: "Disney princesses", emoji: "👑" },
      { label: "Horror Movie Villains", value: "horror movie villains", emoji: "👻" },
      { label: "Animated Shows", value: "popular animated TV shows", emoji: "📺" },
      { label: "Sci-Fi Movies", value: "iconic sci-fi movies", emoji: "🚀" },
      { label: "Rom-Com Tropes", value: "romantic comedy tropes", emoji: "💕" },
    ],
  },
  {
    category: "Sports",
    icon: "⚽",
    items: [
      { label: "NBA Teams", value: "best NBA teams of all time", emoji: "🏀" },
      { label: "NBA MVP Candidates", value: "NBA MVP candidates this season", emoji: "🏆" },
      { label: "Premier League Teams", value: "best Premier League teams", emoji: "⚽" },
      { label: "Premier League Legends", value: "Premier League legend players", emoji: "🌟" },
      { label: "NFL Playoffs", value: "NFL playoff contenders this season", emoji: "🏈" },
      { label: "Super Bowl Favorites", value: "Super Bowl championship favorites", emoji: "🏟️" },
      { label: "World Cup Winners", value: "World Cup winning nations", emoji: "🌍" },
      { label: "F1 Drivers", value: "best Formula 1 drivers", emoji: "🏎️" },
      { label: "Olympic Sports", value: "Olympic sports events", emoji: "🏅" },
      { label: "Extreme Sports", value: "extreme sports", emoji: "🏂" },
    ],
  },
  {
    category: "Food & Drink",
    icon: "🍔",
    items: [
      { label: "Ramen Types", value: "ramen varieties", emoji: "🍜" },
      { label: "Cocktail Classics", value: "classic cocktails", emoji: "🍹" },
      { label: "Street Food", value: "street food from around the world", emoji: "🌮" },
      { label: "Sushi Rolls", value: "sushi roll varieties", emoji: "🍣" },
      { label: "Dessert Styles", value: "dessert styles from around the world", emoji: "🍰" },
      { label: "Hot Sauces", value: "hot sauce brands and styles", emoji: "🌶️" },
    ],
  },
  {
    category: "Pop Culture",
    icon: "🌟",
    items: [
      { label: "K-Pop Groups", value: "K-pop idol groups", emoji: "🎤" },
      { label: "TikTok Trends", value: "viral TikTok trends", emoji: "📱" },
      { label: "Internet Memes", value: "iconic internet memes", emoji: "😂" },
      { label: "Music Genres", value: "music genres", emoji: "🎵" },
      { label: "Famous Duos", value: "famous duo partnerships in pop culture", emoji: "👥" },
      { label: "Anime Series", value: "popular anime series", emoji: "🗡️" },
    ],
  },
  {
    category: "Nature & Science",
    icon: "🌿",
    items: [
      { label: "Deep Sea Creatures", value: "deep sea creatures", emoji: "🦑" },
      { label: "Space Objects", value: "objects in our solar system", emoji: "🪐" },
      { label: "Dinosaur Species", value: "dinosaur species", emoji: "🦕" },
      { label: "Exotic Animals", value: "exotic animals from around the world", emoji: "🐆" },
      { label: "Natural Wonders", value: "natural wonders of the world", emoji: "🏔️" },
      { label: "Gemstones", value: "precious gemstones", emoji: "💎" },
    ],
  },
  {
    category: "Admin",
    icon: "shield",
    isAdmin: true,
    items: [
      { label: "Lottery", value: "lottery", emoji: "ticket", action: "lottery" },
      { label: "Lotto", value: "lotto", emoji: "ticket", action: "lotto" },
    ],
  },
]

interface TopicMenuProps {
  onSelect: (value: string) => void
  onLotteryOpen: () => void
  onLottoOpen: () => void
  disabled?: boolean
}

export function TopicMenu({ onSelect, onLotteryOpen, onLottoOpen, disabled }: TopicMenuProps) {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveCategory(null)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const handleToggle = () => {
    if (disabled) return
    setOpen((prev) => !prev)
    if (open) setActiveCategory(null)
  }

  const handleCategoryClick = (category: string) => {
    setActiveCategory((prev) => (prev === category ? null : category))
  }

  const handleTopicClick = (item: TopicMenuItem) => {
    if (item.action === "lottery") {
      setOpen(false)
      setActiveCategory(null)
      onLotteryOpen()
      return
    }
    if (item.action === "lotto") {
      setOpen(false)
      setActiveCategory(null)
      onLottoOpen()
      return
    }
    onSelect(item.value)
    setOpen(false)
    setActiveCategory(null)
  }

  // Split categories into regular and admin
  const regularCategories = MENU_TOPICS.filter((c) => !c.isAdmin)
  const adminCategories = MENU_TOPICS.filter((c) => c.isAdmin)

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        aria-label="Open topic menu"
        aria-expanded={open}
        className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all
          ${open
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted"
          }
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-11 w-64 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
          role="menu"
        >
          <div className="px-4 pt-3 pb-2 border-b border-border">
            <p className="text-xs font-bold text-foreground uppercase tracking-wide">
              Topic Categories
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              Pick a category to browse topics
            </p>
          </div>

          <div className="py-1 max-h-80 overflow-y-auto">
            {regularCategories.map((cat) => (
              <div key={cat.category}>
                {/* Category Row */}
                <button
                  onClick={() => handleCategoryClick(cat.category)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors
                    ${activeCategory === cat.category
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                    }`}
                  aria-expanded={activeCategory === cat.category}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    {cat.category}
                  </span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${activeCategory === cat.category ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Sub-items */}
                {activeCategory === cat.category && (
                  <div className="bg-muted/50 border-t border-b border-border/50">
                    {cat.items.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handleTopicClick(item)}
                        className="w-full flex items-center gap-2.5 px-5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors text-left"
                        role="menuitem"
                      >
                        <span className="text-sm">{item.emoji}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Admin Section Divider */}
            {adminCategories.length > 0 && (
              <>
                <div className="mx-4 my-1 border-t border-border" />
                <div className="px-4 pt-1.5 pb-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Admin Management
                  </span>
                </div>
                {adminCategories.map((cat) =>
                  cat.items.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleTopicClick(item)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors text-left"
                      role="menuitem"
                    >
                      <ShieldCheck size={15} className="text-primary shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  ))
                )}
              </>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-border text-[10px] text-muted-foreground text-center">
            Select a topic to auto-fill and generate
          </div>
        </div>
      )}
    </div>
  )
}
