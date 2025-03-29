import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Spinner from "../components/Spinner";
import { Link } from "react-router-dom";
import { 
    MdOutlineAddBox, 
    MdViewModule, 
    MdViewList, 
    MdSearch, 
    MdClose, 
    MdFilterList,
    MdSort,
    MdRefresh
} from "react-icons/md";
import BooksTable from "../components/home/BooksTable";
import BooksCard from "../components/home/BooksCard";

const Home = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showType, setShowType] = useState("table");
    const [searchTitle, setSearchTitle] = useState("");
    const [searchYear, setSearchYear] = useState("");
    const [searchAuthor, setSearchAuthor] = useState("");
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [sortField, setSortField] = useState("title");
    const [sortDirection, setSortDirection] = useState("asc");
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:5000/books");
            setBooks(response.data.data);
        } catch (error) {
            setError("Failed to fetch books. Please try again later.");
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [refreshKey]);

    const filteredAndSortedBooks = useMemo(() => {
        let result = books.filter(book => {
            const titleMatch = book.title.toLowerCase().includes(searchTitle.toLowerCase());
            const yearMatch = book.publishYear.toString().includes(searchYear);
            const authorMatch = book.author.toLowerCase().includes(searchAuthor.toLowerCase());
            return titleMatch && yearMatch && authorMatch;
        });

        return result.sort((a, b) => {
            let compareA = a[sortField];
            let compareB = b[sortField];
            
            if (typeof compareA === 'string') {
                compareA = compareA.toLowerCase();
                compareB = compareB.toLowerCase();
            }
            
            if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
            if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [books, searchTitle, searchYear, searchAuthor, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const clearSearch = () => {
        setSearchTitle("");
        setSearchYear("");
        setSearchAuthor("");
    };

    const refreshData = () => {
        setRefreshKey(prev => prev + 1);
    };

    const renderHeader = () => (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                        Books Library
                    </h1>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                            className={`p-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
                                isSearchExpanded 
                                ? 'bg-sky-100 text-sky-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {isSearchExpanded ? <MdClose size={20} /> : <MdSearch size={20} />}
                            <span className="text-sm font-medium">Search</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={refreshData}
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2"
                        >
                            <MdRefresh size={20} />
                            <span className="text-sm font-medium">Refresh</span>
                        </motion.button>
                    </div>
                </div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link 
                        to="/books/create"
                        className="bg-gradient-to-r from-sky-500 to-blue-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:from-sky-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        <MdOutlineAddBox size={24} />
                        <span>Add Book</span>
                    </Link>
                </motion.div>
            </div>
            
            <AnimatePresence>
                {isSearchExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {[
                                { placeholder: "Search by Title", value: searchTitle, setValue: setSearchTitle },
                                { placeholder: "Search by Publish Year", value: searchYear, setValue: setSearchYear },
                                { placeholder: "Search by Author", value: searchAuthor, setValue: setSearchAuthor },
                            ].map(({ placeholder, value, setValue }) => (
                                <div key={placeholder} className="relative">
                                    <input
                                        type="text"
                                        placeholder={placeholder}
                                        className="w-full border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 pl-10"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                    />
                                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                            ))}
                        </div>
                        {(searchTitle || searchYear || searchAuthor) && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={clearSearch}
                                className="w-full bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                                <MdClose size={20} />
                                Clear All Filters
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    const renderViewToggle = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
        >
            <div className="bg-white p-1 rounded-lg shadow-md flex gap-2">
                {[
                    { type: "table", icon: <MdViewList size={20} />, label: "Table View" },
                    { type: "card", icon: <MdViewModule size={20} />, label: "Card View" }
                ].map(({ type, icon, label }) => (
                    <motion.button
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                            showType === type 
                            ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg" 
                            : "bg-transparent text-gray-600 hover:bg-gray-50"
                        }`}
                        onClick={() => setShowType(type)}
                    >
                        {icon}
                        <span className="text-sm font-medium">{label}</span>
                    </motion.button>
                ))}
            </div>
            
            <div className="flex items-center gap-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600"
                >
                    {filteredAndSortedBooks.length} books found
                </motion.div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md text-gray-600 hover:bg-gray-50 transition-colors duration-300"
                >
                    <MdSort size={20} />
                    <span className="text-sm font-medium">
                        Sort by {sortField} ({sortDirection})
                    </span>
                </motion.button>
            </div>
        </motion.div>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Spinner />
                    <p className="text-gray-600">Loading books...</p>
                </div>
            );
        }

        if (error) {
            return (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50 text-red-600 p-4 rounded-lg text-center"
                >
                    {error}
                    <button 
                        onClick={refreshData}
                        className="ml-4 underline hover:text-red-700"
                    >
                        Try again
                    </button>
                </motion.div>
            );
        }

        if (filteredAndSortedBooks.length === 0) {
            return (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <p className="text-gray-600 mb-4">No books found matching your criteria</p>
                    <button 
                        onClick={clearSearch}
                        className="text-sky-600 hover:text-sky-700 underline"
                    >
                        Clear all filters
                    </button>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                {showType === "table" ? (
                    <BooksTable 
                        books={filteredAndSortedBooks}
                        onSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                    />
                ) : (
                    <BooksCard books={filteredAndSortedBooks} />
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {renderHeader()}
                {renderViewToggle()}
                {renderContent()}
            </div>
        </div>
    );
};

export default Home;