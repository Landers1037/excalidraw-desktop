import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './TitleBar.css';

/**
 * 自定义标题栏组件
 * 提供窗口控制按钮和拖拽功能
 */
const TitleBar = () => {
  // 获取当前窗口实例
  const currentWindow = getCurrentWindow();

  // 开始拖拽窗口
  const handleStartDrag = async (e) => {
    // 防止在按钮上触发拖拽
    if (e.target.closest('.titlebar-button')) {
      return;
    }
    try {
      await currentWindow.startDragging();
    } catch (error) {
      console.error('开始拖拽失败:', error);
    }
  };

  // 最小化窗口
  const handleMinimize = async () => {
    try {
      await currentWindow.minimize();
    } catch (error) {
      console.error('最小化窗口失败:', error);
    }
  };

  // 最大化/还原窗口
  const handleMaximize = async () => {
    try {
      const isMaximized = await currentWindow.isMaximized();
      if (isMaximized) {
        await currentWindow.unmaximize();
      } else {
        await currentWindow.maximize();
      }
    } catch (error) {
      console.error('最大化/还原窗口失败:', error);
    }
  };

  // 关闭窗口
  const handleClose = async () => {
    try {
      await currentWindow.close();
    } catch (error) {
      console.error('关闭窗口失败:', error);
    }
  };

  return (
    <div className="titlebar" onMouseDown={handleStartDrag}>
      <div className="titlebar-content">
        <div className="titlebar-title">
          <span>Excalidraw Desktop</span>
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