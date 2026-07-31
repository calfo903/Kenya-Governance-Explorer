"use client";

import { type AnchorHTMLAttributes, type FC, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";

interface DownloadLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: React.ReactNode;
}

/**
 * Replaces <a href="..."> for external URLs.
 * - If authenticated: triggers server-side proxy download via /api/download?url=...
 * - If not authenticated: opens auth modal, then downloads after login/register.
 * - Internal links (same-origin or hash) pass through as normal links.
 */
const DownloadLink: FC<DownloadLinkProps> = ({ href, children, onClick, ...rest }) => {
  const { requestDownload } = useAuth();

  const isExternal = (() => {
    try {
      const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "http://localhost");
      if (url.origin === (typeof window !== "undefined" ? window.location.origin : "http://localhost")) return false;
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  })();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isExternal) {
        e.preventDefault();
        e.stopPropagation();
        requestDownload(href);
      }
      onClick?.(e);
    },
    [isExternal, href, requestDownload, onClick],
  );

  if (!isExternal) {
    return (
      <a href={href} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
};

export default DownloadLink;
