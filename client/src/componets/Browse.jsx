import { useState, useEffect } from 'react';
import { ClothesCard } from './ClothesCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Brows(){
  const navigate = useNavigate();
  const [clothesItems, setClothesItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate API fetch
    const fetchClothes = async () => {
      try {
        // Mock data
        const mockData = [
          {
            id: 1,
            title: 'Vintage Denim Jacket',
            description: 'Classic blue denim jacket with slight distressing',
            image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
            size: 'M',
            condition: 'Good'
          },
          {
            id: 2,
            title: 'Floral Summer Dress',
            description: 'Lightweight dress perfect for warm weather',
            image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680e956?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
            size: 'S',
            condition: 'Like New'
          },
          {
            id: 3,
            title: 'Classic White T-Shirt',
            description: 'Basic cotton t-shirt for everyday wear',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1160&q=80',
            size: 'L',
            condition: 'Fair'
          },
          {
            id: 4,
            title: 'Black Leather Jacket',
            description: 'Genuine leather jacket with zipper details',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
            size: 'XL',
            condition: 'Excellent'
          }
        ];
        
        setClothesItems(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching clothes:', error);
        setLoading(false);
      }
    };
    
    fetchClothes();
  }, []);

  const filteredItems = clothesItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.size === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6 text-orange-600 hover:bg-orange-50"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-orange-600">Browse Clothes</h1>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="Search clothes..."
            className="max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              <SelectItem value="XS">XS</SelectItem>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ClothesCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};