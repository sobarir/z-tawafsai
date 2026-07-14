import '@testing-library/jest-dom';

// cmdk (used by the shadcn Command/Combobox components) observes element
// size via ResizeObserver, which jsdom doesn't implement.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as never;
Element.prototype.scrollIntoView ??= () => {};
