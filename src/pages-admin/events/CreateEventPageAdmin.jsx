import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const CreateEventPageAdmin = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    phoneNumber: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setFormData({
      eventName: '',
      eventType: '',
      date: '',
      time: '',
      location: '',
      organizer: '',
      phoneNumber: ''
    });
    setImagePreview(null);
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen p-3">
      <div className=" mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          បង្កើតព្រឹត្តិការណ៍ថ្មី
        </h1>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <p className="text-sm text-gray-600 mb-6">
            បំពេញព័ត៌មានសម្រាប់ធ្វើការបង្កើតព្រឹត្តិការណ៍ដែលត្រូវការផ្សព្វផ្សាយ
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  ឈ្មោះព្រឹត្តិការណ៍
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  កាលបរិច្ឆេទ
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  placeholder="ថ្ងៃ/ខែ/ឆ្នាំ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  ម៉ោងបើក
                </label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  អាស័យដ្ឋានការណ៍:
                </label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  ទីតាំង
                </label>
                <input
                  type="text"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  អ្នករៀបចំដោយ
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  លេខទំនាក់ទំនងអ្នករៀបចំ
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  រូបភាពព្រឹត្តិការណ៍
                </label>
                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Upload className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400 mb-1">
                        ចុចដើម្បីបញ្ជូលរូបភាព
                      </p>
                      <p className="text-xs text-gray-300">របស់(៣*៤)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-40 border border-gray-300 rounded-md overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={handleCancel}
              className="px-8 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              បោះបង់
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-indigo-900 text-white rounded-md hover:bg-indigo-800 transition"
            >
              រក្សាទុក
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPageAdmin;