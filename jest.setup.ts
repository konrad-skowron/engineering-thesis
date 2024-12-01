import '@testing-library/jest-dom'

const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);
window.HTMLElement.prototype.scrollIntoView = () => {};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    };
  },
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
  useParams: jest.fn()
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  arrayUnion: jest.fn((...elements) => elements),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({
        active: true,
        authorName: "Author Name",
        title: "Test survey",
        questions: [
          {
            question: "What is your name?",
            type: "text",
            rangeEnabled: false,
            required: false,
          },
          {
            options: ["Male", "Female"],
            type: "singleChoice",
            required: false,
            rangeEnabled: false,
            question: "What is your gender?",
          },
          {
            options: ["Bad", "Good"],
            type: "continousScale",
            required: false,
            question: "How would you rate your insurance plan?",
            rangeEnabled: false,
          },
        ],
        createdAt: {
          seconds: 1732709744,
          nanoseconds: 168000000,
        },
        description: "Survey description for testing purposes.",
        author: "authorId",
      }),
    })
  ),
}));

