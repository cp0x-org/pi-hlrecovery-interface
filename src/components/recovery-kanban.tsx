"use client";

import { useState } from "react";
import type { RecoveryAction, RecoveryColumn } from "@/lib/recovery-board";

const COLLAPSED_VISIBLE_ITEMS = 3;

type RecoveryKanbanProps = {
  actionDisabledOverride?: boolean;
  actionLabelOverride?: string;
  columns: RecoveryColumn[];
  isLoading?: boolean;
  onActionOverride?: () => void;
  onGroupAction?: (action: RecoveryAction) => void;
  onItemAction?: (action: RecoveryAction) => void;
};

function LoadingItems() {
  return (
    <div className="flex flex-1 flex-col gap-3">
      {[0, 1].map((item) => (
        <div
          className="rounded-lg border border-[#39454b] bg-[#1e1e26] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
          key={item}
        >
          <div className="animate-pulse">
            <div className="h-3 w-20 rounded-full bg-[#39454b]" />
            <div className="mt-3 h-2.5 w-full rounded-full bg-[#252530]" />
            <div className="mt-2 h-2.5 w-2/3 rounded-full bg-[#252530]" />
            <div className="mt-4 h-8 rounded-md bg-[#16161f]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecoveryKanban({
  actionDisabledOverride = false,
  actionLabelOverride,
  columns,
  isLoading = false,
  onActionOverride,
  onGroupAction,
  onItemAction,
}: RecoveryKanbanProps) {
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleExpandedColumn = (columnStep: string) => {
    setExpandedColumns((currentColumns) => {
      const nextColumns = new Set(currentColumns);

      if (nextColumns.has(columnStep)) {
        nextColumns.delete(columnStep);
      } else {
        nextColumns.add(columnStep);
      }

      return nextColumns;
    });
  };

  return (
    <div
      aria-busy={isLoading}
      className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7"
    >
      {columns.map((column) => {
        const hasItems = column.items.length > 0;
        const isExpanded = expandedColumns.has(column.step);
        const isCollapsible = column.items.length > COLLAPSED_VISIBLE_ITEMS;
        const visibleItems =
          isCollapsible && !isExpanded
            ? column.items.slice(0, COLLAPSED_VISIBLE_ITEMS)
            : column.items;
        const hiddenItemCount = column.items.length - visibleItems.length;
        const groupActionDisabled =
          actionDisabledOverride ||
          (!actionLabelOverride &&
            (!column.groupActionData || column.groupActionDisabled));

        return (
          <article
            className="flex min-h-[400px] min-w-0 flex-col rounded-lg border border-[#39454b] bg-[#1e1e26] shadow-[0_16px_48px_rgba(0,0,0,0.22)]"
            key={column.step}
          >
            <header className="min-w-0 border-b border-[#39454b]/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-md border border-[#39454b] bg-[#16161f] px-2 py-1 text-xs font-semibold text-[#28e5e5]">
                  Step {column.step}
                </span>
                {isLoading ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16161f] px-2 py-1 text-xs font-medium text-[#28e5e5]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#28e5e5]" />
                    Scanning
                  </span>
                ) : column.total ? (
                  <span className="min-w-0 max-w-[60%] rounded-full bg-[#16161f] px-2 py-1 text-right text-xs font-medium break-words text-[#28e5e5]">
                    {column.total}
                  </span>
                ) : null}
              </div>
              <h2 className="mt-3 min-w-0 text-lg font-semibold break-words text-[#eeeeee]">
                {column.title}
              </h2>
              <p className="mt-2 min-h-12 min-w-0 text-sm leading-5 break-words text-[#dddddd]/60">
                {column.description}
              </p>
            </header>

            <div className="flex min-w-0 flex-1 flex-col gap-3 p-3">
              {isLoading ? (
                <LoadingItems />
              ) : hasItems ? (
                <div className="relative min-w-0">
                  <div className="flex min-w-0 flex-col gap-3">
                    {visibleItems.map((item, itemIndex) => {
                      const itemActionDisabled =
                        actionDisabledOverride ||
                        (!actionLabelOverride &&
                          (item.disabled || !item.actionData));

                      return (
                        <div
                          className="min-w-0 rounded-lg border border-[#39454b]/60 bg-[#16161f] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                          key={
                            item.id ?? `${column.step}-${item.name}-${itemIndex}`
                          }
                        >
                          <div className="flex min-w-0 items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="min-w-0 text-sm font-semibold break-words text-[#eeeeee]">
                                {item.name}
                              </h3>
                              <p className="mt-1 min-w-0 text-xs leading-5 break-words text-[#dddddd]/60">
                                {item.detail}
                              </p>
                            </div>
                            <span className="min-w-0 max-w-[48%] text-right text-sm leading-5 font-semibold break-words text-[#28e5e5]">
                              {item.value}
                            </span>
                          </div>

                          {item.action ? (
                            <button
                              type="button"
                              disabled={itemActionDisabled}
                              onClick={
                                actionDisabledOverride
                                  ? undefined
                                  : actionLabelOverride
                                  ? onActionOverride
                                  : item.actionData
                                    ? () => onItemAction?.(item.actionData!)
                                    : undefined
                              }
                              className="mt-3 h-9 w-full cursor-pointer rounded-md border border-[#39454b] bg-[#1e1e26] px-3 text-sm font-medium whitespace-normal text-[#28e5e5] transition hover:border-[#28e5e5] hover:bg-[#252530] disabled:cursor-not-allowed disabled:border-[#39454b]/40 disabled:bg-[#16161f] disabled:text-[#525f66]"
                            >
                              {actionLabelOverride ?? item.action}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {isCollapsible ? (
                    <div
                      className={`${
                        isExpanded ? "mt-3" : "pointer-events-none absolute inset-x-0 bottom-0 flex h-28 items-end bg-gradient-to-t from-[#1e1e26] via-[#1e1e26]/95 to-transparent p-3"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpandedColumn(column.step)}
                        className={`h-9 w-full cursor-pointer rounded-md border border-[#39454b] bg-[#16161f] px-3 text-sm font-medium text-[#28e5e5] shadow-[0_12px_32px_rgba(0,0,0,0.32)] transition hover:border-[#28e5e5] hover:bg-[#252530] ${
                          isExpanded ? "" : "pointer-events-auto"
                        }`}
                      >
                        {isExpanded
                          ? "Collapse"
                          : `Expand ${hiddenItemCount} more`}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[#39454b]/40 bg-[#16161f] p-4 text-center">
                  <div>
                    <p className="text-sm font-semibold text-[#28e5e5]">
                      Nothing locked
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#525f66]">
                      {column.emptyDetail}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {column.groupAction && hasItems && !isLoading ? (
              <footer className="border-t border-[#39454b]/40 p-3">
                <button
                  type="button"
                  disabled={groupActionDisabled}
                  onClick={
                    actionDisabledOverride
                      ? undefined
                      : actionLabelOverride
                      ? onActionOverride
                      : column.groupActionData
                        ? () => onGroupAction?.(column.groupActionData!)
                        : undefined
                  }
                  className="h-10 w-full cursor-pointer rounded-md bg-[#28e5e5] px-3 text-sm font-semibold whitespace-normal text-[#16161f] transition hover:bg-[#2cfffe] disabled:cursor-not-allowed disabled:bg-[#39454b] disabled:text-[#525f66]"
                >
                  {actionLabelOverride ?? column.groupAction}
                </button>
              </footer>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
