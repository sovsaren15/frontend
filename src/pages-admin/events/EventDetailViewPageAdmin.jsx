import React from 'react';
import { Calendar, MapPin, Facebook, Youtube, Send, Building, Phone } from 'lucide-react';

const EventDetailViewPageAdmin = () => {
  // Event data
  const eventData = {
    title: 'កីឡា មុខឌុបប៊ុនឡាយឡ័រ',
    date: '២២ ខែ វិច្ឆិកា ឆ្នាំ២០២៤',
    time: '៦:០០ ព្រឹក -១២:០០ ល្ងាច',
    location: 'សាលមុខឌុបប៊ុនឡាយការនិង',
    image: 'https://scontent.fpnh11-2.fna.fbcdn.net/v/t39.30808-6/532056529_1191927269627418_318458921145704514_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGkewoBQMf2K9p16NTizcRGDY3MrqoCGgQNjcyuqgIaBJ9p9ORCK5afVyu7zpSA9QxmXqdw0KOgUfAo3PVR8ZmZ&_nc_ohc=nn02SF-wNMIQ7kNvwFF3PEg&_nc_oc=Adn1-dYiKnbXp1FEYRioU7EbTwHkvy6f-vmdCRobYlmpGqlXhIgs2NMsg8zSlT6keqI&_nc_zt=23&_nc_ht=scontent.fpnh11-2.fna&_nc_gid=sDBqQj1W_Chh9aOh4N48jA&oh=00_AffiTFnzGYCclTIlZigDDcbMDM18FJ0WGRFKtsw0UK9w7Q&oe=68E5B68F',
    organizer: 'សាលមុខឌុបប៊ុនឡាយការនិង',
    phone: '012345678',
    description: '"កីឡា មុខឌុបប៊ុនឡាយឡ័រ" គឺជាកម្មវិធី មុខកម្មការកីឡាដែលកម្មពុងកើនឡើងរួច។ ថ្ងៃនេះ សាលរៀនរបស់យើង ដោយសារសាលាដែលដើរការតាមការផ្តល់ដល់កុមារ សម្ភារបានការដឹងតាមការផ្តោះផ្តាយរបស់ប្រទេសយើង ឬកំពុងមាន។'
  };

  return (
    <div className="min-h-screen p-5">
      <div className=" mx-auto  rounded-lg">
        
        {/* Header Section */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {eventData.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{eventData.date} | {eventData.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{eventData.location}</span>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="mb-6">
          <img 
            src={eventData.image}
            alt={eventData.title}
            className="w-full h-auto max-h-96 object-cover rounded-lg"
          />
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              អំពីព្រឹត្តិការណ៍
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {eventData.description}
            </p>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Organizer Info */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">
                រៀបចំដោយ
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{eventData.organizer}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>
                    លេខទូរស័ព្ទ : {eventData.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Links */}
          

          </div>
        </div>
        
        {/* Divider */}
        <hr className="my-6 border-t border-gray-200 border-2" />
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button className="py-2 px-7 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
            លុប
          </button>
          <button className="py-2 px-7 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm">
            កែប្រែ
          </button>
                    <button className="py-2 px-7 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
            ចាកចេញ
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventDetailViewPageAdmin;