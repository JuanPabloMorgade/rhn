'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Home,
  UserSearch,
  Settings,
  UserRoundCog,
  CircleUserRound,
  BellRing,
  NotepadTextDashed,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/authContext';
import PerfilUsuarioDialog from '@/app/(app)/usuarios/formulario-perfilUsuario/page';

const IDLE_TIMEOUT = 1000 * 60 * 60;

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { userInfo, logoutFirebase, user } = useAuth();
  const [openPerfil, setOpenPerfil] = useState(false);

  useEffect(() => {
    if (!user) return;

    let idleTimer: ReturnType<typeof setTimeout>;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        logoutFirebase();
      }, IDLE_TIMEOUT);
    };
    const eventos: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];
    resetIdle();
    eventos.forEach((e) => window.addEventListener(e, resetIdle));

    return () => {
      clearTimeout(idleTimer);
      eventos.forEach((e) => window.removeEventListener(e, resetIdle));
    };
  }, [user, logoutFirebase]);

  const handleLogout = async () => {
    await logoutFirebase();
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            RRHH - Notificaciones
          </h2>
        </SidebarHeader>
        <SidebarContent>
          <div className="mb-3">
            <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Gestión
            </h3>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/panel-control" legacyBehavior passHref>
                  <SidebarMenuButton
                    tooltip="Panel de control"
                    isActive={pathname === '/panel-control'}
                  >
                    <Home />
                    Panel
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/personal" legacyBehavior passHref>
                  <SidebarMenuButton
                    tooltip="Personal"
                    isActive={pathname === '/personal'}
                  >
                    <UserSearch />
                    Personal
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/notificaciones" legacyBehavior passHref>
                  <SidebarMenuButton
                    tooltip="Subir datos"
                    isActive={pathname === '/notificaciones'}
                  >
                    <BellRing />
                    Notificaciones
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>

          <div className="mb-3">
            <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Administración
            </h3>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/usuarios" legacyBehavior passHref>
                  <SidebarMenuButton
                    tooltip="Usuarios"
                    isActive={pathname === '/usuarios'}
                  >
                    <UserRoundCog />
                    Usuarios
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/templates" legacyBehavior passHref>
                  <SidebarMenuButton
                    tooltip="Templates"
                    isActive={pathname === '/templates'}
                  >
                    <NotepadTextDashed />
                    Templates
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/templates2" legacyBehavior passHref>
                  <SidebarMenuButton
                    tooltip="Templates2"
                    isActive={pathname === '/templates2'}
                  >
                    <NotepadTextDashed />
                    Templates2
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/ajustes" legacyBehavior passHref>
                  <SidebarMenuButton
                    tooltip="Ajustes"
                    isActive={pathname === '/ajustes'}
                  >
                    <Settings />
                    Ajustes
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4">
            <div
              className="flex items-center gap-2 text-md text-muted-foreground mb-2 cursor-pointer"
              onClick={() => setOpenPerfil(true)}
            >
              <CircleUserRound />
              <p>
                {userInfo?.nombre} {userInfo?.apellido}
              </p>
            </div>

            <button className="hover:font-semibold" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </SidebarFooter>

        <PerfilUsuarioDialog open={openPerfil} setOpen={setOpenPerfil} />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
