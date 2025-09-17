import React from 'react';
import MenuBar from './MenuBar';
import './TitleBar.css';

/**
 * 自定义标题栏组件
 * 提供窗口控制按钮、拖拽功能和菜单栏
 */
const TitleBar = ({ excalidrawAPI }) => {
  // 检查是否在 Tauri 环境中
  console.log(window)
  const isTauri = typeof window !== 'undefined' && window.isTauri;
  
  // 获取当前窗口实例（仅在 Tauri 环境中）
  const getCurrentWindowSafe = async () => {
    if (!isTauri) return null;
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return getCurrentWindow();
  };



  // 最小化窗口
  const handleMinimize = async () => {
    if (!isTauri) return;
    try {
      const currentWindow = await getCurrentWindowSafe();
      if (currentWindow) {
        await currentWindow.minimize();
      }
    } catch (error) {
      console.error('最小化窗口失败:', error);
    }
  };

  // 最大化/还原窗口
  const handleMaximize = async () => {
    if (!isTauri) return;
    try {
      const currentWindow = await getCurrentWindowSafe();
      if (currentWindow) {
        const isMaximized = await currentWindow.isMaximized();
        if (isMaximized) {
          await currentWindow.unmaximize();
        } else {
          await currentWindow.maximize();
        }
      }
    } catch (error) {
      console.error('最大化/还原窗口失败:', error);
    }
  };

  // 关闭窗口
  const handleClose = async () => {
    if (!isTauri) return;
    try {
      const currentWindow = await getCurrentWindowSafe();
      if (currentWindow) {
        await currentWindow.close();
      }
    } catch (error) {
      console.error('关闭窗口失败:', error);
    }
  };

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-content">
        <div className="titlebar-title">
          <span>Excalidraw Desktop</span>
        </div>
        
        <div className="titlebar-menu">
          <MenuBar excalidrawAPI={excalidrawAPI} />
        </div>
        
        <div className="titlebar-controls">
          <button 
            className="titlebar-button minimize" 
            onClick={handleMinimize}
            title="最小化"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="2" y="5" width="8" height="2" fill="currentColor" />
            </svg>
          </button>
          
          <button 
            className="titlebar-button maximize" 
            onClick={handleMaximize}
            title="最大化"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="2" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </button>
          
          <button 
            className="titlebar-button close" 
            onClick={handleClose}
            title="关闭"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;