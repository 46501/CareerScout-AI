import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  types: string[];
  setTypes: (types: string[]) => void;
  location: string;
  setLocation: (location: string) => void;
  experienceLevel: string;
  setExperienceLevel: (level: string) => void;
  sort: string;
  setSort: (sort: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  types: [],
  setTypes: (types) => set({ types }),
  location: 'All Locations',
  setLocation: (location) => set({ location }),
  experienceLevel: 'All Levels',
  setExperienceLevel: (level) => set({ experienceLevel: level }),
  sort: 'Best Match',
  setSort: (sort) => set({ sort })
}));
