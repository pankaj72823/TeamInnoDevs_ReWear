import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImageIcon, ShoppingCart, RefreshCw, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ClothesCard = ({ item }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleExchange = () => {
    console.log("Exchange initiated for:", item.id);
    // Implement exchange logic here
  };

  const handleBuyNow = () => {
    console.log("Buy now clicked for:", item.id);
    // Implement payment logic here
  };

  return (
    <>
      <Card 
        className="w-full hover:shadow-md transition-all cursor-pointer border-orange-100"
        onClick={() => setIsDetailOpen(true)}
      >
        <CardHeader className="p-0 aspect-square">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-orange-50 flex items-center justify-center rounded-t-lg">
              <ImageIcon className="w-12 h-12 text-orange-300" />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate text-orange-800">{item.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        </CardContent>
      </Card>

      {/* Detail View Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-orange-600">{item.title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-square bg-orange-50 rounded-lg overflow-hidden">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-orange-300" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700">{item.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="font-medium text-orange-600">Size</p>
                    <p>{item.size || 'Not specified'}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="font-medium text-orange-600">Condition</p>
                    <p>{item.condition || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4 ">
                <Button 
                  variant="outline" 
                  className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                  onClick={handleExchange}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Exchange
                </Button>
                <Button 
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={handleBuyNow}
                >
                  <ShoppingCart className="mr-2 h-4 w-3" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};