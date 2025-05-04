import React, { useState } from 'react';
import axios from 'axios';

interface Area {
  name: string;
  templateAreaId: number;
  totalTickets: number;
  price: number;
}

interface EventData {
  categoryId: number;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  mapTemplateId: number;
  status: string;
  areas: Area[];
}

const CreateEvent: React.FC = () => {
  const [eventData, setEventData] = useState<EventData>({
    categoryId: 1,
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    mapTemplateId: 1,
    status: 'approved',
    areas: [{ name: '', templateAreaId: 1, totalTickets: 0, price: 0 }],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      const updatedAreas = [...eventData.areas];
      updatedAreas[index] = { ...updatedAreas[index], [name]: value };
      setEventData({ ...eventData, areas: updatedAreas });
    } else {
      setEventData({ ...eventData, [name]: value });
    }
  };

  const addArea = () => {
    setEventData({
      ...eventData,
      areas: [...eventData.areas, { name: '', templateAreaId: 1, totalTickets: 0, price: 0 }],
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'image') setImageFile(files[0]);
      if (name === 'banner') setBannerFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token'); // Giả sử token được lưu trong localStorage
    if (!token) {
      setError('Bạn cần đăng nhập để tạo sự kiện.');
      return;
    }

    const formData = new FormData();
    formData.append('event', JSON.stringify(eventData));
    if (imageFile) formData.append('image', imageFile);
    if (bannerFile) formData.append('banner', bannerFile);

    try {
      const response = await axios.post('http://localhost:8085/api/admin/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      setSuccess(`Sự kiện đã được tạo thành công với ID: ${response.data.eventId}`);
      // Reset form
      setEventData({
        categoryId: 1,
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        mapTemplateId: 1,
        status: 'approved',
        areas: [{ name: '', templateAreaId: 1, totalTickets: 0, price: 0 }],
      });
      setImageFile(null);
      setBannerFile(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tạo sự kiện.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Tạo Sự Kiện Mới</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-gray-700">Tên Sự Kiện</label>
          <input
            type="text"
            name="name"
            value={eventData.name}
            onChange={handleInputChange}
            className="border w-full p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mô Tả</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleInputChange}
            className="border w-full p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Ngày</label>
          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleInputChange}
            className="border w-full p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Thời Gian</label>
          <input
            type="time"
            name="time"
            value={eventData.time}
            onChange={handleInputChange}
            className="border w-full p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Địa Điểm</label>
          <input
            type="text"
            name="location"
            value={eventData.location}
            onChange={handleInputChange}
            className="border w-full p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">ID Danh Mục</label>
          <input
            type="number"
            name="categoryId"
            value={eventData.categoryId}
            onChange={handleInputChange}
            className="border w-full p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">ID Template Bản Đồ</label>
          <input
            type="number"
            name="mapTemplateId"
            value={eventData.mapTemplateId}
            onChange={handleInputChange}
            className="border w-full p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Trạng Thái</label>
          <select
            name="status"
            value={eventData.status}
            onChange={handleInputChange}
            className="border w-full p-2 rounded"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Ảnh Sự Kiện</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            className="border w-full p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Banner Sự Kiện</label>
          <input
            type="file"
            name="banner"
            onChange={handleFileChange}
            className="border w-full p-2 rounded"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2">Khu Vực</h3>
        {eventData.areas.map((area, index) => (
          <div key={index} className="mb-4 border p-4 rounded">
            <div className="mb-2">
              <label className="block text-gray-700">Tên Khu Vực</label>
              <input
                type="text"
                name="name"
                value={area.name}
                onChange={(e) => handleInputChange(e, index)}
                className="border w-full p-2 rounded"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">ID Khu Vực Template</label>
              <input
                type="number"
                name="templateAreaId"
                value={area.templateAreaId}
                onChange={(e) => handleInputChange(e, index)}
                className="border w-full p-2 rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Tổng Số Vé</label>
              <input
                type="number"
                name="totalTickets"
                value={area.totalTickets}
                onChange={(e) => handleInputChange(e, index)}
                className="border w-full p-2 rounded"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Giá Vé</label>
              <input
                type="number"
                name="price"
                value={area.price}
                onChange={(e) => handleInputChange(e, index)}
                className="border w-full p-2 rounded"
                required
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addArea}
          className="bg-blue-500 text-white p-2 rounded mb-4 hover:bg-blue-600"
        >
          Thêm Khu Vực
        </button>
        <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Tạo Sự Kiện
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;