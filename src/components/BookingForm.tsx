import { useState, useEffect } from 'react';
import { supabase, Train } from '../lib/supabase';
import { Ticket as TicketIcon, AlertCircle } from 'lucide-react';

export function BookingForm() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [formData, setFormData] = useState({
    trainNumber: '',
    journeyDate: '',
    passengerName: '',
    age: '',
    address: '',
    contactNumber: '',
    ticketCategory: 'General',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    const { data } = await supabase.from('train').select('*').order('train_number');
    setTrains(data || []);
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);
    return maxDate.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const journeyDate = new Date(formData.journeyDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      journeyDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((journeyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 1 || daysDiff > 7) {
        setMessage({ type: 'error', text: 'Booking is only allowed for the next 1-7 days!' });
        setLoading(false);
        return;
      }

      const { data: passengerData, error: passengerError } = await supabase
        .from('passenger')
        .insert({
          passenger_name: formData.passengerName,
          age: parseInt(formData.age),
          address: formData.address,
          contact_number: formData.contactNumber,
        })
        .select()
        .single();

      if (passengerError) throw passengerError;

      let { data: statusData } = await supabase
        .from('train_status')
        .select('*')
        .eq('train_number', formData.trainNumber)
        .eq('journey_date', formData.journeyDate)
        .maybeSingle();

      if (!statusData) {
        const { data: newStatus, error: statusError } = await supabase
          .from('train_status')
          .insert({
            train_number: formData.trainNumber,
            journey_date: formData.journeyDate,
            total_seats: 20,
            booked_seats: 0,
          })
          .select()
          .single();

        if (statusError) throw statusError;
        statusData = newStatus;
      }

      const { data: categoryTickets } = await supabase
        .from('ticket')
        .select('*')
        .eq('train_number', formData.trainNumber)
        .eq('journey_date', formData.journeyDate)
        .eq('ticket_category', formData.ticketCategory)
        .neq('ticket_status', 'Cancelled');

      const confirmedCount = categoryTickets?.filter(t => t.ticket_status === 'Confirmed').length || 0;
      const waitingCount = categoryTickets?.filter(t => t.ticket_status === 'Waiting').length || 0;

      let ticketStatus = 'Confirmed';
      if (confirmedCount >= 10) {
        if (waitingCount >= 2) {
          setMessage({ type: 'error', text: 'No seats available. Both confirmed and waiting lists are full!' });
          setLoading(false);
          return;
        }
        ticketStatus = 'Waiting';
      }

      const fare = formData.ticketCategory === 'AC' ? 1500 : 500;

      const { data: ticketData, error: ticketError } = await supabase
        .from('ticket')
        .insert({
          passenger_id: passengerData.passenger_id,
          train_number: formData.trainNumber,
          journey_date: formData.journeyDate,
          ticket_category: formData.ticketCategory,
          ticket_status: ticketStatus,
          fare: fare,
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      if (ticketStatus === 'Confirmed') {
        await supabase
          .from('train_status')
          .update({ booked_seats: statusData.booked_seats + 1 })
          .eq('status_id', statusData.status_id);
      }

      setMessage({
        type: 'success',
        text: `Ticket booked successfully! Ticket ID: ${ticketData.ticket_id}\nStatus: ${ticketStatus}\nFare: ₹${fare}`,
      });

      setFormData({
        trainNumber: '',
        journeyDate: '',
        passengerName: '',
        age: '',
        address: '',
        contactNumber: '',
        ticketCategory: 'General',
      });
    } catch (error) {
      console.error('Booking error:', error);
      setMessage({ type: 'error', text: 'Failed to book ticket. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <TicketIcon className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Book Ticket</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Train Number
            </label>
            <select
              value={formData.trainNumber}
              onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Train</option>
              {trains.map((train) => (
                <option key={train.train_number} value={train.train_number}>
                  {train.train_number} - {train.train_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Journey Date
            </label>
            <input
              type="date"
              value={formData.journeyDate}
              onChange={(e) => setFormData({ ...formData, journeyDate: e.target.value })}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passenger Name
            </label>
            <input
              type="text"
              value={formData.passengerName}
              onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              min="1"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Category
            </label>
            <select
              value={formData.ticketCategory}
              onChange={(e) => setFormData({ ...formData, ticketCategory: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="General">General (₹500)</option>
              <option value="AC">AC (₹1500)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Booking...' : 'Book Ticket'}
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
            <p className="whitespace-pre-line">{message.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
