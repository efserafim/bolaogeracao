"use client";

import { useCallback, useState } from "react";
import { Avatar } from "./Avatar";
import { UserPredictionsModal } from "./UserPredictionsModal";

export function RankingParticipant({
  userId,
  name,
  image,
  avatarSize = 34,
  isMe,
  isLoggedIn,
  layout = "inline",
  className = "",
}: {
  userId: string;
  name: string;
  image?: string | null;
  avatarSize?: number;
  isMe?: boolean;
  isLoggedIn: boolean;
  layout?: "inline" | "stacked";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeModal = useCallback(() => setOpen(false), []);

  const nameEl = isLoggedIn ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="group truncate text-left font-medium text-slate-800 transition hover:text-brand-600"
      title={`Ver palpites de ${name}`}
    >
      {name}
      <span className="ml-1 text-xs font-normal text-brand-500 opacity-0 transition group-hover:opacity-100">
        ↗
      </span>
    </button>
  ) : (
    <span className="truncate font-medium text-slate-800">{name}</span>
  );

  if (layout === "stacked") {
    return (
      <>
        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`group flex w-full flex-col items-center text-center ${className}`}
            title={`Ver palpites de ${name}`}
          >
            <Avatar
              name={name}
              image={image}
              userId={userId}
              size={avatarSize}
              className="mt-2 transition group-hover:ring-accent-400"
            />
            <p className="mt-2 max-w-full truncate font-display font-bold text-slate-900 transition group-hover:text-brand-600">
              {name}
              {isMe && (
                <span className="ml-1 text-xs font-semibold text-brand-600">
                  (você)
                </span>
              )}
            </p>
          </button>
        ) : (
          <div className={`flex w-full flex-col items-center text-center ${className}`}>
            <Avatar name={name} image={image} userId={userId} size={avatarSize} className="mt-2" />
            <p className="mt-2 max-w-full truncate font-display font-bold text-slate-900">
              {name}
              {isMe && (
                <span className="ml-1 text-xs font-semibold text-brand-600">
                  (você)
                </span>
              )}
            </p>
          </div>
        )}
        {open && (
          <UserPredictionsModal
            userId={userId}
            userName={name}
            image={image}
            onClose={closeModal}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`flex min-w-0 items-center gap-3 ${className}`}>
        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full transition hover:ring-2 hover:ring-brand-200"
            title={`Ver palpites de ${name}`}
          >
            <Avatar name={name} image={image} userId={userId} size={avatarSize} />
          </button>
        ) : (
          <Avatar name={name} image={image} userId={userId} size={avatarSize} />
        )}
        <div className="min-w-0">
          {nameEl}
          {isMe && (
            <span className="ml-1 text-xs font-semibold text-brand-600">
              (você)
            </span>
          )}
        </div>
      </div>
      {open && (
        <UserPredictionsModal
          userId={userId}
          userName={name}
          image={image}
          onClose={closeModal}
        />
      )}
    </>
  );
}
