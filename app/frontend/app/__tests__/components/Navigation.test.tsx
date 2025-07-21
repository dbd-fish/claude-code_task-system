import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Navigation from '../../components/Navigation';

/**
 * Navigationコンポーネントのテスト
 */
describe('Navigation Component', () => {
  const renderNavigation = () => {
    return render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );
  };

  test('ナビゲーションリンクが正しく表示される', () => {
    renderNavigation();
    
    // ホームリンクが表示されること
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    
    // タスク一覧リンクが表示されること
    expect(screen.getByText('タスク一覧')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'タスク一覧' })).toHaveAttribute('href', '/tasks');
  });

  test('ナビゲーションのスタイルが適用されている', () => {
    renderNavigation();
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // ナビゲーションリンクが存在することを確認
    const homeLink = screen.getByRole('link', { name: 'ホーム' });
    const tasksLink = screen.getByRole('link', { name: 'タスク一覧' });
    
    expect(homeLink).toBeInTheDocument();
    expect(tasksLink).toBeInTheDocument();
  });
});