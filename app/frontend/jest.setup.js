// モックのグローバル設定
global.fetch = jest.fn();

// アラートのモック
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// コンソールエラーの抑制（テスト中のログを整理）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: React.createElement'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});