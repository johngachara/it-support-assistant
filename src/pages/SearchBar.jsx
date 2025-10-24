import { useState } from 'react';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

const SearchBar = ({ onSearch, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        machineType: '',
        preparedBy: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({
            search: searchTerm,
            ...filters
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilters({
            dateFrom: '',
            dateTo: '',
            machineType: '',
            preparedBy: ''
        });
        onSearch({ search: '' });
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
                <div className="flex-1">
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search reports by title, machine, or serial number..."
                        className="w-full"
                    />
                </div>

                <Button
                    type="submit"
                    loading={loading}
                    className="px-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586l-4-4V9.414a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    Filters
                </Button>
            </form>

            {showFilters && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input
                            label="Date From"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        />

                        <Input
                            label="Date To"
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        />

                        <Input
                            label="Machine Type"
                            value={filters.machineType}
                            onChange={(e) => setFilters(prev => ({ ...prev, machineType: e.target.value }))}
                            placeholder="e.g., HP, Dell, Laptop"
                        />

                        <Input
                            label="Prepared By"
                            value={filters.preparedBy}
                            onChange={(e) => setFilters(prev => ({ ...prev, preparedBy: e.target.value }))}
                            placeholder="Enter preparer name"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                        >
                            Clear All
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleSearch}
                            loading={loading}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;