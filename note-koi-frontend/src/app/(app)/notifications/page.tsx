"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { markNotificationRead } from "@/lib/api/notifications";

const NOTIFICATION_LABELS: Record<string, string> = {
  RESOURCE_APPROVED: "Resource Approved",
  RESOURCE_REJECTED: "Resource Rejected",
  PROMOTION_RECOMMENDATION_APPROVED: "Promotion Approved",
  PROMOTION_RECOMMENDATION_DENIED: "Promotion Denied",
  DELETION_APPROVED: "Deletion Approved",
  DELETION_DENIED: "Deletion Denied",
  PROMOTED_RESOURCE_LATER_REJECTED: "Promoted Resource Rejected",
};

const TYPE_COLOR: Record<string, string> = {
  RESOURCE_APPROVED: "#2f9e52",
  RESOURCE_REJECTED: "#d24545",
  PROMOTION_RECOMMENDATION_APPROVED: "#2f9e52",
  PROMOTION_RECOMMENDATION_DENIED: "#d24545",
  DELETION_APPROVED: "#d24545",
  DELETION_DENIED: "#c9973b",
  PROMOTED_RESOURCE_LATER_REJECTED: "#d24545",
};

export default function NotificationsPage() {
  const { isLoading: isLoadingUser } = useRequireAuth();
  const { data: notifications, isLoading } = useNotificationsQuery(1, 50);
  const qc = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = (notifications ?? []).filter((n) => !n.isRead).length;

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Notifications</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Your activity feed</h1>
      </div>
      {unreadCount > 0 && (
        <span className="rounded-full bg-[#e3f4e8] px-3 py-1 text-[11px] font-semibold text-[#2f9e52]">
          {unreadCount} unread
        </span>
      )}
    </div>
  );

  if (isLoadingUser || isLoading) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        {header}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
          ))}
        </div>
      </section>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        {header}
        <EmptyStateBlock
          title="No notifications yet"
          description="Approvals, rejections, and collaboration updates will appear here."
          actionText="Browse Discover"
          actionHref="/"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {header}
      <div className="space-y-2.5">
        {notifications.map((notification) => {
          const color = TYPE_COLOR[notification.type] ?? "var(--ink-soft)";
          return (
            <div
              key={notification.id}
              className={`rounded-[12px] border bg-[var(--paper)] px-4 py-3.5 transition ${
                notification.isRead
                  ? "border-[var(--line-soft)]"
                  : "border-[var(--accent)]/30 bg-[var(--ph)]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color }}>
                    {NOTIFICATION_LABELS[notification.type] ?? notification.type}
                  </p>
                  <p className="text-[13px] font-semibold text-[var(--ink)]">{notification.message}</p>
                  {notification.reason ? (
                    <p className="text-[12px] text-[var(--ink-soft)]">Reason: {notification.reason}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      notification.isRead
                        ? "bg-[var(--ph)] text-[var(--ink-soft)]"
                        : "bg-[#e3f4e8] text-[#2f9e52]"
                    }`}
                  >
                    {notification.isRead ? "Read" : "New"}
                  </span>
                  {!notification.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(notification.id)}
                      disabled={markReadMutation.isPending && markReadMutation.variables === notification.id}
                      className="text-[10.5px] text-[var(--ink-soft)] underline hover:text-[var(--ink)] disabled:opacity-50"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2.5 text-[10.5px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
