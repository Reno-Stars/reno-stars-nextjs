'use client';

import { useState, useTransition, useEffect } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { useToast } from '@/components/admin/ToastProvider';
import { updateContactStatus, updateContactNotes } from '@/app/actions/admin/contacts';
import { CARD, NAVY, TEXT_MID, GOLD, neuIn, neu } from '@/lib/theme';
import { truncate } from '@/lib/utils';

const STATUSES = ['new', 'contacted', 'converted', 'rejected'] as const;

interface ContactRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  notes: string | null;
  createdAt: string | Date;
  [key: string]: unknown;
}

interface Props {
  contacts: ContactRow[];
}

export default function ContactsListClient({ contacts }: Props) {
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const filtered = statusFilter === 'all'
    ? contacts
    : contacts.filter((c) => c.status === statusFilter);

  const columns: Column<ContactRow>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone' },
    {
      key: 'message',
      header: 'Message',
      render: (row) => (
        <button
          type="button"
          style={{ cursor: 'pointer', color: NAVY, fontSize: '0.8125rem', background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
          onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
          aria-label={`Expand message from ${row.name}`}
        >
          {truncate(row.message, 50)}
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => {
            const newStatus = e.target.value as typeof STATUSES[number];
            startTransition(async () => {
              const result = await updateContactStatus(row.id, newStatus);
              if (result.error) toast(result.error, 'error');
              else toast('Status updated.');
            });
          }}
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            border: 'none',
            boxShadow: neuIn(2),
            backgroundColor: CARD,
            color: NAVY,
            fontSize: '0.75rem',
            outline: 'none',
          }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: TEXT_MID }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Reset expandedId if the contact no longer exists in the list
  useEffect(() => {
    if (expandedId && !contacts.find((c) => c.id === expandedId)) {
      setExpandedId(null);
    }
  }, [contacts, expandedId]);

  const expandedContact = expandedId ? contacts.find((c) => c.id === expandedId) : null;

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            aria-pressed={statusFilter === s}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: statusFilter === s ? GOLD : CARD,
              color: statusFilter === s ? '#fff' : NAVY,
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: statusFilter === s ? 600 : 400,
              boxShadow: neu(3),
            }}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(row) => row.id}
        searchKeys={['name', 'email', 'phone', 'message']}
        actions={(row) => (
          <button
            type="button"
            onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
            style={{ background: 'none', border: 'none', color: GOLD, cursor: 'pointer', fontSize: '0.8125rem' }}
          >
            {expandedId === row.id ? 'Close' : 'View'}
          </button>
        )}
      />

      {expandedContact && (
        <ContactDetail
          key={expandedContact.id}
          contact={expandedContact}
          onClose={() => setExpandedId(null)}
        />
      )}
    </div>
  );
}

function ContactDetail({ contact, onClose }: { contact: ContactRow; onClose: () => void }) {
  const [notes, setNotes] = useState(contact.notes ?? '');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <div
      style={{
        backgroundColor: CARD,
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: neu(6),
        marginTop: '1rem',
        maxWidth: '600px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ color: NAVY, fontSize: '1rem', fontWeight: 700 }}>{contact.name}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT_MID, cursor: 'pointer' }}>
          Close
        </button>
      </div>
      <div style={{ fontSize: '0.8125rem', color: NAVY, marginBottom: '0.5rem' }}>
        <strong>Email:</strong> {contact.email}
      </div>
      {contact.phone && (
        <div style={{ fontSize: '0.8125rem', color: NAVY, marginBottom: '0.5rem' }}>
          <strong>Phone:</strong> {contact.phone}
        </div>
      )}
      <div style={{ fontSize: '0.8125rem', color: NAVY, marginBottom: '0.5rem' }}>
        <strong>Status:</strong> <StatusBadge status={contact.status} />
      </div>
      <div style={{ fontSize: '0.8125rem', color: NAVY, marginBottom: '1rem' }}>
        <strong>Message:</strong>
        <p style={{ color: TEXT_MID, marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{contact.message}</p>
      </div>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.8125rem', color: NAVY, fontWeight: 600 }}>
        Internal Notes
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          border: 'none',
          boxShadow: neuIn(3),
          backgroundColor: CARD,
          color: NAVY,
          fontSize: '0.875rem',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await updateContactNotes(contact.id, notes);
            if (result.error) toast(result.error, 'error');
            else toast('Notes saved.');
          });
        }}
        style={{
          marginTop: '0.5rem',
          padding: '0.375rem 1rem',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: GOLD,
          color: '#fff',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? 'Saving...' : 'Save Notes'}
      </button>
    </div>
  );
}
