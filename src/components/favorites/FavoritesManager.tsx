'use client';

import { useState, useEffect } from 'react';
import { 
  Star, 
  Heart, 
  Bookmark,
  Folder,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  Download,
  Share2,
  FolderPlus,
  Tag,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import type { CompetitorData } from '@/types';

interface Favorite {
  id: string;
  toolId: string;
  tool: CompetitorData;
  notes: string;
  tags: string[];
  folderId?: string;
  addedAt: string;
  lastViewed?: string;
  rating?: number;
}

interface FavoriteFolder {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  toolCount: number;
}

interface FavoritesManagerProps {
  currentTool?: CompetitorData;
  onToolSelect?: (tool: CompetitorData) => void;
}

export function FavoritesManager({ 
  currentTool,
  onToolSelect 
}: FavoritesManagerProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'rating'>('date');
  
  // Load from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('gapFinderFavorites');
    const savedFolders = localStorage.getItem('gapFinderFolders');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    } else {
      // Default folders
      setFolders([
        {
          id: 'high-potential',
          name: 'High Potential',
          description: 'Tools with great market opportunities',
          color: 'green',
          icon: 'star',
          createdAt: new Date().toISOString(),
          toolCount: 0
        },
        {
          id: 'quick-wins',
          name: 'Quick Wins',
          description: 'Easy to implement alternatives',
          color: 'blue',
          icon: 'zap',
          createdAt: new Date().toISOString(),
          toolCount: 0
        },
        {
          id: 'research',
          name: 'Research',
          description: 'Tools to investigate further',
          color: 'purple',
          icon: 'search',
          createdAt: new Date().toISOString(),
          toolCount: 0
        }
      ]);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('gapFinderFavorites', JSON.stringify(favorites));
    
    // Update folder counts
    const updatedFolders = folders.map(folder => ({
      ...folder,
      toolCount: favorites.filter(f => f.folderId === folder.id).length
    }));
    setFolders(updatedFolders);
    localStorage.setItem('gapFinderFolders', JSON.stringify(updatedFolders));
  }, [favorites]);

  // Check if current tool is favorited
  const isFavorited = currentTool ? 
    favorites.some(f => f.toolId === currentTool.id) : false;

  // Toggle favorite
  const toggleFavorite = (tool: CompetitorData) => {
    if (favorites.some(f => f.toolId === tool.id)) {
      setFavorites(favorites.filter(f => f.toolId !== tool.id));
    } else {
      const newFavorite: Favorite = {
        id: `fav-${Date.now()}`,
        toolId: tool.id,
        tool,
        notes: '',
        tags: [],
        folderId: selectedFolder || undefined,
        addedAt: new Date().toISOString()
      };
      setFavorites([...favorites, newFavorite]);
    }
  };

  // Update favorite
  const updateFavorite = (id: string, updates: Partial<Favorite>) => {
    setFavorites(favorites.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  // Create folder
  const createFolder = (name: string, description: string, color: string, icon: string) => {
    const newFolder: FavoriteFolder = {
      id: `folder-${Date.now()}`,
      name,
      description,
      color,
      icon,
      createdAt: new Date().toISOString(),
      toolCount: 0
    };
    setFolders([...folders, newFolder]);
    setIsCreatingFolder(false);
  };

  // Delete folder
  const deleteFolder = (folderId: string) => {
    setFolders(folders.filter(f => f.id !== folderId));
    // Remove folder association from favorites
    setFavorites(favorites.map(f => 
      f.folderId === folderId ? { ...f, folderId: undefined } : f
    ));
  };

  // Get all unique tags
  const allTags = Array.from(new Set(favorites.flatMap(f => f.tags)));

  // Filter favorites
  const filteredFavorites = favorites
    .filter(f => !selectedFolder || f.folderId === selectedFolder)
    .filter(f => !searchQuery || 
      f.tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(f => selectedTags.length === 0 || 
      selectedTags.every(tag => f.tags.includes(tag))
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return a.tool.name.localeCompare(b.tool.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

  // Export favorites
  const exportFavorites = () => {
    const data = {
      favorites,
      folders,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gap-finder-favorites.json';
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            My Favorites ({favorites.length})
          </h2>
          
          <div className="flex items-center gap-2">
            {currentTool && (
              <button
                onClick={() => toggleFavorite(currentTool)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorited 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            )}
            
            <button
              onClick={exportFavorites}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Export Favorites"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Folders */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-gray-700">Collections</h3>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !selectedFolder 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({favorites.length})
          </button>
          
          {folders.map(folder => (
            <div key={folder.id} className="relative group">
              <button
                onClick={() => setSelectedFolder(folder.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedFolder === folder.id 
                    ? `bg-${folder.color}-600 text-white` 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedFolder === folder.id ? 
                    getColorValue(folder.color) : undefined
                }}
              >
                {getFolderIcon(folder.icon)}
                {folder.name} ({folder.toolCount})
              </button>
              
              <button
                onClick={() => deleteFolder(folder.id)}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Create Folder Form */}
        {isCreatingFolder && (
          <CreateFolderForm
            onSubmit={createFolder}
            onCancel={() => setIsCreatingFolder(false)}
          />
        )}
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search favorites..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Recent</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`px-2 py-1 rounded-full text-xs transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Favorites List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredFavorites.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No favorites yet</p>
            <p className="text-sm mt-1">Start adding tools to your collection</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredFavorites.map(favorite => (
              <FavoriteItem
                key={favorite.id}
                favorite={favorite}
                onUpdate={updateFavorite}
                onRemove={() => setFavorites(favorites.filter(f => f.id !== favorite.id))}
                onSelect={() => onToolSelect?.(favorite.tool)}
                folders={folders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Favorite Item Component
function FavoriteItem({ 
  favorite, 
  onUpdate, 
  onRemove, 
  onSelect,
  folders 
}: {
  favorite: Favorite;
  onUpdate: (id: string, updates: Partial<Favorite>) => void;
  onRemove: () => void;
  onSelect: () => void;
  folders: FavoriteFolder[];
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(favorite.notes);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleSaveNote = () => {
    onUpdate(favorite.id, { notes: noteText });
    setIsEditingNote(false);
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      onUpdate(favorite.id, { 
        tags: [...favorite.tags, newTag.trim()] 
      });
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <button
            onClick={onSelect}
            className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {favorite.tool.name}
          </button>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">{favorite.tool.category}</span>
            <span className="text-xs text-gray-500">{favorite.tool.pricing}</span>
            <span className="text-xs text-gray-400">
              Added {new Date(favorite.addedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Rating */}
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => onUpdate(favorite.id, { rating: star })}
                className="p-0.5"
              >
                <Star className={`h-4 w-4 ${
                  (favorite.rating || 0) >= star 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-gray-300'
                }`} />
              </button>
            ))}
          </div>
          
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-2">
        {isEditingNote ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="Add a note..."
              autoFocus
            />
            <button
              onClick={handleSaveNote}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setIsEditingNote(false);
                setNoteText(favorite.notes);
              }}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingNote(true)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" />
            {favorite.notes || 'Add note'}
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {favorite.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1"
          >
            #{tag}
            <button
              onClick={() => onUpdate(favorite.id, {
                tags: favorite.tags.filter(t => t !== tag)
              })}
              className="hover:text-blue-900"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        {isAddingTag ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              className="px-2 py-0.5 text-xs border border-gray-300 rounded"
              placeholder="Tag..."
              autoFocus
            />
            <button
              onClick={handleAddTag}
              className="p-0.5 text-green-600"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setIsAddingTag(false);
                setNewTag('');
              }}
              className="p-0.5 text-gray-400"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingTag(true)}
            className="px-2 py-0.5 border border-dashed border-gray-300 rounded-full text-xs text-gray-500 hover:border-gray-400"
          >
            <Plus className="h-3 w-3 inline" /> Tag
          </button>
        )}
      </div>

      {/* Folder Assignment */}
      <div className="mt-2">
        <select
          value={favorite.folderId || ''}
          onChange={(e) => onUpdate(favorite.id, { folderId: e.target.value || undefined })}
          className="text-xs px-2 py-1 border border-gray-200 rounded"
        >
          <option value="">No folder</option>
          {folders.map(folder => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Create Folder Form Component
function CreateFolderForm({ 
  onSubmit, 
  onCancel 
}: {
  onSubmit: (name: string, description: string, color: string, icon: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [icon, setIcon] = useState('folder');

  const colors = ['blue', 'green', 'purple', 'red', 'yellow', 'indigo', 'pink', 'gray'];
  const icons = ['folder', 'star', 'heart', 'bookmark', 'tag', 'zap', 'search', 'trending'];

  return (
    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Color</label>
          <div className="flex gap-1">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${
                  color === c ? 'border-gray-900' : 'border-transparent'
                }`}
                style={{ backgroundColor: getColorValue(c) }}
              />
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Icon</label>
          <div className="flex gap-2">
            {icons.map(i => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`p-1.5 rounded border ${
                  icon === i ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {getFolderIcon(i)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (name.trim()) {
                onSubmit(name.trim(), description.trim(), color, icon);
              }
            }}
            className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Create
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-gray-600 text-sm hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getColorValue(color: string): string {
  const colors: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    red: '#ef4444',
    yellow: '#f59e0b',
    indigo: '#6366f1',
    pink: '#ec4899',
    gray: '#6b7280'
  };
  return colors[color] || colors.blue;
}

function getFolderIcon(icon: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    folder: <Folder className="h-4 w-4" />,
    star: <Star className="h-4 w-4" />,
    heart: <Heart className="h-4 w-4" />,
    bookmark: <Bookmark className="h-4 w-4" />,
    tag: <Tag className="h-4 w-4" />,
    zap: <Zap className="h-4 w-4" />,
    search: <Search className="h-4 w-4" />,
    trending: <TrendingUp className="h-4 w-4" />
  };
  return icons[icon] || icons.folder;
}