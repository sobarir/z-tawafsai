'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowLeftRight,
  BedDouble,
  Building2,
  CalendarRange,
  Clock,
  Coins,
  Handshake,
  Hotel,
  LayoutDashboard,
  Link2,
  LogOut,
  type LucideIcon,
  Luggage,
  MapPin,
  MapPinned,
  Menu,
  PlaneTakeoff,
  Tags,
  Ticket,
  UserCircle,
  Waypoints,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { AppBrand } from '@/components/shared/app-brand';
import { UserDropdown } from '@/components/shared/user-dropdown';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/features/auth/hooks/auth-provider';
import LanguageSwitcher from '@/features/i18n/components/language-switcher';
import { ThemeToggle } from '@/features/theme/components/theme-toggle';
import { cn } from '@/libs/utils';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  items: NavItem[];
  sectionLabel?: string;
}

interface SidebarContentProps {
  pathname: string;
  isRtl: boolean;
  items: NavItem[];
  secondaryGroups?: NavGroup[];
  labels: {
    theme: string;
    language: string;
    logout: string;
  };
  onLogoutRequest: () => void;
  onItemClick?: () => void;
  isCollapsed?: boolean;
  showFooter?: boolean;
}

const SIDEBAR_PANEL_CLASS =
  'sidebar-glass rounded-none border-y-0 border-sidebar-glass-edge';

function sidebarContentBorder(isRtl: boolean) {
  return isRtl ? 'border-r-0 border-l' : 'border-r border-l-0';
}

function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavTooltip({
  label,
  isRtl,
  children,
}: {
  label: string;
  isRtl: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={isRtl ? 'left' : 'right'}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function NavLinkItem({
  item,
  pathname,
  isCollapsed,
  isRtl,
  onItemClick,
}: {
  item: NavItem;
  pathname: string;
  isCollapsed: boolean;
  isRtl: boolean;
  onItemClick?: () => void;
}) {
  const Icon = item.icon;
  const isActive = isNavActive(pathname, item.href);

  const link = (
    <Link
      href={item.href}
      onClick={onItemClick}
      data-active={isActive}
      className={cn(
        'sidebar-nav-admin',
        isCollapsed && 'sidebar-nav-admin-collapsed',
      )}
    >
      <span className="sidebar-nav-admin-icon">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!isCollapsed) return link;

  return (
    <NavTooltip label={item.label} isRtl={isRtl}>
      {link}
    </NavTooltip>
  );
}

function NavGroupSection({
  group,
  pathname,
  isCollapsed,
  isRtl,
  onItemClick,
}: {
  group: NavGroup;
  pathname: string;
  isCollapsed: boolean;
  isRtl: boolean;
  onItemClick?: () => void;
}) {
  if (group.items.length === 0) return null;

  return (
    <>
      <div className="my-2 border-t border-sidebar-glass-edge" />
      {!isCollapsed && group.sectionLabel ? (
        <p className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">
          {group.sectionLabel}
        </p>
      ) : null}
      <ul className="sidebar-nav-group flex w-full min-w-0 flex-col gap-1.5">
        {group.items.map((item) => (
          <li key={item.id}>
            <NavLinkItem
              item={item}
              pathname={pathname}
              isCollapsed={isCollapsed}
              isRtl={isRtl}
              onItemClick={onItemClick}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function SidebarContent({
  pathname,
  isRtl,
  items,
  secondaryGroups = [],
  labels,
  onLogoutRequest,
  onItemClick,
  isCollapsed = false,
  showFooter = false,
}: SidebarContentProps) {
  return (
    <div
      className={cn(
        'flex h-full min-w-0 flex-col bg-transparent',
        isRtl && 'text-right',
      )}
    >
      <div
        className={cn(
          'sidebar-header-divider flex w-full min-w-0 items-center justify-center overflow-hidden',
          isCollapsed ? 'px-1.5' : 'px-3',
        )}
      >
        <AppBrand
          href="/"
          onClick={onItemClick}
          showName={!isCollapsed}
          isRtl={isRtl}
          size={isCollapsed ? 24 : 26}
          className={cn(
            'max-w-full min-w-0 justify-center',
            isCollapsed ? 'w-auto gap-0' : 'w-full',
          )}
          logoClassName={isCollapsed ? 'h-6 w-6' : 'h-[26px] w-[26px]'}
          nameClassName="text-sidebar-foreground text-sm font-semibold sm:text-base"
        />
      </div>

      <TooltipProvider delayDuration={0}>
        <nav className="no-scrollbar min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-2">
          <ul className="sidebar-nav-group flex w-full min-w-0 flex-col gap-1.5">
            {items.map((item) => (
              <li key={item.id}>
                <NavLinkItem
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  isRtl={isRtl}
                  onItemClick={onItemClick}
                />
              </li>
            ))}
          </ul>

          {secondaryGroups.map((group) => (
            <NavGroupSection
              key={group.sectionLabel}
              group={group}
              pathname={pathname}
              isCollapsed={isCollapsed}
              isRtl={isRtl}
              onItemClick={onItemClick}
            />
          ))}
        </nav>

        {showFooter ? (
          <div className="border-t border-transparent px-2">
            <div className="p-2">
              {isCollapsed ? (
                <div className="space-y-0.5">
                  <NavTooltip label={labels.theme} isRtl={isRtl}>
                    <div className="flex items-center justify-center py-1.5">
                      <ThemeToggle />
                    </div>
                  </NavTooltip>
                  <NavTooltip label={labels.language} isRtl={isRtl}>
                    <div className="flex items-center justify-center py-1.5">
                      <LanguageSwitcher />
                    </div>
                  </NavTooltip>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <ThemeToggle variant="titled" title={labels.theme} />
                  <LanguageSwitcher variant="titled" title={labels.language} />
                </div>
              )}
            </div>

            <div className="space-y-0.5 p-2">
              {isCollapsed ? (
                <NavTooltip label={labels.logout} isRtl={isRtl}>
                  <button
                    type="button"
                    className="sidebar-nav-logout justify-center px-2 py-2"
                    onClick={() => {
                      onLogoutRequest();
                      onItemClick?.();
                    }}
                    aria-label={labels.logout}
                  >
                    <span className="sidebar-nav-logout-icon">
                      <LogOut className="h-[18px] w-[18px]" />
                    </span>
                  </button>
                </NavTooltip>
              ) : (
                <button
                  type="button"
                  className="sidebar-nav-logout cursor-pointer"
                  onClick={() => {
                    onLogoutRequest();
                    onItemClick?.();
                  }}
                >
                  <span className="sidebar-nav-logout-icon">
                    <LogOut className="h-[18px] w-[18px]" />
                  </span>
                  <span>{labels.logout}</span>
                </button>
              )}
            </div>
          </div>
        ) : null}
      </TooltipProvider>
    </div>
  );
}

export const COLLAPSED_STORAGE_KEY = 'sidebar-collapsed';
export const COLLAPSED_STORAGE_EVENT = 'sidebar-collapsed-change';

export function subscribeToCollapsed(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: StorageEvent | Event) => {
    if ('key' in event && event.key && event.key !== COLLAPSED_STORAGE_KEY) {
      return;
    }
    onStoreChange();
  };

  window.addEventListener('storage', handler);
  window.addEventListener(COLLAPSED_STORAGE_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(COLLAPSED_STORAGE_EVENT, handler);
  };
}

export function readCollapsedSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
}

function parseCollapsed(raw: string | null): boolean {
  if (!raw) return false;

  try {
    return JSON.parse(raw) === true;
  } catch {
    return false;
  }
}

export function useSidebarCollapsed() {
  const collapsedRaw = useSyncExternalStore(
    subscribeToCollapsed,
    readCollapsedSnapshot,
    () => null,
  );
  const collapsed = parseCollapsed(collapsedRaw);
  const setCollapsed = useCallback((value: boolean) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new Event(COLLAPSED_STORAGE_EVENT));
  }, []);

  return [collapsed, setCollapsed] as const;
}

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  profile: UserCircle,
  search: PlaneTakeoff,
  searchHotels: Hotel,
} as const;

function buildNavItems(
  dashboardLabel: string,
  profileLabel: string,
  searchLabel: string,
  searchHotelsLabel: string,
): NavItem[] {
  return [
    {
      id: 'dashboard',
      label: dashboardLabel,
      href: '/dashboard',
      icon: NAV_ICONS.dashboard,
    },
    {
      id: 'profile',
      label: profileLabel,
      href: '/profile',
      icon: NAV_ICONS.profile,
    },
    {
      id: 'search',
      label: searchLabel,
      href: '/flights',
      icon: NAV_ICONS.search,
    },
    {
      id: 'search-hotels',
      label: searchHotelsLabel,
      href: '/hotels',
      icon: NAV_ICONS.searchHotels,
    },
  ];
}

const SCHEDULE_NAV_ICONS = {
  airports: MapPin,
  airlines: Building2,
  flights: Waypoints,
  codeshare: Ticket,
  mctRules: Clock,
  interlineAgreements: Handshake,
  connections: Link2,
} as const;

interface ScheduleNavLabels {
  airports: string;
  airlines: string;
  flights: string;
  codeshare: string;
  mctRules: string;
  interlineAgreements: string;
  connections: string;
}

function buildScheduleAdminNavItems(labels: ScheduleNavLabels): NavItem[] {
  return [
    {
      id: 'schedule-airports',
      label: labels.airports,
      href: '/schedule/airports',
      icon: SCHEDULE_NAV_ICONS.airports,
    },
    {
      id: 'schedule-airlines',
      label: labels.airlines,
      href: '/schedule/airlines',
      icon: SCHEDULE_NAV_ICONS.airlines,
    },
    {
      id: 'schedule-flights',
      label: labels.flights,
      href: '/schedule/flights',
      icon: SCHEDULE_NAV_ICONS.flights,
    },
    {
      id: 'schedule-codeshare',
      label: labels.codeshare,
      href: '/schedule/codeshare',
      icon: SCHEDULE_NAV_ICONS.codeshare,
    },
    {
      id: 'schedule-mct-rules',
      label: labels.mctRules,
      href: '/schedule/mct-rules',
      icon: SCHEDULE_NAV_ICONS.mctRules,
    },
    {
      id: 'schedule-interline-agreements',
      label: labels.interlineAgreements,
      href: '/schedule/interline-agreements',
      icon: SCHEDULE_NAV_ICONS.interlineAgreements,
    },
    {
      id: 'schedule-connections',
      label: labels.connections,
      href: '/schedule/connections',
      icon: SCHEDULE_NAV_ICONS.connections,
    },
  ];
}

const CATALOG_NAV_ICONS = {
  properties: Hotel,
  roomTypes: BedDouble,
  seasons: CalendarRange,
  rateRules: Tags,
} as const;

interface CatalogNavLabels {
  properties: string;
  roomTypes: string;
  seasons: string;
  rateRules: string;
}

function buildCatalogAdminNavItems(labels: CatalogNavLabels): NavItem[] {
  return [
    {
      id: 'catalog-properties',
      label: labels.properties,
      href: '/catalog/properties',
      icon: CATALOG_NAV_ICONS.properties,
    },
    {
      id: 'catalog-room-types',
      label: labels.roomTypes,
      href: '/catalog/room-types',
      icon: CATALOG_NAV_ICONS.roomTypes,
    },
    {
      id: 'catalog-seasons',
      label: labels.seasons,
      href: '/catalog/seasons',
      icon: CATALOG_NAV_ICONS.seasons,
    },
    {
      id: 'catalog-rate-rules',
      label: labels.rateRules,
      href: '/catalog/rate-rules',
      icon: CATALOG_NAV_ICONS.rateRules,
    },
  ];
}

const REFERENCE_NAV_ICONS = {
  cities: MapPinned,
  currencies: Coins,
  fxRates: ArrowLeftRight,
} as const;

interface ReferenceNavLabels {
  cities: string;
  currencies: string;
  fxRates: string;
}

function buildReferenceDataNavItems(labels: ReferenceNavLabels): NavItem[] {
  return [
    {
      id: 'reference-cities',
      label: labels.cities,
      href: '/reference/cities',
      icon: REFERENCE_NAV_ICONS.cities,
    },
    {
      id: 'reference-currencies',
      label: labels.currencies,
      href: '/reference/currencies',
      icon: REFERENCE_NAV_ICONS.currencies,
    },
    {
      id: 'reference-fx-rates',
      label: labels.fxRates,
      href: '/reference/fx-rates',
      icon: REFERENCE_NAV_ICONS.fxRates,
    },
  ];
}

const TRAVEL_PACKAGES_NAV_ICONS = {
  travelPackages: Luggage,
  providers: Handshake,
  earnings: Coins,
} as const;

interface TravelPackagesNavLabels {
  travelPackages: string;
  providers: string;
  earnings: string;
}

function buildTravelPackagesAdminNavItems(
  labels: TravelPackagesNavLabels,
): NavItem[] {
  return [
    {
      id: 'travel-packages-admin',
      label: labels.travelPackages,
      href: '/travel-packages/admin',
      icon: TRAVEL_PACKAGES_NAV_ICONS.travelPackages,
    },
    {
      id: 'travel-packages-providers',
      label: labels.providers,
      href: '/travel-packages/providers',
      icon: TRAVEL_PACKAGES_NAV_ICONS.providers,
    },
    {
      id: 'travel-packages-earnings',
      label: labels.earnings,
      href: '/travel-packages/earnings',
      icon: TRAVEL_PACKAGES_NAV_ICONS.earnings,
    },
  ];
}

export function Sidebar() {
  const t = useTranslations();
  const { user, signOut, hasPermission } = useAuth();
  const locale = useLocale();
  const pathname = usePathname();
  const isRtl = locale === 'ar';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [collapsed] = useSidebarCollapsed();

  const items = useMemo(
    () =>
      buildNavItems(
        t('navigation.dashboard'),
        t('navigation.profile'),
        t('navigation.searchFlights'),
        t('navigation.searchHotels'),
      ),
    [t],
  );

  const canManageSchedule = hasPermission('dashboard.view:admin');
  const adminItems = useMemo(
    () =>
      canManageSchedule
        ? buildScheduleAdminNavItems({
            airports: t('schedule.nav.airports'),
            airlines: t('schedule.nav.airlines'),
            flights: t('schedule.nav.flights'),
            codeshare: t('schedule.nav.codeshare'),
            mctRules: t('schedule.nav.mctRules'),
            interlineAgreements: t('schedule.nav.interlineAgreements'),
            connections: t('schedule.nav.connections'),
          })
        : [],
    [canManageSchedule, t],
  );
  const adminSectionLabel = t('schedule.nav.section');

  const catalogItems = useMemo(
    () =>
      canManageSchedule
        ? buildCatalogAdminNavItems({
            properties: t('catalog.nav.properties'),
            roomTypes: t('catalog.nav.roomTypes'),
            seasons: t('catalog.nav.seasons'),
            rateRules: t('catalog.nav.rateRules'),
          })
        : [],
    [canManageSchedule, t],
  );
  const catalogSectionLabel = t('catalog.nav.section');

  const referenceItems = useMemo(
    () =>
      canManageSchedule
        ? buildReferenceDataNavItems({
            cities: t('reference.nav.cities'),
            currencies: t('reference.nav.currencies'),
            fxRates: t('reference.nav.fxRates'),
          })
        : [],
    [canManageSchedule, t],
  );
  const referenceSectionLabel = t('reference.nav.section');

  const travelPackagesAdminItems = useMemo(
    () =>
      canManageSchedule
        ? buildTravelPackagesAdminNavItems({
            travelPackages: t('travelPackagesAdmin.nav.travelPackages'),
            providers: t('travelPackagesAdmin.nav.providers'),
            earnings: t('travelPackagesAdmin.nav.earnings'),
          })
        : [],
    [canManageSchedule, t],
  );
  const travelPackagesAdminSectionLabel = t('travelPackagesAdmin.nav.section');

  const secondaryGroups = useMemo(
    () => [
      { items: adminItems, sectionLabel: adminSectionLabel },
      { items: catalogItems, sectionLabel: catalogSectionLabel },
      { items: referenceItems, sectionLabel: referenceSectionLabel },
      {
        items: travelPackagesAdminItems,
        sectionLabel: travelPackagesAdminSectionLabel,
      },
    ],
    [
      adminItems,
      adminSectionLabel,
      catalogItems,
      catalogSectionLabel,
      referenceItems,
      referenceSectionLabel,
      travelPackagesAdminItems,
      travelPackagesAdminSectionLabel,
    ],
  );

  const labels = useMemo(
    () => ({
      theme: t('sidebar.theme'),
      language: t('sidebar.language'),
      logout: t('navigation.logout'),
    }),
    [t],
  );

  const mobileTitle = useMemo(() => {
    const segment = pathname.split('/').filter(Boolean).at(-1);
    if (!segment) return t('navigation.dashboard');
    if (segment === 'dashboard') return t('navigation.dashboard');
    if (segment === 'profile') return t('navigation.profile');
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }, [pathname, t]);

  const handleLogoutRequest = () => setLogoutDialogOpen(true);
  const handleConfirmLogout = () => {
    setLogoutDialogOpen(false);
    setMobileOpen(false);
    void signOut();
  };

  return (
    <>
      <div
        className="topbar-glass fixed top-0 right-0 left-0 z-50 flex h-app-header items-center border-b border-border/40 px-4 md:hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-1 items-center justify-start gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-ms-1 h-8 w-8"
                aria-label={t('sidebar.menu')}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={isRtl ? 'right' : 'left'}
              showCloseButton={false}
              className={cn(
                SIDEBAR_PANEL_CLASS,
                'h-screen w-[18rem] max-w-[85vw] gap-0 p-0 sm:max-w-[18rem]',
                sidebarContentBorder(isRtl),
              )}
            >
              <SheetTitle className="sr-only">{t('sidebar.menu')}</SheetTitle>
              <SidebarContent
                pathname={pathname}
                isRtl={isRtl}
                items={items}
                secondaryGroups={secondaryGroups}
                labels={labels}
                onLogoutRequest={handleLogoutRequest}
                onItemClick={() => setMobileOpen(false)}
                showFooter
              />
            </SheetContent>
          </Sheet>
          <h1 className="truncate text-lg font-semibold">{mobileTitle}</h1>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
          {user ? (
            <UserDropdown
              onlyAvatar
              contentClassName="w-56"
              onLogout={() => setMobileOpen(false)}
            />
          ) : null}
        </div>
      </div>

      <aside
        className={cn(
          SIDEBAR_PANEL_CLASS,
          'relative z-40 hidden h-screen shrink-0 flex-col overflow-hidden transition-all duration-300 ease-in-out md:flex',
          sidebarContentBorder(isRtl),
          collapsed ? 'w-16' : 'w-[18.125rem]',
        )}
      >
        <SidebarContent
          pathname={pathname}
          isRtl={isRtl}
          items={items}
          secondaryGroups={secondaryGroups}
          labels={labels}
          onLogoutRequest={handleLogoutRequest}
          isCollapsed={collapsed}
        />
      </aside>

      <Dialog.Root open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg">
            <Dialog.Title className="text-base font-semibold">
              {t('auth.logout.title')}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {t('auth.logout.confirm')}
            </Dialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" size="sm">
                  {t('common.cancel')}
                </Button>
              </Dialog.Close>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmLogout}
              >
                {t('common.confirm')}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
