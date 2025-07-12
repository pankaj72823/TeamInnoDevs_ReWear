// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";

export function Dashboard(){
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [uploadedClothes, setUploadedClothes] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, clothesResponse, sentResponse, receivedResponse] = await Promise.all([
          mockFetchUserData(),
          mockFetchUploadedClothes(),
          mockFetchSentRequests(),
          mockFetchReceivedRequests()
        ]);

        setUserData(userResponse);
        setUploadedClothes(clothesResponse);
        setSentRequests(sentResponse);
        setReceivedRequests(receivedResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
        Toaster({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteCloth = async (id) => {
    try {
      await mockDeleteCloth(id);
      setUploadedClothes(uploadedClothes.filter(item => item.id !== id));
      Toaster({
        title: "Success",
        description: "Item deleted successfully",
        className: "bg-green-100 border-green-400 text-green-800",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      Toaster({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item",
      });
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      await mockDeleteRequest(id);
      setSentRequests(sentRequests.filter(request => request.id !== id));
      Toaster({
        title: "Success",
        description: "Request deleted successfully",
        className: "bg-green-100 border-green-400 text-green-800",
      });
    } catch (error) {
      console.error("Error deleting request:", error);
      Toaster({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete request",
      });
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await mockRejectRequest(id);
      setReceivedRequests(receivedRequests.map(request => 
        request.id === id ? { ...request, status: 'rejected' } : request
      ));
      Toaster({
        title: "Request Rejected",
        className: "bg-orange-100 border-orange-400 text-orange-800",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      Toaster({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject request",
      });
    }
  };

  const handleAddItem = () => {
    navigate('/add-item');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* User Profile Section */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-800">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-2 border-orange-300">
              <AvatarImage src={userData?.profilePhoto} alt="Profile" />
              <AvatarFallback className="bg-orange-200 text-orange-800">
                {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <div>
                <p className="text-sm text-orange-600">First Name</p>
                <p className="font-medium">{userData?.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-orange-600">Last Name</p>
                <p className="font-medium">{userData?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-orange-600">Email</p>
                <p className="font-medium">{userData?.email}</p>
              </div>
              <div>
                <p className="text-sm text-orange-600">City</p>
                <p className="font-medium">{userData?.city}</p>
              </div>
              <div>
                <p className="text-sm text-orange-600">State</p>
                <p className="font-medium">{userData?.state}</p>
              </div>
              <div>
                <p className="text-sm text-orange-600">Phone</p>
                <p className="font-medium">{userData?.phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Clothes Section */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-orange-800">Your Uploaded Clothes</CardTitle>
            <CardDescription>Items you've listed for exchange</CardDescription>
          </div>
          <Button 
            onClick={handleAddItem}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          {uploadedClothes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-orange-600 mb-4">No clothes uploaded yet</p>
              <Button 
                onClick={handleAddItem}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Add Your First Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {uploadedClothes.map((item) => (
                <ClothCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteCloth} 
                  isOwner={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sent Requests */}
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Your Swap Requests</CardTitle>
            <CardDescription>Requests you've sent to others</CardDescription>
          </CardHeader>
          <CardContent>
            {sentRequests.length === 0 ? (
              <p className="text-orange-600">No sent requests</p>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <RequestCard 
                    key={request.id} 
                    request={request} 
                    type="sent" 
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Received Requests */}
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Received Swap Requests</CardTitle>
            <CardDescription>Requests others sent to you</CardDescription>
          </CardHeader>
          <CardContent>
            {receivedRequests.length === 0 ? (
              <p className="text-orange-600">No received requests</p>
            ) : (
              <div className="space-y-4">
                {receivedRequests.map((request) => (
                  <RequestCard 
                    key={request.id} 
                    request={request} 
                    type="received" 
                    onReject={handleRejectRequest}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Cloth Card Component
const ClothCard = ({ item, onDelete, isOwner }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        <img
          src={item.image}
          alt={item.title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
      </CardHeader>
      {isOwner && (
        <CardFooter className="p-4 pt-0 mt-auto">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(item.id)}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

// Request Card Component
const RequestCard = ({ request, type, onDelete, onReject }) => {
  const statusColors = {
    pending: "bg-orange-100 text-orange-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg border-orange-200 bg-white hover:shadow-sm transition-shadow">
      <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
        <img
          src={request.image}
          alt={request.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{request.title}</h4>
        <p className="text-sm text-gray-600 truncate">
          {type === "sent" ? `To: ${request.toUser}` : `From: ${request.fromUser}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[request.status]}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
        {type === "sent" ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(request.id)}
            className="text-orange-600 hover:bg-orange-50"
          >
            Delete
          </Button>
        ) : request.status === "pending" && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onReject(request.id)}
            className="text-red-600 hover:bg-red-50"
          >
            Reject
          </Button>
        )}
      </div>
    </div>
  );
};

// Mock API functions
const mockFetchUserData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        profilePhoto: "https://randomuser.me/api/portraits/men/1.jpg",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        city: "New York",
        state: "NY",
        phone: "+1 234 567 8901"
      });
    }, 500);
  });
};

const mockFetchUploadedClothes = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          title: "Blue Denim Jacket"
        },
        {
          id: 2,
          image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          title: "White Cotton Shirt"
        },
        {
          id: 3,
          image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          title: "Black Leather Shoes"
        }
      ]);
    }, 500);
  });
};

const mockFetchSentRequests = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
          title: "Red Wool Sweater",
          toUser: "Jane Smith",
          status: "pending"
        },
        {
          id: 2,
          image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
          title: "Brown Leather Belt",
          toUser: "Mike Johnson",
          status: "accepted"
        }
      ]);
    }, 500);
  });
};

const mockFetchReceivedRequests = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
          title: "Gray Hoodie",
          fromUser: "Sarah Williams",
          status: "pending"
        }
      ]);
    }, 500);
  });
};

const mockDeleteCloth = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Deleted item with id: ${id}`);
      resolve();
    }, 300);
  });
};

const mockDeleteRequest = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Deleted request with id: ${id}`);
      resolve();
    }, 300);
  });
};

const mockRejectRequest = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Rejected request with id: ${id}`);
      resolve();
    }, 300);
  });
};

export default Dashboard;