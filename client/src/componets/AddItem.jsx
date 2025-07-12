// import React from 'react'

// export default function AddItem() {
//   return (
//     <div>AddItem</div>
//   )
// }

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function AddItem() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    size: '',
    condition: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const triggerCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real app, you would create a video element to capture frames
      // For simplicity, we'll just trigger the file input here
      triggerFileInput();
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    
    // Append images
    images.forEach((image, index) => {
      data.append(`images`, image.file);
    });
    
    // Append form data
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('size', formData.size);
    data.append('condition', formData.condition);
    
    // Append tags
    tags.forEach(tag => {
      data.append('tags', tag);
    });
    
    try {
      const response = await fetch('http://your-backend-api.com/items', {
        method: 'POST',
        body: data
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Item added successfully:', result);
        // Reset form
        setImages([]);
        setTags([]);
        setFormData({
          title: '',
          description: '',
          category: '',
          size: '',
          condition: ''
        });
        // Navigate to home or show success message
        navigate('/'); // You can change this to your home route
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">Add New Item</h1>
          <Button 
            variant="outline" 
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
            onClick={() => navigate('/')} // Update this route as needed
          >
            Back to Home
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Image Upload Section */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Images</Label>
            <div className="flex flex-wrap gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image.preview} 
                    alt={`Preview ${index}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="bg-orange-100 text-orange-600 hover:bg-orange-200"
                onClick={triggerFileInput}
              >
                Upload from Computer
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-orange-100 text-orange-600 hover:bg-orange-200"
                onClick={triggerCamera}
              >
                Take Photo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
                multiple
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleSelectChange('category', value)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shirts">Shirts</SelectItem>
                <SelectItem value="t-shirts">T-Shirts</SelectItem>
                <SelectItem value="jeans">Jeans</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Size</Label>
            <Select 
              value={formData.size} 
              onValueChange={(value) => handleSelectChange('size', value)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="42">42</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Condition</Label>
            <Select 
              value={formData.condition} 
              onValueChange={(value) => handleSelectChange('condition', value)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="dull">Dull</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="bg-orange-100 text-orange-600 flex items-center gap-1"
                >
                  {tag}
                  <button 
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="bg-orange-100 text-orange-600 hover:bg-orange-200"
                onClick={handleAddTag}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Add Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}