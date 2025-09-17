import React, { useState } from 'react';
import { Menu } from '@headlessui/react';
import './MenuBar.css';

/**
 * 菜单栏组件
 * 提供文件操作、选项设置和帮助信息的菜单功能
 */
const MenuBar = ({ excalidrawAPI }) => {
  // 检查是否在 Tauri 环境中
  const isTauri = typeof window !== 'undefined' && window.isTauri;
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  // 菜单hover状态管理
  const [openMenu, setOpenMenu] = useState(null);
  
  // 处理菜单hover
  const handleMenuEnter = (menuName) => {
    setOpenMenu(menuName);
  };
  
  const handleMenuLeave = () => {
    // 延迟关闭菜单，给用户时间移动到子菜单
    setTimeout(() => {
      setOpenMenu(null);
    }, 100);
  };
  
  // 处理菜单区域hover，防止菜单意外关闭
  const handleMenuAreaEnter = (menuName) => {
    setOpenMenu(menuName);
  };
  
  // 安全获取 Tauri API
  const getTauriAPIs = async () => {
    if (!isTauri) return null;
    const [{ getCurrentWindow }, { open, save }, { writeTextFile, readTextFile }] = await Promise.all([
      import('@tauri-apps/api/window'),
      import('@tauri-apps/plugin-dialog'),
      import('@tauri-apps/plugin-fs')
    ]);
    return { getCurrentWindow, open, save, writeTextFile, readTextFile };
  };

  // 打开文件 - 使用Excalidraw内置的打开功能
  const handleOpenFile = () => {
    if (excalidrawAPI) {
      // 触发Excalidraw内置的打开文件对话框
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.excalidraw,.json';
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const sceneData = JSON.parse(e.target.result);
              excalidrawAPI.updateScene(sceneData);
            } catch (error) {
              console.error('打开文件失败:', error);
              alert('文件格式错误，请选择有效的Excalidraw文件');
            }
          };
          reader.readAsText(file);
        }
      };
      fileInput.click();
    } else {
      alert('Excalidraw API 未初始化');
    }
  };

  // 保存文件
  const handleSaveFile = async () => {
    if (!isTauri) {
      alert('文件操作仅在桌面应用中可用');
      return;
    }
    
    try {
      const apis = await getTauriAPIs();
      if (!apis) return;
      
      if (!excalidrawAPI) {
        alert('Excalidraw API 未初始化');
        return;
      }

      // 获取当前画布数据
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      
      const sceneData = {
        type: 'excalidraw',
        version: 2,
        source: 'https://excalidraw.com',
        elements: elements,
        appState: {
          gridSize: appState.gridSize,
          viewBackgroundColor: appState.viewBackgroundColor
        }
      };

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `Excalidraw-${timestamp}.excalidraw`;

      // 保存文件
      const filePath = await apis.save({
        defaultPath: fileName,
        filters: [{
          name: 'Excalidraw Files',
          extensions: ['excalidraw']
        }]
      });

      if (filePath) {
        await apis.writeTextFile(filePath, JSON.stringify(sceneData, null, 2));
        alert('文件保存成功!');
      }
    } catch (error) {
      console.error('保存文件失败:', error);
      alert('保存文件失败: ' + error.message);
    }
  };

  // 退出应用
  const handleExit = async () => {
    if (!isTauri) {
      alert('退出功能仅在桌面应用中可用');
      return;
    }
    
    try {
      const apis = await getTauriAPIs();
      if (!apis) return;
      
      // 检查是否需要保存当前工作
      const shouldSave = await confirmSaveBeforeAction('退出前，是否需要保存当前工作？');
      if (shouldSave === null) return; // 用户取消
      
      if (shouldSave) {
        await handleSaveFile();
      }

      // 关闭窗口
      const currentWindow = apis.getCurrentWindow();
      await currentWindow.close();
    } catch (error) {
      console.error('退出失败:', error);
    }
  };

  // 确认保存对话框
  const confirmSaveBeforeAction = (message) => {
    return new Promise((resolve) => {
      const result = confirm(message + '\n\n点击"确定"保存，"取消"不保存，"X"取消操作');
      resolve(result);
    });
  };

  // 显示关于对话框
  const handleAbout = () => {
    setIsAboutOpen(true);
  };

  return (
    <div className="menubar">
      {/* 文件菜单 */}
      <Menu as="div" className="menu-item" onMouseEnter={() => handleMenuEnter('file')} onMouseLeave={handleMenuLeave}>
        <Menu.Button className="menu-button">
          文件
        </Menu.Button>
        {openMenu === 'file' && (
          <Menu.Items static className="menu-dropdown" onMouseEnter={() => handleMenuAreaEnter('file')}>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`menu-dropdown-item ${active ? 'active' : ''}`}
                onClick={handleOpenFile}
              >
                打开文件
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`menu-dropdown-item ${active ? 'active' : ''}`}
                onClick={() => alert('打开文件夹功能待实现')}
              >
                打开文件夹
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`menu-dropdown-item ${active ? 'active' : ''}`}
                onClick={handleSaveFile}
              >
                保存文件
              </button>
            )}
          </Menu.Item>
          <div className="menu-divider"></div>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`menu-dropdown-item ${active ? 'active' : ''}`}
                onClick={handleExit}
              >
                退出
              </button>
            )}
          </Menu.Item>
          </Menu.Items>
        )}
      </Menu>

      {/* 选项菜单 */}
      <Menu as="div" className="menu-item" onMouseEnter={() => handleMenuEnter('options')} onMouseLeave={handleMenuLeave}>
        <Menu.Button className="menu-button">
          选项
        </Menu.Button>
        {openMenu === 'options' && (
          <Menu.Items static className="menu-dropdown" onMouseEnter={() => handleMenuAreaEnter('options')}>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`menu-dropdown-item ${active ? 'active' : ''}`}
                onClick={() => alert('设置功能待实现')}
              >
                设置
              </button>
            )}
          </Menu.Item>
          </Menu.Items>
        )}
      </Menu>

      {/* 帮助菜单 */}
      <Menu as="div" className="menu-item" onMouseEnter={() => handleMenuEnter('help')} onMouseLeave={handleMenuLeave}>
        <Menu.Button className="menu-button">
          帮助
        </Menu.Button>
        {openMenu === 'help' && (
          <Menu.Items static className="menu-dropdown" onMouseEnter={() => handleMenuAreaEnter('help')}>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`menu-dropdown-item ${active ? 'active' : ''}`}
                onClick={handleAbout}
              >
                关于
              </button>
            )}
          </Menu.Item>
          </Menu.Items>
        )}
      </Menu>

      {/* 关于对话框 */}
      {isAboutOpen && (
        <div className="modal-overlay" onClick={() => setIsAboutOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>关于 Excalidraw Desktop</h2>
              <button 
                className="modal-close"
                onClick={() => setIsAboutOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p><strong>项目名称:</strong> Excalidraw Desktop</p>
              <p><strong>版本:</strong> 0.1.0</p>
              <p><strong>GitHub 仓库:</strong> 
                <a href="https://github.com/Landers1037/excalidraw-desktop" target="_blank" rel="noopener noreferrer">
                   https://github.com/Landers1037/excalidraw-desktop
                </a>
              </p>
              <p><strong>技术栈:</strong></p>
              <ul>
                <li>React 18</li>
                <li>Tauri 2.0</li>
                <li>Vite</li>
                <li>Excalidraw</li>
                <li>Headless UI</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;