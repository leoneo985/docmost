import React, { useState, useRef } from "react";
import {
  ActionIcon,
  Affix,
  AppShell,
  Box,
  Button,
  CopyButton,
  Group,
  Popover,
  ScrollArea,
  Text,
  Tooltip,
} from "@mantine/core";
import { useGetSharedPageTreeQuery } from "@/features/share/queries/share-query.ts";
import { useParams } from "react-router-dom";
import SharedTree from "@/features/share/components/shared-tree.tsx";
import { TableOfContents } from "@/features/editor/components/table-of-contents/table-of-contents.tsx";
import { readOnlyEditorAtom } from "@/features/editor/atoms/editor-atoms.ts";
import { ThemeToggle } from "@/components/theme-toggle.tsx";
import { useAtomValue } from "jotai";
import { useAtom, useSetAtom } from "jotai";
import {
  desktopSidebarAtom,
  mobileSidebarAtom,
} from "@/components/layouts/global/hooks/atoms/sidebar-atom.ts";
import SidebarToggle from "@/components/ui/sidebar-toggle-button.tsx";
import { useTranslation } from "react-i18next";
import { useToggleSidebar } from "@/components/layouts/global/hooks/hooks/use-toggle-sidebar.ts";
import {
  mobileTableOfContentAsideAtom,
  tableOfContentAsideAtom,
} from "@/features/share/atoms/sidebar-atom.ts";
import { IconList, IconQrcode, IconCheck, IconCopy } from "@tabler/icons-react";
import { useToggleToc } from "@/features/share/hooks/use-toggle-toc.ts";
import classes from "./share.module.css";
import { useClickOutside } from "@mantine/hooks";
import { QRCodeCanvas } from "qrcode.react";

import {
  SearchControl,
  SearchMobileControl,
} from "@/features/search/components/search-control.tsx";
import { ShareSearchSpotlight } from "@/features/search/share-search-spotlight";
import { shareSearchSpotlight } from "@/features/search/constants";

const MemoizedSharedTree = React.memo(SharedTree);

export default function ShareShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [mobileOpened] = useAtom(mobileSidebarAtom);
  const [desktopOpened] = useAtom(desktopSidebarAtom);
  const setMobileOpened = useSetAtom(mobileSidebarAtom);
  const toggleMobile = useToggleSidebar(mobileSidebarAtom);
  const toggleDesktop = useToggleSidebar(desktopSidebarAtom);

  const [tocOpened] = useAtom(tableOfContentAsideAtom);
  const [mobileTocOpened] = useAtom(mobileTableOfContentAsideAtom);
  const setMobileTocOpened = useSetAtom(mobileTableOfContentAsideAtom);
  const toggleTocMobile = useToggleToc(mobileTableOfContentAsideAtom);
  const toggleToc = useToggleToc(tableOfContentAsideAtom);

  const { shareId } = useParams();
  const { data } = useGetSharedPageTreeQuery(shareId);
  const readOnlyEditor = useAtomValue(readOnlyEditorAtom);

  const navbarRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobileTocToggleRef = useRef<HTMLButtonElement>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useClickOutside(
    () => {
      if (mobileOpened) {
        setMobileOpened(false);
      }
    },
    null,
    [navbarRef.current, mobileToggleRef.current]
  );

  useClickOutside(
    () => {
      if (mobileTocOpened) {
        setMobileTocOpened(false);
      }
    },
    null,
    [asideRef.current, mobileTocToggleRef.current]
  );

  const closeMobileNavbar = () => {
    setMobileOpened(false);
  };

  const closeMobileToc = () => {
    setMobileTocOpened(false);
  };

  return (
    <AppShell
      header={{ height: 50 }}
      {...(data?.pageTree?.length > 1 && {
        navbar: {
          width: 300,
          breakpoint: "sm",
          collapsed: {
            mobile: !mobileOpened,
            desktop: !desktopOpened,
          },
        },
      })}
      aside={{
        width: 300,
        breakpoint: "sm",
        collapsed: {
          mobile: !mobileTocOpened,
          desktop: !tocOpened,
        },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group wrap="nowrap" justify="space-between" py="sm" px="xl">
          <Group wrap="nowrap">
            {data?.pageTree?.length > 1 && (
              <>
                <Tooltip label={t("Sidebar toggle")}>
                  <SidebarToggle
                    ref={mobileToggleRef}
                    aria-label={t("Sidebar toggle")}
                    opened={mobileOpened}
                    onClick={toggleMobile}
                    hiddenFrom="sm"
                    size="sm"
                  />
                </Tooltip>

                <Tooltip label={t("Sidebar toggle")}>
                  <SidebarToggle
                    aria-label={t("Sidebar toggle")}
                    opened={desktopOpened}
                    onClick={toggleDesktop}
                    visibleFrom="sm"
                    size="sm"
                  />
                </Tooltip>
              </>
            )}
          </Group>

          {shareId && (
            <Group visibleFrom="sm">
              <SearchControl onClick={shareSearchSpotlight.open} />
            </Group>
          )}

          <Group>
            <>
              {shareId && (
                <Group hiddenFrom="sm">
                  <SearchMobileControl onSearch={shareSearchSpotlight.open} />
                </Group>
              )}

              <Tooltip label={t("Table of contents")} withArrow>
                <ActionIcon
                  ref={mobileTocToggleRef}
                  variant="default"
                  style={{ border: "none" }}
                  onClick={toggleTocMobile}
                  hiddenFrom="sm"
                  size="sm"
                >
                  <IconList size={20} stroke={2} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={t("Table of contents")} withArrow>
                <ActionIcon
                  variant="default"
                  style={{ border: "none" }}
                  onClick={toggleToc}
                  visibleFrom="sm"
                  size="sm"
                >
                  <IconList size={20} stroke={2} />
                </ActionIcon>
              </Tooltip>
            </>

            <ThemeToggle />

            <Popover width={250} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <Tooltip label={t("Share link & QR code")} withArrow>
                  <ActionIcon variant="default" style={{ border: "none" }} size="sm">
                    <IconQrcode size={20} stroke={2} />
                  </ActionIcon>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown>
                <Text size="sm" mb="xs">{t("Share this page")}</Text>
                <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--mantine-spacing-sm)' }}>
                  <QRCodeCanvas value={shareUrl} size={160} />
                </Box>
                <CopyButton value={shareUrl} timeout={2000}>
                  {({ copied, copy }) => (
                    <Button
                      color={copied ? 'teal' : 'blue'}
                      onClick={copy}
                      fullWidth
                      leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    >
                      {copied ? t('Link copied') : t('Copy link')}
                    </Button>
                  )}
                </CopyButton>
              </Popover.Dropdown>
            </Popover>
          </Group>
        </Group>
      </AppShell.Header>

      {data?.pageTree?.length > 1 && (
        <AppShell.Navbar p="md" className={classes.navbar} ref={navbarRef}>
          <MemoizedSharedTree sharedPageTree={data} onLinkClick={closeMobileNavbar} />
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        {children}
      </AppShell.Main>

      <AppShell.Aside
        p="md"
        withBorder={mobileTocOpened}
        className={classes.aside}
        ref={asideRef}
      >
        <ScrollArea style={{ height: "80vh" }} scrollbarSize={5} type="scroll">
          <div style={{ paddingBottom: "50px" }}>
            {readOnlyEditor && (
              <TableOfContents isShare={true} editor={readOnlyEditor} onLinkClick={closeMobileToc} />
            )}

            {shareUrl && (
              <Box mt="xl" pt="xl" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                <Text size="sm" fw={500} mb="xs">{t("Share Link")}</Text>
                <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--mantine-spacing-sm)' }}>
                  <QRCodeCanvas value={shareUrl} size={120} />
                </Box>
                <CopyButton value={shareUrl} timeout={2000}>
                  {({ copied, copy }) => (
                    <Button
                      variant="light"
                      color={copied ? 'teal' : 'blue'}
                      onClick={copy}
                      fullWidth
                      leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    >
                      {copied ? t('Link copied') : t('Copy link')}
                    </Button>
                  )}
                </CopyButton>
              </Box>
            )}
          </div>
        </ScrollArea>
      </AppShell.Aside>

      <ShareSearchSpotlight shareId={shareId} />
    </AppShell>
  );
}
