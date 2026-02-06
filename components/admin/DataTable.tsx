'use client';

import { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
import { CARD, NAVY, TEXT_MID, TEXT_MUTED, GOLD, SURFACE, SURFACE_ALT, neu, neuIn } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
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

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <div>
      {searchable && (
        <div style={{ marginBottom: '1rem' }}>
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
                {renderExpandedRow && <th style={{ width: '1.5rem' }} />}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    tabIndex={col.sortable ? 0 : undefined}
                    role={col.sortable ? 'button' : undefined}
                    aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    onKeyDown={col.sortable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.key); } } : undefined}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      color: TEXT_MUTED,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      outline: 'none',
                      whiteSpace: 'nowrap',
                      width: col.width,
                    }}
                    onFocus={(e) => { if (col.sortable) e.currentTarget.style.outline = `2px solid ${GOLD}`; }}
                    onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span aria-hidden="true" style={{ marginLeft: '0.25rem' }}>
                        {sortDir === 'asc' ? '\u2191' : '\u2193'}
                      </span>
                    )}
                  </th>
                ))}
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
                    colSpan={columns.length + (actions ? 1 : 0) + (renderExpandedRow ? 1 : 0)}
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: TEXT_MUTED,
                    }}
                  >
                    {t.common.noRecords}
                  </td>
                </tr>
              ) : (
                paged.map((row) => {
                  const rowKey = getRowKey(row);
                  const isExpanded = isSearching || expandedKey === rowKey;
                  return (
                    <Fragment key={rowKey}>
                      <tr
                        style={{
                          borderBottom: `1px solid ${SURFACE}`,
                          cursor: renderExpandedRow ? 'pointer' : undefined,
                          backgroundColor: isExpanded ? SURFACE_ALT : undefined,
                          transition: 'background-color 0.15s ease',
                        }}
                        onClick={renderExpandedRow ? () => toggleExpanded(rowKey) : undefined}
                      >
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
                            colSpan={columns.length + (actions ? 1 : 0) + 1}
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
