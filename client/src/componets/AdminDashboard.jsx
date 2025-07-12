import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from 'axios';
import { Skeleton } from "@/components/ui/skeleton";

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState({
    users: true,
    listings: true,
    stats: true
  });
  const [error, setError] = useState({
    users: '',
    listings: '',
    stats: ''
  });

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard statistics
        const statsResponse = await axios.get('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setStats(statsResponse.data);
        setLoading(prev => ({ ...prev, stats: false }));

        // Fetch users data
        const usersResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users/pending`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log(usersResponse.data);
        setUsers(usersResponse.data);
        setLoading(prev => ({ ...prev, users: false }));

        // Fetch listings data
        const listingsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/items/pending`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setListings(listingsResponse.data);
        setLoading(prev => ({ ...prev, listings: false }));
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError({
            users: err.response?.data?.message || 'Failed to fetch users',
            listings: err.response?.data?.message || 'Failed to fetch listings',
            stats: err.response?.data?.message || 'Failed to fetch stats'
          });
        } else {
          setError({
            users: 'An unexpected error occurred',
            listings: 'An unexpected error occurred',
            stats: 'An unexpected error occurred'
          });
        }
        setLoading({
          users: false,
          listings: false,
          stats: false
        });
      }
    };

    fetchData();
  }, []);

  // Handle user status change
  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      await axios.patch(
        `/api/admin/users/${userId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  // Handle listing status change
  const handleListingStatusChange = async (listingId, newStatus) => {
    try {
      await axios.patch(
        `/api/admin/listings/${listingId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setListings(listings.map(listing => 
        listing._id === listingId ? { ...listing, status: newStatus } : listing
      ));
    } catch (err) {
      console.error('Failed to update listing status:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading.users && loading.listings && loading.stats) {
    return (
      <div className="min-h-screen md:px-24 bg-orange-50 p-6 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:px-24 bg-orange-50 p-6">
      <h1 className="text-3xl font-bold text-orange-800 mb-8">Admin Panel</h1>
      
      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">Manage Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.stats ? (
              <Skeleton className="h-8 w-16" />
            ) : error.stats ? (
              <p className="text-red-500 text-sm">{error.stats}</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-orange-600">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-orange-500">Active users</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">Manage Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.stats ? (
              <Skeleton className="h-8 w-16" />
            ) : error.stats ? (
              <p className="text-red-500 text-sm">{error.stats}</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-orange-600">{stats?.monthlyOrders || 0}</p>
                <p className="text-sm text-orange-500">This month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">Manage Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.stats ? (
              <Skeleton className="h-8 w-16" />
            ) : error.stats ? (
              <p className="text-red-500 text-sm">{error.stats}</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-orange-600">{stats?.totalListings || 0}</p>
                <p className="text-sm text-orange-500">Total listings</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.stats ? (
              <Skeleton className="h-8 w-16" />
            ) : error.stats ? (
              <p className="text-red-500 text-sm">{error.stats}</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-orange-600">{stats?.todayActivity || 0}</p>
                <p className="text-sm text-orange-500">New today</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-orange-800 mb-4">Manage Users</h2>
        <Card className="border-orange-200">
          <CardContent className="p-0">
            {loading.users ? (
              <div className="p-6">
                <Skeleton className="h-96 w-full" />
              </div>
            ) : error.users ? (
              <div className="p-6 text-red-500">{error.users}</div>
            ) : (
              <Table>
                <TableHeader className="bg-orange-100">
                  <TableRow>
                    <TableHead className="text-orange-800">Name</TableHead>
                    <TableHead className="text-orange-800">Email</TableHead>
                    <TableHead className="text-orange-800">Phone</TableHead>
                    <TableHead className="text-orange-800">Status</TableHead>
                    <TableHead className="text-orange-800">Joined</TableHead>
                    <TableHead className="text-orange-800 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>
                        <select
                          value={user.status}
                          onChange={(e) => handleUserStatusChange(user._id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "Active" 
                              ? "bg-orange-100 text-orange-800" 
                              : user.status === "Inactive"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Listings Table */}
      <div>
        <h2 className="text-xl font-semibold text-orange-800 mb-4">Manage Listings</h2>
        <Card className="border-orange-200">
          <CardContent className="p-0">
            {loading.listings ? (
              <div className="p-6">
                <Skeleton className="h-96 w-full" />
              </div>
            ) : error.listings ? (
              <div className="p-6 text-red-500">{error.listings}</div>
            ) : (
              <Table>
                <TableHeader className="bg-orange-100">
                  <TableRow>
                    <TableHead className="text-orange-800">Title</TableHead>
                    <TableHead className="text-orange-800">Category</TableHead>
                    <TableHead className="text-orange-800">Status</TableHead>
                    <TableHead className="text-orange-800">Posted</TableHead>
                    <TableHead className="text-orange-800 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing._id}>
                      <TableCell>{listing.title}</TableCell>
                      <TableCell>{listing.category}</TableCell>
                      <TableCell>
                        <select
                          value={listing.status}
                          onChange={(e) => handleListingStatusChange(listing._id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs ${
                            listing.status === "Approved" 
                              ? "bg-green-100 text-green-800" 
                              : listing.status === "Pending"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          <option value="Approved">Approved</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </TableCell>
                      <TableCell>{formatDate(listing.createdAt)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// export const AdminDashboard = () => {

//   // Sample data - replace with real data from your backend
//   const users = [
//     { id: 1, name: "John Doe", email: "john@example.com", status: "Active", joined: "2023-10-15" },
//     { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Active", joined: "2023-09-22" },
//     { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Inactive", joined: "2023-11-05" },
//     { id: 4, name: "Alice Brown", email: "alice@example.com", status: "Active", joined: "2023-10-30" },
//   ];

//   const listings = [
//     { id: 1, title: "Summer Dress", category: "Dresses", status: "Approved", posted: "2023-11-12" },
//     { id: 2, title: "Formal Shirt", category: "Tops", status: "Pending", posted: "2023-11-15" },
//     { id: 3, title: "Denim Jeans", category: "Bottoms", status: "Approved", posted: "2023-11-08" },
//     { id: 4, title: "Winter Coat", category: "Outerwear", status: "Rejected", posted: "2023-11-10" },
//   ];

//   return (
//     <div className="min-h-screen md:px-24 bg-orange-50 p-6">
//       <h1 className="text-3xl font-bold text-orange-800 mb-8">Admin Panel</h1>
      
//       {/* Management Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <Card className="border-orange-200">
//           <CardHeader>
//             <CardTitle className="text-orange-700">Manage Users</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-orange-600">24</p>
//             <p className="text-sm text-orange-500">Active users</p>
//           </CardContent>
//         </Card>

//         <Card className="border-orange-200">
//           <CardHeader>
//             <CardTitle className="text-orange-700">Manage Orders</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-orange-600">56</p>
//             <p className="text-sm text-orange-500">This month</p>
//           </CardContent>
//         </Card>

//         <Card className="border-orange-200">
//           <CardHeader>
//             <CardTitle className="text-orange-700">Manage Listings</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-orange-600">112</p>
//             <p className="text-sm text-orange-500">Total listings</p>
//           </CardContent>
//         </Card>

//         <Card className="border-orange-200">
//           <CardHeader>
//             <CardTitle className="text-orange-700">Recent Activity</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-orange-600">8</p>
//             <p className="text-sm text-orange-500">New today</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Users Table */}
//       <div className="mb-12">
//         <h2 className="text-xl font-semibold text-orange-800 mb-4">Manage Users</h2>
//         <Card className="border-orange-200">
//           <CardContent className="p-0">
//             <Table>
//               <TableHeader className="bg-orange-100">
//                 <TableRow>
//                   <TableHead className="text-orange-800">ID</TableHead>
//                   <TableHead className="text-orange-800">Name</TableHead>
//                   <TableHead className="text-orange-800">Email</TableHead>
//                   <TableHead className="text-orange-800">Status</TableHead>
//                   <TableHead className="text-orange-800">Joined</TableHead>
//                   <TableHead className="text-orange-800 text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {users.map((user) => (
//                   <TableRow key={user.id}>
//                     <TableCell>{user.id}</TableCell>
//                     <TableCell>{user.name}</TableCell>
//                     <TableCell>{user.email}</TableCell>
//                     <TableCell>
//                       <span className={`px-2 py-1 rounded-full text-xs ${
//                         user.status === "Active" 
//                           ? "bg-orange-100 text-orange-800" 
//                           : "bg-gray-100 text-gray-800"
//                       }`}>
//                         {user.status}
//                       </span>
//                     </TableCell>
//                     <TableCell>{user.joined}</TableCell>
//                     <TableCell className="text-right space-x-2">
//                       <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
//                         Details
//                       </Button>
//                       <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
//                         Edit
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Listings Table */}
//       <div>
//         <h2 className="text-xl font-semibold text-orange-800 mb-4">Manage Listings</h2>
//         <Card className="border-orange-200">
//           <CardContent className="p-0">
//             <Table>
//               <TableHeader className="bg-orange-100">
//                 <TableRow>
//                   <TableHead className="text-orange-800">ID</TableHead>
//                   <TableHead className="text-orange-800">Title</TableHead>
//                   <TableHead className="text-orange-800">Category</TableHead>
//                   <TableHead className="text-orange-800">Status</TableHead>
//                   <TableHead className="text-orange-800">Posted</TableHead>
//                   <TableHead className="text-orange-800 text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {listings.map((listing) => (
//                   <TableRow key={listing.id}>
//                     <TableCell>{listing.id}</TableCell>
//                     <TableCell>{listing.title}</TableCell>
//                     <TableCell>{listing.category}</TableCell>
//                     <TableCell>
//                       <span className={`px-2 py-1 rounded-full text-xs ${
//                         listing.status === "Approved" 
//                           ? "bg-green-100 text-green-800" 
//                           : listing.status === "Pending"
//                             ? "bg-orange-100 text-orange-800"
//                             : "bg-red-100 text-red-800"
//                       }`}>
//                         {listing.status}
//                       </span>
//                     </TableCell>
//                     <TableCell>{listing.posted}</TableCell>
//                     <TableCell className="text-right space-x-2">
//                       <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
//                         View
//                       </Button>
//                       <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
//                         {listing.status === "Pending" ? "Approve" : "Edit"}
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;