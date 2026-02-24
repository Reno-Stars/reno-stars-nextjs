'use client';

import { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
import { CARD, NAVY, TEXT_MID, TEXT_MUTED, GOLD, SURFACE, SURFACE_ALT, neu, neuIn } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import DragHandleIcon from '@/components/admin/DragHandleIcon';
import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

/** Config object passed from list clients that use useDragReorder */
export interface DragReorderConfig {
  draggedId: string | null;
  dragOverId: string | null;
  isReordering: boolean;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent, id: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
  handleDragEnd: () => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  searchable?: boolean;
  searchKeys?: string[];
  pageSize?: number;
  actions?: (row: T) => ReactNode;
  renderExpandedRow?: (row: T) => ReactNode;
  /** Custom filter that replaces default searchKeys matching. Return true to include the row. */
  filterRow?: (row: T, query: string) => boolean;
  /** Optional content rendered on the right side of the search bar row */
  headerAction?: ReactNode;
  /** Enable drag-and-drop row reordering with insertion line indicator */
  dragReorder?: DragReorderConfig;
}

const EMPTY_SEARCH_KEYS: string[] = [];

function getField(obj: object, key: string): unknown {
  return (obj as Record<string, unknown>)[key];
}

export default function DataTable<T extends object>({
  columns,
  data,
  getRowKey,
  searchable = true,
  searchKeys = EMPTY_SEARCH_KEYS,
  pageSize = 15,
  actions,
  renderExpandedRow,
  filterRow,
  headerAction,
  dragReorder,
}: DataTableProps<T>) {
  const t = useAdminTranslations();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpanded = useCallback((key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  }, []);

  useEffect(() => {
    setPage(0);
  }, [data.length]);

  const isSearching = search.trim().length > 0;
  const isDragEnabled = !!dragReorder && !isSearching;

  const filtered = useMemo(() => {
    if (!isSearching) return data;
    const q = search.toLowerCase();
    if (filterRow) return data.filter((row) => filterRow(row, q));
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = getField(row, key);
        return typeof val === 'string' && val.toLowerCase().includes(q);
      })
    );
  }, [data, search, isSearching, searchKeys, filterRow]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = getField(a, sortKey);
      const bVal = getField(b, sortKey);
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // Build index map for insertion line: rowKey → index in paged array
  const dragIndexMap = useMemo(() => {
    if (!dragReorder?.draggedId || !dragReorder.dragOverId) return null;
    const map = new Map<string, number>();
    paged.forEach((row, i) => map.set(getRowKey(row), i));
    return map;
  }, [dragReorder?.draggedId, dragReorder?.dragOverId, paged, getRowKey]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  /**
   * Determine where to show the insertion line on the dragOver target row.
   * Returns 'top' | 'bottom' | null.
   * - Dragging down (D < T): show line on bottom of target
   * - Dragging up (D > T): show line on top of target
   */
  function getInsertionEdge(rowKey: string): 'top' | 'bottom' | null {
    if (!dragReorder?.draggedId || !dragReorder.dragOverId || !dragIndexMap) return null;
    if (rowKey !== dragReorder.dragOverId) return null;
    if (rowKey === dragReorder.draggedId) return null;
    const D = dragIndexMap.get(dragReorder.draggedId);
    const T = dragIndexMap.get(dragReorder.dragOverId);
    if (D === undefined || T === undefined) return null;
    return D < T ? 'bottom' : 'top';
  }

  const hasDragCol = !!dragReorder;
  const totalCols = columns.length + (actions ? 1 : 0) + (renderExpandedRow ? 1 : 0) + (hasDragCol ? 1 : 0);

  return (
    <div>
      {(searchable || headerAction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
          {searchable ? (
            <input
              type="text"
              placeholder={t.common.search}
              aria-label={t.common.searchRecords}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                boxShadow: neuIn(3),
                backgroundColor: CARD,
                color: NAVY,
                fontSize: '0.875rem',
                outline: 'none',
                width: '280px',
                maxWidth: '100%',
              }}
            />
          ) : <div />}
          {headerAction}
        </div>
      )}
      <div
        style={{
          backgroundColor: CARD,
          borderRadius: '12px',
          boxShadow: neu(6),
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            aria-label={t.common.dataTable}
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8125rem',
            }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${SURFACE}` }}>
                {hasDragCol && (
                  <th style={{ width: '2rem', padding: '0.75rem 0 0.75rem 0.75rem' }} />
                )}
                {renderExpandedRow && <th style={{ width: '1.5rem' }} />}
                {columns.map((col) => {
                  const effectiveSortable = col.sortable && !dragReorder;
                  return (
                    <th
                      key={col.key}
                      tabIndex={effectiveSortable ? 0 : undefined}
                      role={effectiveSortable ? 'button' : undefined}
                      aria-sort={sortKey === col.key && effectiveSortable ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                      onKeyDown={effectiveSortable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.key); } } : undefined}
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        color: TEXT_MUTED,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: effectiveSortable ? 'pointer' : 'default',
                        userSelect: 'none',
                        outline: 'none',
                        whiteSpace: 'nowrap',
                        width: col.width,
                      }}
                      onFocus={(e) => { if (effectiveSortable) e.currentTarget.style.outline = `2px solid ${GOLD}`; }}
                      onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
                      onClick={() => effectiveSortable && handleSort(col.key)}
                    >
                      {col.header}
                      {effectiveSortable && sortKey === col.key && (
                        <span aria-hidden="true" style={{ marginLeft: '0.25rem' }}>
                          {sortDir === 'asc' ? '\u2191' : '\u2193'}
                        </span>
                      )}
                    </th>
                  );
                })}
                {actions && (
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'right',
                      color: TEXT_MUTED,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      width: '120px',
                    }}
                  >
                    {t.common.actions}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalCols}
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: TEXT_MUTED,
                    }}
                  >
                    {isSearching
                      ? t.common.noResultsFor.replace('{query}', search.trim())
                      : t.common.noRecords}
                  </td>
                </tr>
              ) : (
                paged.map((row) => {
                  const rowKey = getRowKey(row);
                  const isExpanded = isSearching || expandedKey === rowKey;
                  const isDragged = dragReorder?.draggedId === rowKey;
                  const insertionEdge = getInsertionEdge(rowKey);

                  return (
                    <Fragment key={rowKey}>
                      <tr
                        role={renderExpandedRow ? 'button' : undefined}
                        tabIndex={renderExpandedRow ? 0 : undefined}
                        aria-expanded={renderExpandedRow ? isExpanded : undefined}
                        draggable={isDragEnabled ? true : undefined}
                        onDragStart={isDragEnabled ? (e) => dragReorder!.handleDragStart(e, rowKey) : undefined}
                        onDragOver={isDragEnabled ? (e) => dragReorder!.handleDragOver(e, rowKey) : undefined}
                        onDragLeave={isDragEnabled ? dragReorder!.handleDragLeave : undefined}
                        onDrop={isDragEnabled ? (e) => dragReorder!.handleDrop(e, rowKey) : undefined}
                        onDragEnd={isDragEnabled ? dragReorder!.handleDragEnd : undefined}
                        style={{
                          borderBottom: insertionEdge === 'bottom'
                            ? `2px solid ${GOLD}`
                            : `1px solid ${SURFACE}`,
                          borderTop: insertionEdge === 'top'
                            ? `2px solid ${GOLD}`
                            : undefined,
                          cursor: renderExpandedRow ? 'pointer' : isDragEnabled ? 'grab' : undefined,
                          backgroundColor: isExpanded
                            ? SURFACE_ALT
                            : insertionEdge
                              ? `${GOLD}08`
                              : undefined,
                          transition: 'background-color 0.15s ease',
                          ...(isDragged ? { opacity: 0.4 } : {}),
                        }}
                        onClick={renderExpandedRow ? () => toggleExpanded(rowKey) : undefined}
                        onKeyDown={renderExpandedRow ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleExpanded(rowKey);
                          }
                        } : undefined}
                      >
                        {hasDragCol && (
                          <td
                            style={{
                              padding: '0.625rem 0 0.625rem 0.75rem',
                              width: '2rem',
                              color: isDragEnabled ? TEXT_MUTED : `${TEXT_MUTED}40`,
                              cursor: isDragEnabled ? 'grab' : 'default',
                            }}
                            title={isDragEnabled ? t.common.dragToReorder : undefined}
                          >
                            <DragHandleIcon size={16} />
                          </td>
                        )}
                        {renderExpandedRow && (
                          <td style={{ padding: '0.625rem 0 0.625rem 1rem', width: '1.5rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                transition: 'transform 0.2s ease',
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                color: TEXT_MUTED,
                                fontSize: '0.75rem',
                              }}
                              aria-hidden="true"
                            >
                              &#9654;
                            </span>
                          </td>
                        )}
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              padding: '0.625rem 1rem',
                              color: NAVY,
                            }}
                          >
                            {col.render
                              ? col.render(row)
                              : (getField(row, col.key) as ReactNode) ?? '—'}
                          </td>
                        ))}
                        {actions && (
                          <td
                            style={{
                              padding: '0.625rem 1rem',
                              textAlign: 'right',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {actions(row)}
                          </td>
                        )}
                      </tr>
                      {renderExpandedRow && (
                        <tr>
                          <td
                            colSpan={totalCols}
                            style={{
                              padding: 0,
                              backgroundColor: SURFACE_ALT,
                              borderBottom: isExpanded ? `1px solid ${SURFACE}` : 'none',
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                transition: 'grid-template-rows 0.2s ease',
                              }}
                            >
                              <div style={{ overflow: 'hidden' }}>
                                {renderExpandedRow(row)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            fontSize: '0.8125rem',
            color: TEXT_MID,
          }}
        >
          <span>
            {sorted.length} {sorted.length !== 1 ? t.common.records : t.common.record}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: CARD,
                color: page === 0 ? TEXT_MUTED : NAVY,
                cursor: page === 0 ? 'default' : 'pointer',
                boxShadow: neu(3),
              }}
            >
              {t.common.prev}
            </button>
            <span aria-live="polite" style={{ padding: '0.375rem 0.5rem' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: CARD,
                color: page >= totalPages - 1 ? TEXT_MUTED : NAVY,
                cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                boxShadow: neu(3),
              }}
            >
              {t.common.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
