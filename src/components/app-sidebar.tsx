import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  ListChecks,
  ListTodo,
  Search,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Notes", url: "/notes", icon: FileText },
  { title: "Academic Planner", url: "/planner", icon: ListChecks },
  { title: "Risk Research", url: "/research", icon: Search },
  { title: "AI Chat", url: "/chat", icon: MessageCircle },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex flex-col items-center gap-2 px-2 py-4 group-data-[collapsible=icon]:py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.95_0.05_65)] text-primary shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-center leading-tight group-data-[collapsible=icon]:hidden">
            <span
              className="font-display text-xl font-extrabold tracking-tight text-primary"
              style={{
                textShadow:
                  "0 0 12px oklch(0.78 0.13 55 / 0.55), 0 0 24px oklch(0.78 0.13 55 / 0.25)",
              }}
            >
              Prestige AI
            </span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Technology Institute
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[oklch(0.96_0.04_65)] text-[oklch(0.72_0.14_55)]">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-[10px] leading-snug text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          AI-generated content may require human review.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
