"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, Navigation } from "lucide-react";

interface LocationResult {
  placeId: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: string;
}

interface LocationSearchBarProps {
  onSelectLocation: (lat: number, lng: number, displayName: string) => void;
  className?: string;
}

const QUICK_HUBS = [
  { name: "Kochi", lat: 9.9312, lng: 76.2673 },
  { name: "Trivandrum", lat: 8.5241, lng: 76.9366 },
  { name: "Kozhikode", lat: 11.2588, lng: 75.7804 },
  { name: "Thrissur", lat: 10.5276, lng: 76.2144 },
  { name: "Wayanad", lat: 11.6103, lng: 76.0827 },
  { name: "Kottayam", lat: 9.5916, lng: 76.5222 },
];

export default function LocationSearchBar({
  onSelectLocation,
  className = "",
}: LocationSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLocateMe = () => {
    setLocating(true);

    const applyPos = (lat: number, lng: number, label: string) => {
      setLocating(false);
      setQuery(label);
      onSelectLocation(lat, lng, label);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyPos(pos.coords.latitude, pos.coords.longitude, "Your Current Location");
        },
        async () => {
          // Fallback to IP geolocation
          try {
            const res = await fetch("/api/geolocation");
            if (res.ok) {
              const data = await res.json();
              applyPos(data.latitude, data.longitude, `${data.city}, ${data.region}`);
              return;
            }
          } catch (e) {
            // Ignore
          }
          applyPos(9.9816, 76.3264, "Kochi, Kerala (Default)");
        },
        { enableHighAccuracy: false, timeout: 4000 }
      );
    } else {
      fetch("/api/geolocation")
        .then((r) => r.json())
        .then((data) => applyPos(data.latitude, data.longitude, `${data.city}, ${data.region}`))
        .catch(() => applyPos(9.9816, 76.3264, "Kochi, Kerala (Default)"));
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Geocoding lookup error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  };

  const handleSelect = (item: LocationResult) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelectLocation(item.lat, item.lng, item.displayName);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Bar Input */}
      <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl border border-warm-border shadow-card hover:border-copper/60 transition-all">
        <div className="pl-4 pr-2 text-charcoal/50 flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-copper" />
          ) : (
            <Search className="w-4 h-4 text-charcoal/60" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search place, PIN, address, or lat,lng..."
          className="w-full py-3 pr-9 text-xs sm:text-sm font-sans bg-transparent text-charcoal placeholder-charcoal/40 focus:outline-none"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 rounded-full text-charcoal/40 hover:text-charcoal hover:bg-warm-grey transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Kerala Hub Pills & Live Location */}
      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar text-[11px] font-sans">
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="px-2.5 py-1 rounded-lg bg-copper-subtle border border-copper/40 text-copper hover:bg-copper hover:text-white transition-all shrink-0 font-medium flex items-center gap-1 shadow-xs disabled:opacity-50"
          title="Detect my location on the map"
        >
          {locating ? (
            <Loader2 className="w-3 h-3 animate-spin text-copper" />
          ) : (
            <Navigation className="w-3 h-3" />
          )}
          <span>{locating ? "Locating..." : "Locate Me"}</span>
        </button>

        <span className="text-[10px] tracking-wider uppercase text-charcoal/40 font-semibold shrink-0 pl-1">
          Hubs:
        </span>
        {QUICK_HUBS.map((hub) => (
          <button
            key={hub.name}
            onClick={() => {
              setQuery(hub.name);
              onSelectLocation(hub.lat, hub.lng, `${hub.name}, Kerala, India`);
            }}
            className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm border border-warm-border text-charcoal/70 hover:border-copper hover:text-copper transition-all shrink-0 font-medium"
          >
            {hub.name}
          </button>
        ))}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-warm-border shadow-floating overflow-hidden z-50 animate-fadeIn max-h-72 overflow-y-auto">
          <div className="p-1.5 space-y-1">
            {results.map((item) => (
              <button
                key={item.placeId}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-copper-subtle/60 flex items-start gap-3 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-warm-grey text-charcoal/60 group-hover:bg-copper group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-charcoal group-hover:text-copper transition-colors truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-charcoal/50 truncate font-sans">
                    {item.displayName}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

