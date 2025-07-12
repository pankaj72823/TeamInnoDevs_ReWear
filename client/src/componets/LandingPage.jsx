import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();
  const categories = ["Tops", "Bottoms", "Formal", "Dresses"];
  const featuredItems = [
    { id: 1, name: "Summer Blouse", category: "Tops" },
    { id: 2, name: "Office Pants", category: "Bottoms" },
    { id: 3, name: "Evening Gown", category: "Dresses" },
    { id: 4, name: "Business Suit", category: "Formal" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
 
      {/* Hero Section */}
      <section className="container mx-auto px-6 md:px-28 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
            Refresh Your Wardrobe <br />
            <span className="text-orange-600">Sustainably</span>
          </h2>
          <p className="text-lg text-gray-600">
            Swap your unused clothes with others and give fashion a second life.
            Join our community of eco-conscious fashion lovers today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700 text-lg py-6"
              onClick={() => navigate('/sign-up')}
            >
              Start Swapping
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-orange-600 border-orange-600 hover:bg-orange-50 text-lg py-6"
              onClick={() => navigate('/browse')}
            >
              Browse Items
            </Button>
          </div>
        </div>
           
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-6 py-12 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 border-orange-200"
              onClick={() => navigate(`/browse?category=${category.toLowerCase()}`)}
            >
              <div className="bg-orange-100 p-4 rounded-full">
                <span className="text-orange-600 text-2xl">
                  {category === "Tops" && "👕"}
                  {category === "Bottoms" && "👖"}
                  {category === "Formal" && "👔"}
                  {category === "Dresses" && "👗"}
                </span>
              </div>
              <span className="font-medium">{category}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Items Carousel */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Items</h2>
        <Carousel className="w-full bg-white max-w-4xl mx-auto">
          <CarouselContent>
            {featuredItems.map((item) => (
              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-4 border border-orange-200 rounded-lg hover:shadow-md ">
                  <img src="https://thebanyantee.com/cdn/shop/files/Black-T-shirt.jpg?v=1721380366" alt="" className="w-full h-80 object-cover rounded-lg mb-4" >
                  </img>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-orange-600 text-sm">{item.category}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Testimonials/Impact Section */}
      <section className="bg-orange-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-8">Our Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl font-bold">1,200+</div>
              <p className="text-orange-100">Items Swapped</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">500+</div>
              <p className="text-orange-100">Happy Members</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">3.5K+</div>
              <p className="text-orange-100">Pounds of Waste Saved</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;