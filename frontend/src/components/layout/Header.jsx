import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, Phone, User, Search } from "lucide-react";
import SearchBar from "../ui/SearchBar";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { id: "phone", name: "Điện thoại" },
    { id: "laptop", name: "Laptop" },
    { id: "tablet", name: "Máy tính bảng" },
    { id: "smartwatch", name: "Đồng hồ thông minh" },
    { id: "accessories", name: "Phụ kiện" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top bar with contact info and account links */}
      <div className="bg-red-600 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Phone size={16} className="mr-1" />
              <span className="text-sm">Hotline: 1900.2091</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/account" className="text-sm flex items-center">
              <User size={16} className="mr-1" />
              <span>Tài khoản</span>
            </Link>
            <Link to="/cart" className="text-sm flex items-center">
              <ShoppingCart size={16} className="mr-1" />
              <span>Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main header with logo and search */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-red-600">
              HoangHaMobile
            </span>
          </Link>

          <div className="hidden md:block w-1/2">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>

            <Link to="/cart" className="relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* Search bar for mobile */}
        <div className="mt-4 md:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Category navigation */}
      <nav className="bg-gray-100">
        <div className="container mx-auto px-4">
          <ul className="flex overflow-x-auto scrollbar-hide py-3 space-x-8">
            {categories.map((category) => (
              <li key={category.id} className="whitespace-nowrap">
                <Link
                  to={`/category/${category.id}`}
                  className="text-gray-800 hover:text-red-600 font-medium"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white h-full w-3/4 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <ul className="space-y-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.id}`}
                    className="block py-2 border-b border-gray-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
