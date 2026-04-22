'use client';

import { useState, useTransition } from 'react';
import { CARD, NAVY, GOLD, TEXT_MID, neu } from '@/lib/theme';
import { ChevronDown, ChevronRight, Pencil, Save, X, Plus, Trash2 } from 'lucide-react';
import { updateLineItemStepsAction, deleteLineItemAction } from '@/app/actions/admin/invoices';

interface StepData {
  text: string;
  remarks: string[];
}

interface LineItem {
  id: string;
  label: string;
  description: string;
  steps?: StepData[] | null;
  amountCents: number;
  displayOrder: number;
  sectionType: string | null;
}

interface InvoiceLineItemRowProps {
  item: LineItem;
  invoiceId: string;
  index: number;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const iconBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px',
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '4px',
};

function StepRow({ step, stepNum }: { step: StepData; stepNum: number }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <span style={{ minWidth: '1.5rem', fontSize: '0.75rem', fontWeight: 600, color: NAVY, textAlign: 'right', paddingTop: '1px' }}>
          {stepNum}.
        </span>
        <span style={{ fontSize: '0.8125rem', color: '#222', lineHeight: 1.5 }}>
          {step.text}
        </span>
      </div>
      {step.remarks.length > 0 && (
        <div style={{ paddingLeft: '2.25rem' }}>
          {step.remarks.map((remark, i) => (
            <div key={i} style={{ fontSize: '0.75rem', color: TEXT_MID, lineHeight: 1.4, paddingLeft: '0.5rem', borderLeft: `2px solid ${GOLD}33`, marginBottom: '1px' }}>
              {remark}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditableStepRow({
  step,
  stepNum,
  onChange,
  onRemove,
}: {
  step: StepData;
  stepNum: number;
  onChange: (updated: StepData) => void;
  onRemove: () => void;
}) {
  return (
    <div style={{ marginBottom: '0.625rem', padding: '0.5rem', backgroundColor: 'rgba(27,54,93,0.03)', borderRadius: '6px' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <span style={{ minWidth: '1.5rem', fontSize: '0.75rem', fontWeight: 600, color: NAVY, textAlign: 'right', paddingTop: '6px' }}>
          {stepNum}.
        </span>
        <input
          type="text"
          value={step.text}
          onChange={(e) => onChange({ ...step, text: e.target.value })}
          style={{ flex: 1, fontSize: '0.8125rem', padding: '4px 8px', border: `1px solid ${NAVY}22`, borderRadius: '4px', fontFamily: 'inherit' }}
        />
        <button type="button" onClick={onRemove} style={{ ...iconBtn, color: '#c44' }} title="Remove step">
          <Trash2 size={14} />
        </button>
      </div>
      <div style={{ paddingLeft: '2.25rem', marginTop: '0.25rem' }}>
        {step.remarks.map((remark, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ color: GOLD, fontSize: '0.625rem' }}>*</span>
            <input
              type="text"
              value={remark}
              onChange={(e) => {
                const newRemarks = [...step.remarks];
                newRemarks[i] = e.target.value;
                onChange({ ...step, remarks: newRemarks });
              }}
              style={{ flex: 1, fontSize: '0.75rem', padding: '2px 6px', border: `1px solid ${NAVY}15`, borderRadius: '3px', color: TEXT_MID, fontFamily: 'inherit' }}
            />
            <button
              type="button"
              onClick={() => {
                const newRemarks = step.remarks.filter((_, j) => j !== i);
                onChange({ ...step, remarks: newRemarks });
              }}
              style={{ ...iconBtn, color: '#c44' }}
              title="Remove remark"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...step, remarks: [...step.remarks, ''] })}
          style={{ ...iconBtn, color: GOLD, fontSize: '0.6875rem', marginTop: '2px', gap: '2px' }}
        >
          <Plus size={11} /> remark
        </button>
      </div>
    </div>
  );
}

export default function InvoiceLineItemRow({ item, invoiceId, index }: InvoiceLineItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editSteps, setEditSteps] = useState<StepData[]>([]);
  const [isPending, startTransition] = useTransition();
  const hasSteps = item.steps && item.steps.length > 0;

  function startEdit() {
    setEditSteps(item.steps ? JSON.parse(JSON.stringify(item.steps)) : []);
    setEditing(true);
    setExpanded(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditSteps([]);
  }

  function saveEdit() {
    startTransition(async () => {
      const result = await updateLineItemStepsAction(invoiceId, item.id, editSteps);
      if (result.error) {
        alert(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  function updateStep(idx: number, updated: StepData) {
    const newSteps = [...editSteps];
    newSteps[idx] = updated;
    setEditSteps(newSteps);
  }

  function removeStep(idx: number) {
    setEditSteps(editSteps.filter((_, i) => i !== idx));
  }

  function addStep() {
    setEditSteps([...editSteps, { text: '', remarks: [] }]);
  }

  return (
    <div style={{ backgroundColor: CARD, borderRadius: '8px', boxShadow: neu(3), marginBottom: '0.5rem', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ color: TEXT_MID, fontSize: '0.75rem', minWidth: '1.5rem' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span style={{ color: TEXT_MID, fontSize: '0.75rem', minWidth: '1.5rem' }}>{index + 1}</span>
        <span style={{ flex: 1, fontWeight: 600, color: NAVY, fontSize: '0.875rem' }}>{item.label}</span>
        {hasSteps && (
          <span style={{ padding: '0.125rem 0.375rem', borderRadius: '4px', backgroundColor: `${GOLD}15`, color: GOLD, fontSize: '0.625rem', fontWeight: 600 }}>
            {item.steps!.length} steps
          </span>
        )}
        {item.sectionType && (
          <span style={{ padding: '0.125rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(27,54,93,0.06)', color: TEXT_MID, fontSize: '0.6875rem' }}>
            {item.sectionType}
          </span>
        )}
        <span style={{ fontWeight: 600, color: NAVY, fontSize: '0.875rem' }}>{formatCents(item.amountCents)}</span>
      </button>

      {expanded && (
        <div style={{ padding: '0.5rem 0.75rem 0.75rem 2.5rem', borderTop: '1px solid rgba(27,54,93,0.08)' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {editing ? (
              <>
                <button type="button" onClick={cancelEdit} disabled={isPending} style={{ ...iconBtn, color: TEXT_MID, fontSize: '0.75rem', gap: '3px' }}>
                  <X size={13} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={isPending}
                  style={{ ...iconBtn, color: '#fff', backgroundColor: NAVY, padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', gap: '3px', opacity: isPending ? 0.6 : 1 }}
                >
                  <Save size={13} /> {isPending ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                {hasSteps && (
                  <button type="button" onClick={startEdit} style={{ ...iconBtn, color: NAVY, fontSize: '0.75rem', gap: '3px' }}>
                    <Pencil size={13} /> Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${item.label}"?`)) {
                      startTransition(async () => {
                        const result = await deleteLineItemAction(invoiceId, item.id);
                        if (result.error) alert(result.error);
                      });
                    }
                  }}
                  disabled={isPending}
                  style={{ ...iconBtn, color: '#c44', fontSize: '0.75rem', gap: '3px' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </>
            )}
          </div>

          {editing ? (
            <div>
              {editSteps.map((step, i) => (
                <EditableStepRow
                  key={i}
                  step={step}
                  stepNum={i + 1}
                  onChange={(updated) => updateStep(i, updated)}
                  onRemove={() => removeStep(i)}
                />
              ))}
              <button
                type="button"
                onClick={addStep}
                style={{ ...iconBtn, color: NAVY, fontSize: '0.75rem', gap: '4px', padding: '4px 8px', border: `1px dashed ${NAVY}33`, borderRadius: '4px', width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
              >
                <Plus size={14} /> Add Step
              </button>
            </div>
          ) : hasSteps ? (
            <div style={{ marginTop: '0.25rem' }}>
              {item.steps!.map((step, i) => (
                <StepRow key={i} step={step} stepNum={i + 1} />
              ))}
            </div>
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.8125rem', color: TEXT_MID, lineHeight: 1.5, margin: '0.5rem 0 0', fontFamily: 'inherit' }}>
              {item.description}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
