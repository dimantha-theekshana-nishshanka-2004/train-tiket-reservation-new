import { useState } from 'react';
import { TrainList } from './components/TrainList';
import { BookingForm } from './components/BookingForm';
import { CancelTicket } from './components/CancelTicket';
import { ViewTickets } from './components/ViewTickets';
import { Brain as Train, Ticket, XCircle, FileText } from 'lucide-react';

type Tab = 'trains' | 'book' | 'cancel' | 'view';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('trains');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-2">
            Train Ticket Reservation System
          </h1>
          <p className="text-center text-gray-600">
            Book, manage, and track your train tickets
          </p>
        </header>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveTab('trains')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'trains'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Train className="w-5 h-5" />
              View Trains
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'book'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Ticket className="w-5 h-5" />
              Book Ticket
            </button>
            <button
              onClick={() => setActiveTab('cancel')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'cancel'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <XCircle className="w-5 h-5" />
              Cancel Ticket
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'view'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              View Tickets
            </button>
          </div>
        </div>

        <main className="max-w-6xl mx-auto">
          {activeTab === 'trains' && <TrainList />}
          {activeTab === 'book' && <BookingForm />}
          {activeTab === 'cancel' && <CancelTicket />}
          {activeTab === 'view' && <ViewTickets />}
        </main>

        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>Train Ticket Reservation System - Powered by Supabase</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
