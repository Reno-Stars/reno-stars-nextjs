'use client';

import { useState, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { updateContactStatus, updateContactNotes, deleteContact } from '@/app/actions/admin/contacts';
import { CARD, NAVY, TEXT_MID, GOLD, ERROR, neuIn, neu } from '@/lib/theme';
import { truncate } from '@/lib/utils';
import { CONTACT_STATUSES, type ContactStatus } from '@/lib/admin/form-utils';

interface ContactRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: ContactStatus;
  notes: string | null;
  createdAt: string | Date;
}

interface Props {
  contacts: ContactRow[];
}

export default function ContactsListClient({ contacts }: Props) {
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const initialStatus = searchParams.get('status');
  const [statusFilter, setStatusFilter] = useState<string>(
    initialStatus && CONTACT_STATUSES.includes(initialStatus as ContactStatus) ? initialStatus : 'all'
  );
  const { toast } = useToast();
  const t = useAdminTranslations();

  const filtered = statusFilter === 'all'
    ? contacts
    : contacts.filter((c) => c.status === statusFilter);

  const columns: Column<ContactRow>[] = [
    { key: 'name', header: t.contacts.name, sortable: true },
    { key: 'email', header: t.contacts.email, sortable: true },
    { key: 'phone', header: t.contacts.phone },
    {
      key: 'message',
      header: t.contacts.message,
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
      header: t.contacts.statusLabel,
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => {
            const newStatus = e.target.value as ContactStatus;
            startTransition(async () => {
              const result = await updateContactStatus(row.id, newStatus);
              if (result.error) toast(result.error, 'error');
              else toast(t.contacts.statusUpdated);
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
          {CONTACT_STATUSES.map((s) => (
            <option key={s} value={s}>{t.status[s as keyof typeof t.status]}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'createdAt',
      header: t.contacts.date,
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
        {['all', ...CONTACT_STATUSES].map((s) => (
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
            {s === 'all' ? t.contacts.all : t.status[s as keyof typeof t.status]}
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
            {expandedId === row.id ? t.contacts.close : t.contacts.view}
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const t = useAdminTranslations();

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
          {t.contacts.close}
        </button>
      </div>
      <div style={{ fontSize: '0.8125rem', color: NAVY, marginBottom: '0.5rem' }}>
        <strong>{t.contacts.email}:</strong> {contact.email}
      </div>
      {contact.phone && (
        <div style={{ fontSize: '0.8125rem', color: NAVY, marginBottom: '0.5rem' }}>
          <strong>{t.contacts.phone}:</strong> {contact.phone}
        </div>
      )}
      <div style={{ fontSize: '0.8125rem', color: NAVY, marginBottom: '0.5rem' }}>
        <strong>{t.contacts.statusLabel}:</strong> <StatusBadge status={contact.status} />
      </div>
      <div style={{ fontSize: '0.8125rem', color: NAVY, marginBottom: '1rem' }}>
        <strong>{t.contacts.message}:</strong>
        <p style={{ color: TEXT_MID, marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{contact.message}</p>
      </div>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.8125rem', color: NAVY, fontWeight: 600 }}>
        {t.contacts.internalNotes}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await updateContactNotes(contact.id, notes);
              if (result.error) toast(result.error, 'error');
              else toast(t.contacts.notesSaved);
            });
          }}
          style={{
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
          {isPending ? t.contacts.savingNotes : t.contacts.saveNotes}
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            padding: '0.375rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: ERROR,
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t.contacts.deleteContact}
        </button>
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        title={t.contacts.deleteContact}
        message={t.contacts.deleteMessage}
        confirmLabel={t.common.delete}
        loading={isDeleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          const result = await deleteContact(contact.id);
          setIsDeleting(false);
          if (result.error) {
            toast(result.error, 'error');
          } else {
            toast(t.contacts.deleted);
            setShowDeleteConfirm(false);
            onClose();
          }
        }}
      />
    </div>
  );
}
