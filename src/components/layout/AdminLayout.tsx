import React from "react";
import {
  Home,
  Building2,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Sparkles
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((state) => state.logout);
  const userName = useAuthStore((state) => state.user?.name);
  const userEmail = useAuthStore((state) => state.user?.email);
  const location = useLocation();
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/properties" },
    { icon: Building2, label: "Portfolio", path: "/properties" },
    { icon: Settings, label: "Settings", path: "/settings", muted: true },
  ];
  const getInitials = (name: string | undefined) => {
    if (!name) return "AD";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background selection:bg-primary/20">
        <Sidebar className="border-r border-border/50 shadow-2xl">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-4 group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform duration-500">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tighter text-white leading-none">MaxGoldHouse</span>
                <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase mt-1">Admin Portal</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4 py-4 space-y-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="h-12 rounded-xl transition-all duration-300 px-4 group data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link to={item.path} className="flex items-center gap-4">
                      <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className={item.muted ? "opacity-50" : "font-bold"}>
                        {item.label}
                        {item.muted && <span className="ml-2 text-[8px] font-black uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">Soon</span>}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t border-white/5 bg-black/10">
            <button
              onClick={() => logout()}
              className="flex items-center gap-4 px-4 py-3 w-full text-sm font-bold text-muted-foreground hover:text-white hover:bg-rose-500/10 rounded-xl transition-all group"
            >
              <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span>System Sign Out</span>
            </button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-20 border-b border-border/50 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="h-10 w-10 hover:bg-muted rounded-xl" />
              <div className="h-8 w-px bg-border/50 hidden sm:block" />
              <div className="flex items-center gap-3 text-sm hidden sm:flex">
                <span className="font-black text-primary tracking-widest uppercase text-[10px]">Portal</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                <span className="text-foreground font-black capitalize tracking-tight text-lg">
                  {location.pathname.split('/').pop()?.replace('-', ' ') || 'Overview'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Online</span>
              </div>
              <ThemeToggle className="static h-10 w-10 rounded-xl" />
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none group">
                  <div className="flex items-center gap-4 p-1 rounded-2xl hover:bg-muted transition-all">
                    <div className="hidden md:flex flex-col items-end pr-1">
                      <span className="text-sm font-black tracking-tight">{userName || 'Admin'}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Administrator</span>
                    </div>
                    <Avatar className="h-10 w-10 rounded-xl border-2 border-primary/20 group-hover:border-primary/50 transition-all shadow-lg">
                      <AvatarFallback className="bg-primary text-primary-foreground font-black rounded-xl">
                        {userName ? getInitials(userName) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-border/50 shadow-2xl">
                  <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg leading-tight">{userName || 'Admin User'}</span>
                        <Sparkles className="h-3 w-3 text-amber-500" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{userEmail || 'admin@maxgoldhouse.com'}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2" />
                  <DropdownMenuItem className="p-3 rounded-xl cursor-pointer font-bold">Account Intelligence</DropdownMenuItem>
                  <DropdownMenuItem className="p-3 rounded-xl cursor-pointer font-bold">Security Preferences</DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2" />
                  <DropdownMenuItem onClick={() => logout()} className="p-3 rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive font-black">
                    Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05),transparent_50%)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-8 md:py-12 lg:py-16">
                {children}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}