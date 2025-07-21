import '@testing-library/jest-dom';

// モックのグローバル設定
global.fetch = jest.fn();

// React Router のモック
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '1' }),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));

// アラートのモック
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// コンソールエラーの抑制（テスト中のログを整理）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});