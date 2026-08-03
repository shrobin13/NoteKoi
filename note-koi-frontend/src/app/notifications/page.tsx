"use client";

import { Card } from "@/components/ui/card";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function NotificationsPage() {
  const { isLoading: isLoadingUser } = useRequireAuth();
  const { data: notifications, isLoading } = useNotificationsQuery(1, 20);

  if (isLoadingUser || isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Notifications</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Your activity feed</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Loading your latest notifications...</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-700/80 bg-slate-900/80 p-6">
            <p className="text-sm text-slate-400">Loading...</p>
          </Card>
          <Card className="border-slate-700/80 bg-slate-900/80 p-6">
            <p className="text-sm text-slate-400">Please wait while we fetch your notifications.</p>
          </Card>
        </div>
      </section>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Notifications</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Your activity feed</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            You currently have no notifications. Once review and collaboration workflows are enabled, alerts will appear here.
          </p>
        </div>
        <EmptyStateBlock
          title="Stay tuned"
          description="Important updates like verification status, resource approvals, and community alerts will live here."
          actionText="Browse Discover"
          actionHref="/"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Notifications</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Your activity feed</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Review your latest alerts, approvals, and community activity.
        </p>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="border-slate-700/80 bg-slate-900/80 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{notification.title}</p>
                {notification.body ? (
                  <p className="mt-2 text-sm leading-6 text-slate-300">{notification.body}</p>
                ) : null}
              </div>
              <span className={
                `rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${notification.read ? "bg-slate-800 text-slate-400" : "bg-emerald-500 text-slate-950"}`
              }>
                {notification.read ? "Read" : "New"}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
