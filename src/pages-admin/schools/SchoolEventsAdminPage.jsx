import React, { useState } from 'react';
import { Search, ChevronDown, Plus, Calendar, MapPin } from 'lucide-react';

const SchoolEventsAdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('newest'); // 'newest' or 'oldest'
  // const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'history' // This state is not used in the current component

  // Sample events data
  const events = [
    {
      id: 1,
      title: 'កីឡា មហាប៊ុនភូមិន្ទរ៉ូ',
      date: '២២ ខែ វិច្ឆិកា ឆ្នាំ២០២៤',
      time: '៦:០០ ព្រឹក -១២:០០ ល្ងាច',
      location: 'សាលមហាប៊ុនភូមិមហាប៊ុនភូមិការនិង'
    },
    {
      id: 2,
      title: 'កីឡា មហាប៊ុនភូមិន្ទរ៉ូ',
      date: '២២ ខែ វិច្ឆិកា ឆ្នាំ២០២៤',
      time: '៦:០០ ព្រឹក -១២:០០ ល្ងាច',
      location: 'សាលមហាប៊ុនភូមិមហាប៊ុនភូមិការនិង'
    },
    {
      id: 3,
      title: 'កីឡា មហាប៊ុនភូមិន្ទរ៉ូ',
      date: '២២ ខែ វិច្ឆិកា ឆ្នាំ២០២៤',
      time: '៦:០០ ព្រឹក -១២:០០ ល្ងាច',
      location: 'សាលមហាប៊ុនភូមិមហាប៊ុនភូមិការនិង'
    },
    {
      id: 4,
      title: 'កីឡា មហាប៊ុនភូមិន្ទរ៉ូ',
      date: '២២ ខែ វិច្ឆិកា ឆ្នាំ២០២៤',
      time: '៦:០០ ព្រឹក -១២:០០ ល្ងាច',
      location: 'សាលមហាប៊ុនភូមិមហាប៊ុនភូមិការនិង'
    }
  ];

  const handleFilterSelect = (filterType) => {
    setSelectedFilter(filterType);
    setFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">ព្រឹត្តិការណ៍សាលា</h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm  p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ស្វែងរក..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filter and Create Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            {/* Filter Dropdown */}
            <div className="relative flex-1 md:flex-initial">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition text-sm font-normal w-full"
              >
                <span>
                  {selectedFilter === 'newest' ? 'ថ្ងៃទីថ្មីបំផុត' : 'ថ្ងៃទីចាស់បំផុត'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-10">
                  <button
                    onClick={() => handleFilterSelect('newest')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    ថ្ងៃទីថ្មីបំផុត
                  </button>
                  <button
                    onClick={() => handleFilterSelect('oldest')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    ថ្ងៃទីចាស់បំផុត
                  </button>
                </div>
              )}
            </div>

            {/* Create Event Button */}
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition text-sm font-normal">
              <Plus className="w-4 h-4" />
              <span>បង្កើតកិច្ចការថ្មី</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {event.title}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{event.date} | {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
              <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition whitespace-nowrap ml-4">
                មើលព័ត៌មានលម្អិត
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolEventsAdminPage;