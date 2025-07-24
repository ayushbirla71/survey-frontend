"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Users, Send, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Generate Survey", href: "/generate-survey", icon: FileSpreadsheet },
    { name: "Audience", href: "/audience", icon: Users },
    { name: "Sent Surveys", href: "/sent-surveys", icon: Send },
  ]

  return (
    <div className="hidden w-64 flex-col bg-slate-50 shadow-sm md:flex border-r border-slate-200">
      <div className="p-6 border-b border-slate-200 bg-white">
        <h2 className="text-2xl font-bold text-slate-800">Survey.AI</h2>
        <p className="text-sm text-slate-500 mt-1">Survey Platform</p>
      </div>

      <div className="flex-1 p-4 bg-slate-50">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start h-11 px-3 text-left font-medium"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 bg-white mt-auto">
        <div className="text-xs text-slate-500 text-center">
          <p>© 2024 Suray Platform</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
