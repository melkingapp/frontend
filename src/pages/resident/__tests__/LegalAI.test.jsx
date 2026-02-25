import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ResidentLegalAI from '../LegalAI';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mocks
jest.mock('lucide-react', () => ({
  Send: () => 'SendIcon',
  Download: () => 'DownloadIcon',
  Loader2: () => 'LoaderIcon',
  Sparkles: () => 'SparklesIcon',
  MessageSquare: () => 'MessageSquareIcon',
  Menu: () => 'MenuIcon',
  X: () => 'XIcon',
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('../../../shared/components/legalAI/ChatMessage', () => () => <div data-testid="chat-message">Message</div>);
jest.mock('../../../shared/components/legalAI/ChatSidebar', () => () => <div data-testid="chat-sidebar">Sidebar</div>);
jest.mock('../../../shared/components/legalAI/SuggestedQuestions', () => () => <div data-testid="suggested-questions">Suggested Questions</div>);
jest.mock('../../../shared/services/legalAIService', () => ({
  legalAIService: {
    askQuestion: jest.fn(),
  },
}));

describe('ResidentLegalAI Security Fix', () => {
  let localStorageMock = {};
  let sessionStorageMock = {};
  let store;

  beforeEach(() => {
    localStorageMock = {};
    sessionStorageMock = {};

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => localStorageMock[key] || null),
        setItem: jest.fn((key, value) => { localStorageMock[key] = value.toString(); }),
        removeItem: jest.fn((key) => { delete localStorageMock[key]; }),
        clear: jest.fn(() => { localStorageMock = {}; }),
      },
      writable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key) => sessionStorageMock[key] || null),
        setItem: jest.fn((key, value) => { sessionStorageMock[key] = value.toString(); }),
        removeItem: jest.fn((key) => { delete sessionStorageMock[key]; }),
        clear: jest.fn(() => { sessionStorageMock = {}; }),
      },
      writable: true,
    });

    // Mock Redux Store
    store = configureStore({
      reducer: {
        buildings: () => ({ selectedResidentBuilding: { id: 1, title: 'Test Building' } }),
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => render(
    <Provider store={store}>
      <ResidentLegalAI />
    </Provider>
  );

  it('migrates chats from localStorage to sessionStorage on mount', async () => {
    const mockChats = [{ id: 1, title: 'Test Chat', messages: [] }];
    localStorageMock['resident_legalAI_chats'] = JSON.stringify(mockChats);

    renderComponent();

    await waitFor(() => {
      // Check if sessionStorage has the data
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('resident_legalAI_chats', JSON.stringify(mockChats));
      // Check if localStorage is cleared
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('resident_legalAI_chats');
    });
  });

  it('loads chats from sessionStorage', async () => {
    const mockChats = [{ id: 2, title: 'Session Chat', messages: [] }];
    sessionStorageMock['resident_legalAI_chats'] = JSON.stringify(mockChats);

    renderComponent();

    await waitFor(() => {
      expect(window.sessionStorage.getItem).toHaveBeenCalledWith('resident_legalAI_chats');
    });
  });

  it('does NOT write to localStorage (security check)', async () => {
    renderComponent();

    // Ensure localStorage.setItem is NOT called for 'resident_legalAI_chats'
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith('resident_legalAI_chats', expect.anything());
  });
});
