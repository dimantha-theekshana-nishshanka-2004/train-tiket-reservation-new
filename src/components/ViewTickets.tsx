import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, RefreshCw } from 'lucide-react';

interface TicketWithDetails {
  ticket_id: string;
  passenger_name: string;
  age: number;
  contact_number: string;
  train_number: string;
  train_name: string;
  journey_date: string;
  ticket_category: string;
  ticket_status: string;
  fare: number;
  booking_date: string;
}

export function ViewTickets() {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket')
        .select(`
          ticket_id,
          journey_date,
          ticket_category,
          ticket_status,
          fare,
          booking_date,
          train_number,
          passenger:passenger_id (
            passenger_name,
            age,
            contact_number
          )
        `)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      const ticketsWithTrains = await Promise.all(
        (data || []).map(async (ticket) => {
          const { data: trainData } = await supabase
            .from('train')
            .select('train_name')
            .eq('train_number', ticket.train_number)
            .single();

          return {
            ticket_id: ticket.ticket_id,
            passenger_name: (ticket.passenger as any)?.passenger_name || 'N/A',
            age: (ticket.passenger as any)?.age || 0,
            contact_number: (ticket.passenger as any)?.contact_number || 'N/A',
            train_number: ticket.train_number,
            train_name: trainData?.train_name || 'Unknown',
            journey_date: ticket.journey_date,
            ticket_category: ticket.ticket_category,
            ticket_status: ticket.ticket_status,
            fare: ticket.fare,
            booking_date: ticket.booking_date,
          };
        })
      );

      setTickets(ticketsWithTrains);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tickets...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Booked Tickets</h2>
        </div>
        <button
          onClick={fetchTickets}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Passenger
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Train
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Journey Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fare
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.ticket_id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-900">
                  {ticket.ticket_id.substring(0, 8)}...
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {ticket.passenger_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Age: {ticket.age} | {ticket.contact_number}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {ticket.train_name}
                  </div>
                  <div className="text-sm text-gray-500">{ticket.train_number}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(ticket.journey_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {ticket.ticket_category}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      ticket.ticket_status
                    )}`}
                  >
                    {ticket.ticket_status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rs {ticket.fare}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-8 text-gray-500">No tickets booked yet</div>
      )}
    </div>
  );
}
