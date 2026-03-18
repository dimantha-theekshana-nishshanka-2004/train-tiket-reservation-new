import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { XCircle, AlertCircle } from 'lucide-react';

export function CancelTicket() {
  const [ticketId, setTicketId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: ticket, error: ticketError } = await supabase
        .from('ticket')
        .select('*')
        .eq('ticket_id', ticketId)
        .maybeSingle();

      if (ticketError) throw ticketError;

      if (!ticket) {
        setMessage({ type: 'error', text: 'Ticket not found!' });
        setLoading(false);
        return;
      }

      if (ticket.ticket_status === 'Cancelled') {
        setMessage({ type: 'error', text: 'This ticket has already been cancelled!' });
        setLoading(false);
        return;
      }

      const wasConfirmed = ticket.ticket_status === 'Confirmed';

      const { error: updateError } = await supabase
        .from('ticket')
        .update({ ticket_status: 'Cancelled' })
        .eq('ticket_id', ticketId);

      if (updateError) throw updateError;

      if (wasConfirmed) {
        const { data: statusData } = await supabase
          .from('train_status')
          .select('*')
          .eq('train_number', ticket.train_number)
          .eq('journey_date', ticket.journey_date)
          .maybeSingle();

        if (statusData) {
          await supabase
            .from('train_status')
            .update({ booked_seats: Math.max(0, statusData.booked_seats - 1) })
            .eq('status_id', statusData.status_id);
        }

        const { data: waitingTickets } = await supabase
          .from('ticket')
          .select('*')
          .eq('train_number', ticket.train_number)
          .eq('journey_date', ticket.journey_date)
          .eq('ticket_category', ticket.ticket_category)
          .eq('ticket_status', 'Waiting')
          .order('booking_date', { ascending: true })
          .limit(1);

        if (waitingTickets && waitingTickets.length > 0) {
          const firstWaiting = waitingTickets[0];

          await supabase
            .from('ticket')
            .update({ ticket_status: 'Confirmed' })
            .eq('ticket_id', firstWaiting.ticket_id);

          if (statusData) {
            await supabase
              .from('train_status')
              .update({ booked_seats: statusData.booked_seats })
              .eq('status_id', statusData.status_id);
          }

          setMessage({
            type: 'success',
            text: `Ticket cancelled successfully! Waiting ticket ${firstWaiting.ticket_id} has been confirmed.`,
          });
        } else {
          setMessage({ type: 'success', text: 'Ticket cancelled successfully!' });
        }
      } else {
        setMessage({ type: 'success', text: 'Ticket cancelled successfully!' });
      }

      setTicketId('');
    } catch (error) {
      console.error('Cancellation error:', error);
      setMessage({ type: 'error', text: 'Failed to cancel ticket. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <XCircle className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">Cancel Ticket</h2>
      </div>

      <form onSubmit={handleCancel} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ticket ID
          </label>
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="Enter ticket ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Cancelling...' : 'Cancel Ticket'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{message.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
