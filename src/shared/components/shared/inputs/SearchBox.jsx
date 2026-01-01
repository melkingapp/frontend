import { Search } from "lucide-react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    return (
        <div className="relative w-full my-4">
            <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
                aria-hidden="true"
            />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-label="جستجو"
                className="w-full pl-3 pr-10 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold"
            />
        </div>
    );
}
