type LoadingState = {
  isVisible: boolean;
  message: string;
};

type Listener = (state: LoadingState) => void;

class LoadingStore {
  private state: LoadingState = {
    isVisible: false,
    message: "잠시만 기다려주세요...",
  };

  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return this.state;
  }

  private setState(newState: Partial<LoadingState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  show(message?: string) {
    this.setState({
      isVisible: true,
      message: message || "잠시만 기다려주세요...",
    });
  }

  hide() {
    this.setState({ isVisible: false });
  }
}

export const loadingStore = new LoadingStore();

export const loading = {
  show: (message?: string) => loadingStore.show(message),
  hide: () => loadingStore.hide(),
};
