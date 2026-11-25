import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createEventRequest, getEventRequest, updateEventRequest } from '../api/events.js';
import { listTemplatesRequest } from '../api/templates.js';
import ConflictWarning from '../components/calendar/ConflictWarning.jsx';
import Loader from '../components/common/Loader.jsx';
import EventForm from '../components/events/EventForm.jsx';

export default function EventCreate() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const defaultDate = searchParams.get('date') || '';

  const [initialEvent, setInitialEvent] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingPayload, setPendingPayload] = useState(null);
  const [clashes, setClashes] = useState(null);

  useEffect(() => {
    if (!isEdit) {
      listTemplatesRequest()
        .then((data) => setTemplates(data))
        .catch(() => { });
      return;
    }
    getEventRequest(id)
      .then((ev) => setInitialEvent(ev))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const saveEvent = async (payload, force = false) => {
    setSubmitting(true);
    setError('');
    try {
      const saved = isEdit
        ? await updateEventRequest(id, payload, { force })
        : await createEventRequest(payload, { force });
      setClashes(null);
      setPendingPayload(null);
      navigate(`/events/${saved._id}`);
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.clashes) {
        setPendingPayload(payload);
        setClashes(err.response.data.clashes);
      } else {
        setError(err.response?.data?.message || 'Failed to save event');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading event..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link
          to={isEdit ? `/events/${id}` : '/calendar'}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {isEdit ? 'Edit event' : 'Create event'}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Times are entered in IST and stored in UTC. Conflicts are checked automatically.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-gdg-red/30 bg-gdg-red/10 px-4 py-3 text-sm text-gdg-red">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <EventForm
          initialEvent={initialEvent}
          defaultDate={defaultDate}
          templates={templates}
          onSubmit={(payload) => saveEvent(payload, false)}
          submitting={submitting}
          submitLabel={isEdit ? 'Update event' : 'Create event'}
        />
      </div>

      <ConflictWarning
        clashes={clashes}
        saving={submitting}
        onCancel={() => {
          setClashes(null);
          setPendingPayload(null);
        }}
        onForceSave={() => pendingPayload && saveEvent(pendingPayload, true)}
      />
    </div>
  );
}

