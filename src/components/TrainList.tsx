import { useEffect, useState } from 'react';
import { supabase, Train } from '../lib/supabase';
import { Brain as TrainIcon } from 'lucide-react';

export function TrainList() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      const { data, error } = await supabase
        .from('train')
        .select('*')
        .order('train_number');

      if (error) throw error;
      setTrains(data || []);
    } catch (error) {
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading trains...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrainIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Available Trains</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Train Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Train Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available Days
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trains.map((train) => (
              <tr key={train.train_number} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {train.train_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {train.train_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {train.source_station}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {train.destination_station}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {train.available_days}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trains.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No trains available
        </div>
      )}
    </div>
  );
}
